/* SIQA-INFOKOM — prototype audit mutu internal berbasis Matriks Penilaian LAM INFOKOM.
 * Tanpa backend: data disimpan di localStorage browser (bisa diekspor/impor sebagai JSON). */
(function () {
  'use strict';

  const M = window.MATRIKS;
  const SEED = window.SEED;
  const KEY = 'siqa-infokom:v1';
  const PPEPP = ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'];
  const JENIS = { I: 'Input', P: 'Proses', O: 'Output' };
  const JENJANG = { S1: 'Sarjana', S2: 'Magister', S3: 'Doktor' };

  // Skala LAM INFOKOM (1–4) dipadankan dengan kategori audit SIQA (Acceptable/Concern/Weakness/Defisiensi).
  const LV = {
    4: { lam: 'Sangat Baik', siqa: 'Acceptable', st: 'Memenuhi', cls: 'acc' },
    3: { lam: 'Baik', siqa: 'Concern', st: 'Memenuhi', cls: 'con' },
    2: { lam: 'Cukup', siqa: 'Weakness', st: 'Tidak memenuhi', cls: 'weak' },
    1: { lam: 'Kurang', siqa: 'Defisiensi', st: 'Tidak memenuhi', cls: 'def' }
  };

  // Survei yang diminta Instrumen LED pada tahap Evaluasi setiap kriteria.
  const SURVEI = {
    K1: 'Survei kepuasan terhadap sistem tata kelola dan fungsi SPMI (responden: dosen, tendik, mahasiswa).',
    K2: 'Survei kepuasan layanan pembelajaran (responden: mahasiswa).',
    K3: 'Survei kepuasan terhadap layanan penelitian (responden: dosen).',
    K4: 'Survei kepuasan terhadap layanan kegiatan PkM (responden: dosen).',
    K5: 'Survei terhadap tata kelola dan tata pamong (responden: dosen, mahasiswa, tendik).',
    K6: 'Survei pemahaman VMTS (responden: dosen, mahasiswa, tendik).'
  };

  // Isian per tahap PPEPP, diturunkan dari Instrumen LED S3 (Bagian Kedua, C. Kriteria).
  const TAHAP = {
    Penetapan: {
      hint: 'Sebutkan dokumen kebijakan, standar, dan indikator yang ditetapkan UPPS/PT (nomor dan tanggal penetapan), termasuk SOP terkait.',
      fields: [{ f: 'indikator', label: 'Standar, indikator, dan target yang ditetapkan' }]
    },
    Pelaksanaan: {
      hint: 'Jelaskan pelaksanaan standar dan indikator dengan merujuk laporan pelaksanaan kegiatan, serta jelaskan isi tabel LKPS terkait kriteria ini.',
      fields: [{ f: 'lkps', label: 'Rujukan tabel LKPS / data kinerja yang mendukung' }]
    },
    Evaluasi: {
      hint: 'Jelaskan evaluasi berkala ketercapaian standar dan indikator, faktor pendukung tercapainya standar, akar masalah yang menyebabkan standar tidak tercapai, serta hasil survei.',
      fields: [
        { f: 'pendukung', label: 'Faktor pendukung tercapai/terlampauinya standar' },
        { f: 'akar', label: 'Akar masalah tidak tercapainya standar (mis. root-cause analysis)' },
        { f: 'survei', label: 'Hasil survei', survei: true }
      ]
    },
    Pengendalian: {
      hint: 'Jelaskan tindak lanjut (revisi dan rekomendasi) terhadap faktor pendukung dan akar masalah hasil evaluasi, baik yang sudah maupun belum terpenuhi.',
      fields: [{ f: 'rtl', label: 'Tindak lanjut / RTL (termasuk keputusan Rapat Tinjauan Manajemen)' }]
    },
    Peningkatan: {
      hint: 'Jelaskan peningkatan/optimalisasi standar dan indikator, baik yang sudah maupun belum terpenuhi.',
      fields: [{ f: 'optimasi', label: 'Standar/indikator yang ditingkatkan beserta target barunya' }]
    },
    'Kekhasan PS': {
      hint: 'Tunjukkan mata kuliah dan kelengkapan RPS yang mencerminkan kekhasan keilmuan program studi.',
      fields: []
    }
  };
  const KONTEKS = {
    A: {
      hint: 'Analisis lingkungan makro (kebijakan, ekonomi, sosial, budaya, iptek; nasional/internasional) dan mikro (pesaing, pengguna lulusan, sumber calon mahasiswa dan dosen, pendanaan, pembelajaran daring, kebutuhan DUDIKA, kemitraan), didukung data sekunder (BPS, dll.).',
      fields: [{ f: 'peluang', label: 'Peluang (opportunities)' }, { f: 'ancaman', label: 'Ancaman (threats)' }]
    },
    B: {
      hint: 'Sajikan ringkas: sejarah, VMTS, organisasi dan tata kerja, mahasiswa dan lulusan, dosen dan tendik, keuangan dan sarpras, sistem penjaminan mutu (siklus PPEPP), serta kinerja unggulan.',
      fields: [{ f: 'kekuatan', label: 'Kekuatan (strengths)' }, { f: 'kelemahan', label: 'Kelemahan (weaknesses)' }]
    }
  };

  /* ---------- State ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function fresh() { return { v: 1, data: clone(SEED.data) }; }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s && s.v === 1 && s.data) return s; } } catch (e) { /* abaikan */ }
    return fresh();
  }
  let S = load();
  let saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    const run = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ } };
    if (now) run(); else saveTimer = setTimeout(run, 300);
  }
  function P(id) {
    const p = S.data[id] || (S.data[id] = {});
    p.meta = p.meta || {}; p.mandiri = p.mandiri || {}; p.audit = p.audit || {};
    return p;
  }
  const penugasan = (id) => SEED.penugasan.find((x) => x.id === id);
  const matriks = (j) => M[j];
  const ui = { kr: 'all', th: 'all', st: 'all', q: '', jj: 'all', gapJ: 'S3' };

  /* ---------- Util ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function fmt(text) {
    const out = []; let ol = null;
    String(text || '').split('\n').forEach((line) => {
      const l = line.trim();
      const m = l.match(/^\d+\.\s+(.*)$/);
      if (m) { if (!ol) { ol = []; } ol.push('<li>' + esc(m[1]) + '</li>'); return; }
      if (ol) { out.push('<ol>' + ol.join('') + '</ol>'); ol = null; }
      if (l) out.push('<p>' + esc(l) + '</p>');
    });
    if (ol) out.push('<ol>' + ol.join('') + '</ol>');
    return '<div class="fmt">' + out.join('') + '</div>';
  }
  const shortEl = (b) => (b.elemen.split('\n').find((l) => l.trim()) || '').replace(/^[A-Z]\.\s*/, '').replace(/^\d+\.\d+\.?\s*/, '');
  const fmtDate = (d) => d ? d.split('-').reverse().join('-') : '—';
  const today = () => new Date().toISOString().slice(0, 10);
  const num = (x, d = 2) => (x == null || isNaN(x)) ? '—' : x.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const kName = (j, k) => (matriks(j).kriteria.find((x) => x.id === k) || {}).nama || k;
  const kLabel = (k) => k === 'K0' ? 'Konteks' : 'K' + k.slice(1);
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function fieldsFor(b) {
    if (b.tahap === 'Konteks') return (KONTEKS[b.kode] || { fields: [] }).fields;
    return (TAHAP[b.tahap] || { fields: [] }).fields;
  }
  function hintFor(b) {
    if (b.tahap === 'Konteks') return (KONTEKS[b.kode] || {}).hint || '';
    return (TAHAP[b.tahap] || {}).hint || '';
  }

  /* ---------- Status & perhitungan ---------- */
  function mStatus(b, m) {
    if (!m) return 'none';
    const narasi = (m.narasi || '').trim();
    if (!narasi && !m.skor && !(m.bukti || []).length) return 'none';
    if (!narasi || !m.skor) return 'part';
    const extra = fieldsFor(b).every((f) => (m[f.f] || '').trim());
    return extra && (m.bukti || []).length ? 'full' : 'part';
  }
  const aStatus = (a) => (a && a.skor ? LV[a.skor].cls : 'none');

  function progress(id) {
    const p = penugasan(id); const bs = matriks(p.jenjang).butir; const d = P(id);
    const r = { n: bs.length, full: 0, part: 0, none: 0, dinilai: 0, acc: 0, con: 0, weak: 0, def: 0 };
    bs.forEach((b) => {
      r[mStatus(b, d.mandiri[b.kode])]++;
      const s = aStatus(d.audit[b.kode]); if (s !== 'none') { r.dinilai++; r[s]++; }
    });
    return r;
  }
  function wavg(list) {
    let w = 0, ws = 0;
    list.forEach(({ b, s }) => { if (s) { w += b.bobot; ws += b.bobot * s; } });
    return w ? ws / w : null;
  }
  function nilai(id) {
    const p = penugasan(id); const mx = matriks(p.jenjang); const A = P(id).audit;
    let ws = 0;
    mx.butir.forEach((b) => { const s = A[b.kode] && A[b.kode].skor; if (s) ws += b.bobot * s; });
    const items = mx.butir.map((b) => ({ b, s: A[b.kode] && A[b.kode].skor }));
    return { proyeksi: ws / (4 * mx.totalBobot) * 400, rerata: wavg(items), totalBobot: mx.totalBobot };
  }

  /* ---------- Router ---------- */
  function route() {
    const [page, id] = location.hash.replace(/^#\/?/, '').split('/');
    document.querySelectorAll('.sidenav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === (page || 'home')));
    const app = document.getElementById('app');
    if ((page === 'mandiri' || page === 'audit' || page === 'rekap') && !penugasan(id)) { location.hash = '#/'; return; }
    // Filter dipertahankan saat berpindah Mandiri ↔ Audit pada unit yang sama, direset bila unit berganti.
    if (id && id !== route.lastId) Object.assign(ui, { kr: 'all', th: 'all', st: 'all', q: '' });
    if (id) route.lastId = id;
    if (page === 'mandiri' || page === 'audit') app.innerHTML = viewWorkspace(page, id);
    else if (page === 'rekap') app.innerHTML = viewRekap(id);
    else if (page === 'panduan') app.innerHTML = viewPanduan();
    else app.innerHTML = viewHome();
    app.dataset.page = page || 'home'; app.dataset.id = id || '';
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- Beranda ---------- */
  function viewHome() {
    const rows = SEED.penugasan.filter((p) => ui.jj === 'all' || p.jenjang === ui.jj).map((p) => {
      const r = progress(p.id); const d = P(p.id); const nl = nilai(p.id);
      const pm = Math.round((r.full + r.part * 0.5) / r.n * 100);
      const pa = Math.round(r.dinilai / r.n * 100);
      const mState = d.meta.submittedMandiri ? `<span class="st full">Disubmit ${fmtDate(d.meta.submittedMandiri)}</span>` : '<span class="st none">Draf</span>';
      const aState = d.meta.finishedAudit ? `<span class="st full">Selesai ${fmtDate(d.meta.finishedAudit)}</span>` : (r.dinilai ? '<span class="st part">Berjalan</span>' : '<span class="st none">Belum mulai</span>');
      return `<tr>
        <td><b>${esc(p.unit)}</b><div class="small muted">PIC: ${esc(p.auditee)}</div></td>
        <td>${JENJANG[p.jenjang]} (${p.jenjang})<div class="small muted">Matriks LAM INFOKOM · ${r.n} butir</div></td>
        <td>${mState}<div class="row" style="margin-top:4px"><div class="progress" style="flex:1"><span style="width:${pm}%"></span></div><span class="small">${r.full}/${r.n} lengkap</span></div>
            <div class="small muted">Batas: ${fmtDate(p.batasAuditee)}</div><a class="btn xs" href="#/mandiri/${p.id}">Penilaian Mandiri</a></td>
        <td>${aState}<div class="row" style="margin-top:4px"><div class="progress blue" style="flex:1"><span style="width:${pa}%"></span></div><span class="small">${r.dinilai}/${r.n} dinilai</span></div>
            <div class="small muted">Batas: ${fmtDate(p.batasAuditor)}</div><a class="btn xs" href="#/audit/${p.id}">Audit Rubrik</a></td>
        <td class="num"><b>${r.dinilai ? num(nl.rerata) : '—'}</b><div class="small muted">rerata 0–4</div></td>
        <td><a class="btn xs primary" href="#/rekap/${p.id}">Rekap PPEPP</a></td>
      </tr>`;
    }).join('');
    const chips = ['all', 'S1', 'S2', 'S3'].map((j) => `<button class="chip ${ui.jj === j ? 'on' : ''}" data-act="jj" data-v="${j}">${j === 'all' ? 'Semua jenjang' : JENJANG[j] + ' (' + j + ')'}</button>`).join('');
    return `
      <div class="crumb">Beranda</div>
      <h1>Daftar Penugasan <small>${esc(SEED.siklus)}</small></h1>
      <div class="alert info">Alur sama dengan SIQA: <b>ketua PS & tim mengisi Penilaian Mandiri</b>, lalu <b>auditor mengaudit</b>. Bedanya, butir yang dinilai adalah
        <b>seluruh butir Matriks Penilaian LAM INFOKOM</b> (Konteks/Profil + 6 kriteria × 5 tahap PPEPP), dengan skala skor 1–4 sesuai rubrik LAM.
        <a href="#/panduan">Lihat panduan & analisis kesenjangan SIQA →</a></div>
      <div class="box">
        <div class="filters">${chips}</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Unit / Auditee</th><th>Jenjang & Instrumen</th><th>Penilaian Mandiri (Auditee)</th><th>Audit (Auditor)</th><th class="num">Skor</th><th>Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table></div>
      </div>`;
  }

  /* ---------- Penilaian Mandiri & Audit ---------- */
  function headerBox(mode, id) {
    const p = penugasan(id); const d = P(id); const r = progress(id); const mx = matriks(p.jenjang);
    const isA = mode === 'audit';
    const actions = isA
      ? `${d.meta.finishedAudit
          ? `<button class="btn" data-act="reopen-audit">Buka kembali audit</button>`
          : `<button class="btn warn" data-act="return-unit" ${d.meta.submittedMandiri ? '' : 'disabled'}>Kembalikan ke Unit</button>
             <button class="btn success" data-act="finish-audit">Selesaikan Audit</button>`}
         <a class="btn" href="#/mandiri/${id}">Lihat Penilaian Mandiri</a>`
      : `${d.meta.submittedMandiri
          ? `<button class="btn" data-act="unlock-mandiri">Buka kunci (demo)</button>`
          : `<button class="btn success" data-act="submit-mandiri">Kirim Penilaian Mandiri</button>`}
         <a class="btn" href="#/audit/${id}">Buka Halaman Auditor</a>`;
    const stats = isA
      ? `<div class="stat"><b id="pg-a">${r.dinilai}/${r.n}</b><span>butir sudah dinilai auditor</span></div>
         <div class="stat"><b class="c-acc" id="pg-acc">${r.acc + r.con}</b><span>memenuhi (Acceptable ${r.acc} · Concern ${r.con})</span></div>
         <div class="stat"><b id="pg-tm">${r.weak + r.def}</b><span>tidak memenuhi (Weakness ${r.weak} · Defisiensi ${r.def})</span></div>
         <div class="stat"><b id="pg-n">${r.dinilai ? num(nilai(id).rerata) : '—'}</b><span>rerata skor tertimbang (0–4)</span></div>`
      : `<div class="stat"><b id="pg-full">${r.full}/${r.n}</b><span>butir lengkap (narasi, isian PPEPP, bukti, skor)</span></div>
         <div class="stat"><b id="pg-part">${r.part}</b><span>butir terisi sebagian</span></div>
         <div class="stat"><b id="pg-none">${r.none}</b><span>butir belum diisi</span></div>`;
    let banner = '';
    if (isA && !d.meta.submittedMandiri) banner = '<div class="alert warn">Unit belum mengirim Penilaian Mandiri. Pada prototype ini auditor tetap dapat mencoba menilai.</div>';
    if (isA && d.meta.finishedAudit) banner = `<div class="alert ok">Audit diselesaikan pada ${fmtDate(d.meta.finishedAudit)}. Halaman ini hanya untuk dibaca.</div>`;
    if (!isA && d.meta.submittedMandiri) banner = `<div class="alert ok">Penilaian mandiri sudah dikirim pada ${fmtDate(d.meta.submittedMandiri)} dan tidak dapat diubah. Halaman ini hanya untuk dibaca.</div>`;
    return `
      <div class="crumb">Beranda › ${isA ? 'Audit Rubrik Penilaian' : 'Penilaian Mandiri (LED)'}</div>
      <div class="box">
        <div class="unit-head">
          <div>
            <h1>${isA ? 'Audit Rubrik LAM INFOKOM' : 'Penilaian Mandiri — Laporan Evaluasi Diri'}</h1>
            <div><b>${esc(p.unit)}</b> · Penanggung jawab: ${esc(p.auditee)} · ${esc(SEED.siklus)}</div>
            <div class="small muted">Instrumen: ${esc(mx.sumber)} (${mx.butir.length} butir, total bobot ${num(mx.totalBobot, 1)}) ·
              Batas auditee ${fmtDate(p.batasAuditee)} · Batas auditor ${fmtDate(p.batasAuditor)}</div>
          </div>
          <div class="actions no-print">${actions}<a class="btn primary" href="#/rekap/${id}">Rekap PPEPP</a><a class="btn" href="#/">Kembali</a></div>
        </div>
        <div class="stats">${stats}</div>
      </div>${banner}`;
  }

  function filtersBar(mode, j) {
    const kr = [{ id: 'all', nama: 'Semua kriteria' }].concat(matriks(j).kriteria);
    const krChips = kr.map((k) => `<button class="chip ${ui.kr === k.id ? 'on' : ''}" data-act="kr" data-v="${k.id}" title="${esc(k.nama)}">${k.id === 'all' ? k.nama : kLabel(k.id) + (k.id === 'K0' ? '' : ' ' + esc(k.nama))}</button>`).join('');
    const tahapList = ['all', 'Konteks'].concat(PPEPP).concat(j === 'S2' ? ['Kekhasan PS'] : []);
    const thChips = tahapList.map((t) => `<button class="chip ${ui.th === t ? 'on' : ''}" data-act="th" data-v="${t}">${t === 'all' ? 'Semua tahap' : t}</button>`).join('');
    const stOpts = mode === 'audit'
      ? [['all', 'Semua butir'], ['none', 'Belum dinilai'], ['memenuhi', 'Memenuhi (semua)'], ['acc', 'Acceptable'], ['con', 'Concern'], ['tidak', 'Tidak memenuhi (semua)'], ['weak', 'Weakness'], ['def', 'Defisiensi'], ['selisih', 'Selisih skor mandiri ≠ auditor'], ['unggul', 'Di bawah syarat Unggul (< 3)']]
      : [['all', 'Semua butir'], ['none', 'Belum diisi'], ['part', 'Terisi sebagian'], ['full', 'Lengkap']];
    return `<div class="box plain no-print">
      <div class="filters">${krChips}</div>
      <div class="filters">${thChips}</div>
      <div class="filters">
        <select data-act="st" aria-label="Filter status">${stOpts.map(([v, l]) => `<option value="${v}" ${ui.st === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <input type="search" data-act="q" placeholder="Cari kode atau kata kunci…" value="${esc(ui.q)}" aria-label="Cari butir">
        <span class="small muted" id="flt-count"></span>
      </div></div>`;
  }

  function filtered(mode, id) {
    const p = penugasan(id); const d = P(id); const q = ui.q.trim().toLowerCase();
    return matriks(p.jenjang).butir.filter((b) => {
      if (ui.kr !== 'all' && b.kriteria !== ui.kr) return false;
      if (ui.th !== 'all' && b.tahap !== ui.th) return false;
      if (q && !(b.kode + ' ' + b.elemen + ' ' + b.deskriptor).toLowerCase().includes(q)) return false;
      if (ui.st === 'all') return true;
      if (mode === 'mandiri') return mStatus(b, d.mandiri[b.kode]) === ui.st;
      const a = d.audit[b.kode]; const s = aStatus(a); const m = d.mandiri[b.kode];
      if (ui.st === 'memenuhi') return s === 'acc' || s === 'con';
      if (ui.st === 'tidak') return s === 'weak' || s === 'def';
      if (ui.st === 'selisih') return !!(a && a.skor && m && m.skor && a.skor !== m.skor);
      if (ui.st === 'unggul') return !!(a && a.skor && a.skor < 3);
      return s === ui.st;
    });
  }

  function viewWorkspace(mode, id) {
    const p = penugasan(id);
    if (!['all', 'Konteks', 'Kekhasan PS'].concat(PPEPP).includes(ui.th)) ui.th = 'all';
    if (ui.kr !== 'all' && !matriks(p.jenjang).kriteria.some((k) => k.id === ui.kr)) ui.kr = 'all';
    return headerBox(mode, id) + filtersBar(mode, p.jenjang) + `<div id="ws">${wsInner(mode, id)}</div>`;
  }

  function wsInner(mode, id) {
    const p = penugasan(id); const d = P(id); const list = filtered(mode, id);
    let nav = ''; let lastK = null;
    list.forEach((b) => {
      if (b.kriteria !== lastK) { lastK = b.kriteria; nav += `<div class="grp">${kLabel(b.kriteria)} · ${esc(kName(p.jenjang, b.kriteria))}</div>`; }
      const st = mode === 'audit' ? aStatus(d.audit[b.kode]) : mStatus(b, d.mandiri[b.kode]);
      nav += `<a href="#b-${esc(b.kode)}" data-jump="${esc(b.kode)}"><span class="kd">${esc(b.kode)}</span><span class="el">${esc(shortEl(b))}</span><span class="dot ${st}" data-dot="${esc(b.kode)}"></span></a>`;
    });
    const cards = list.map((b) => card(mode, id, b)).join('');
    setTimeout(() => { const c = document.getElementById('flt-count'); if (c) c.textContent = `${list.length} butir ditampilkan`; });
    return `<div class="ws"><aside class="butir-nav" aria-label="Daftar butir">${nav || '<div class="empty">Tidak ada butir</div>'}</aside>
      <section>${cards || '<div class="box empty">Tidak ada butir yang cocok dengan filter.</div>'}</section></div>`;
  }

  function cardHead(j, b, st, stLabel) {
    return `<div class="card-h">
      <span class="kode">${esc(b.kode)}</span>
      <span class="badge k">${kLabel(b.kriteria)} · ${esc(kName(j, b.kriteria))}</span>
      <span class="badge t-${b.tahap.split(' ')[0]}">${esc(b.tahap)}</span>
      <span class="meta">${JENIS[b.jenis] || ''} · Bobot ${num(b.bobot, 1)}</span>
      <span class="spacer" style="flex:1"></span>
      <span class="st ${st}" data-stlabel="${esc(b.kode)}">${stLabel}</span>
    </div>`;
  }
  function rubrikBlock(b) {
    return `<details class="desk"><summary>Deskriptor & rubrik penilaian LAM</summary><div>
      <h3>Deskriptor</h3>${fmt(b.deskriptor)}
      ${[4, 3, 2, 1].map((s) => `<h3>Skor ${s} — ${LV[s].lam}</h3>${fmt(b.rubrik[s])}`).join('')}
    </div></details>
    ${b.syaratUnggul ? `<div class="unggul"><b>Syarat Unggul (min. skor 3,00):</b> ${esc(b.syaratUnggul)}</div>` : ''}`;
  }
  function skala(name, b, val, locked, auditor) {
    return `<div class="skala ${locked ? 'locked' : ''}" role="radiogroup">${[4, 3, 2, 1].map((s) => `
      <label class="l${s} ${val === s ? 'on' : ''}">
        <input type="radio" name="${name}" value="${s}" data-skor="${s}" ${val === s ? 'checked' : ''} ${locked ? 'disabled' : ''}>
        <span class="sk"><span>${s} · ${LV[s].lam}</span>${auditor ? `<span class="st ${LV[s].cls}">${LV[s].siqa}</span>` : ''}</span>
        <div class="rb">${esc(b.rubrik[s].split('\n').filter((x) => x.trim()).slice(-1)[0] || '')}</div>
      </label>`).join('')}</div>`;
  }
  function mStLabel(st) { return { full: 'Lengkap', part: 'Sebagian', none: 'Belum diisi' }[st]; }
  function aStLabel(a) { return a && a.skor ? `${LV[a.skor].st} · ${LV[a.skor].siqa}` : 'Belum dinilai'; }

  function card(mode, id, b) {
    const p = penugasan(id); const d = P(id);
    const m = d.mandiri[b.kode] || {}; const a = d.audit[b.kode] || {};
    if (mode === 'mandiri') {
      const locked = !!d.meta.submittedMandiri; const st = mStatus(b, d.mandiri[b.kode]);
      const ro = locked ? 'readonly' : '';
      const extra = fieldsFor(b).map((f) => `<div class="field"><label for="f-${b.kode}-${f.f}">${esc(f.label)}</label>
        ${f.survei && SURVEI[b.kriteria] ? `<div class="hint">Diminta LED: ${esc(SURVEI[b.kriteria])}</div>` : ''}
        <textarea id="f-${b.kode}-${f.f}" data-f="${f.f}" rows="3" ${ro}>${esc(m[f.f] || '')}</textarea></div>`).join('');
      const aspek = b.aspek.length ? `<div class="field"><span class="lbl">Aspek yang sudah dipenuhi (cek mandiri)</span><ul class="aspek">${b.aspek.map((x, i) => `
        <li><input type="checkbox" id="as-${b.kode}-${i}" data-aspek="${i}" ${(m.aspek || [])[i] ? 'checked' : ''} ${locked ? 'disabled' : ''}><label for="as-${b.kode}-${i}">${i + 1}. ${esc(x)}</label></li>`).join('')}</ul></div>` : '';
      const bukti = (m.bukti || []).map((x, i) => `<li><span class="t">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.judul || x.url)}</a>` : esc(x.judul)}</span>${locked ? '' : `<button class="btn xs danger" data-act="del-bukti" data-i="${i}" aria-label="Hapus bukti">Hapus</button>`}</li>`).join('');
      return `<article class="card ${st}" id="b-${esc(b.kode)}" data-kode="${esc(b.kode)}">
        ${cardHead(p.jenjang, b, st === 'none' ? 'none' : st, mStLabel(st))}
        <div class="card-b">
          <div class="elemen">${fmt(b.elemen)}</div>
          ${rubrikBlock(b)}
          <div class="hint"><b>Panduan LED (${esc(b.tahap)}):</b> ${esc(hintFor(b))}</div>
          ${aspek}
          <div class="field"><label for="f-${b.kode}-narasi">Narasi evaluasi diri</label>
            <textarea id="f-${b.kode}-narasi" data-f="narasi" rows="5" ${ro}>${esc(m.narasi || '')}</textarea></div>
          ${extra}
          <div class="field"><span class="lbl">Bukti dukung (${(m.bukti || []).length})</span>
            <ul class="bukti-list">${bukti || '<li class="muted">Belum ada bukti dukung.</li>'}</ul>
            ${locked ? '' : `<div class="bukti-add"><input type="text" placeholder="Judul dokumen" data-new="judul" aria-label="Judul bukti"><input type="url" placeholder="Tautan (Google Drive, dsb.)" data-new="url" aria-label="Tautan bukti"><button class="btn xs" data-act="add-bukti">Tambah</button></div>`}
          </div>
          <div class="field"><span class="lbl">Skor penilaian mandiri (rubrik LAM)</span>${skala('ms-' + b.kode, b, m.skor, locked, false)}</div>
        </div></article>`;
    }
    // Audit
    const locked = !!d.meta.finishedAudit; const st = aStatus(a); const ro = locked ? 'readonly' : '';
    const extraAns = fieldsFor(b).map((f) => `<div class="lbl2">${esc(f.label)}</div><p class="ans">${m[f.f] ? esc(m[f.f]) : '<span class="muted">—</span>'}</p>`).join('');
    const buktiAns = (m.bukti || []).length ? '<ul class="bukti-list">' + m.bukti.map((x) => `<li><span class="t">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.judul || x.url)}</a>` : esc(x.judul)}</span></li>`).join('') + '</ul>' : '<p class="ans muted">Unit tidak melampirkan bukti dukung.</p>';
    const aspek = b.aspek.length ? `<div class="field"><span class="lbl">Verifikasi aspek</span><ul class="aspek">${b.aspek.map((x, i) => `
      <li><span class="pair"><span>Unit<br>${(m.aspek || [])[i] ? '✔' : '✘'}</span><span>Auditor<br><input type="checkbox" data-aspek="${i}" aria-label="Aspek ${i + 1} terverifikasi" ${(a.aspek || [])[i] ? 'checked' : ''} ${locked ? 'disabled' : ''}></span></span><span>${i + 1}. ${esc(x)}</span></li>`).join('')}</ul></div>` : '';
    const gap = a.skor && m.skor && a.skor !== m.skor ? `<span class="gap">Selisih: mandiri ${m.skor} → auditor ${a.skor}</span>` : '';
    return `<article class="card ${st}" id="b-${esc(b.kode)}" data-kode="${esc(b.kode)}">
      ${cardHead(p.jenjang, b, st, aStLabel(a))}
      <div class="card-b">
        <div class="elemen">${fmt(b.elemen)}</div>
        ${rubrikBlock(b)}
        <div class="panel-auditee"><h4>Jawaban unit ${m.skor ? `· skor mandiri <span class="st ${LV[m.skor].cls}">${m.skor} ${LV[m.skor].lam}</span>` : ''}</h4>
          <p class="ans">${m.narasi ? esc(m.narasi) : '<span class="muted">Unit belum mengisi narasi.</span>'}</p>
          ${extraAns}<div class="lbl2">Bukti dukung</div>${buktiAns}
        </div>
        <div class="panel-auditor"><h4>Penilaian auditor <span class="saved" data-saved="${esc(b.kode)}"></span> ${gap}</h4>
          ${aspek}
          <div class="field"><span class="lbl">Skor auditor (rubrik LAM → kategori SIQA)</span>${skala('as-' + b.kode, b, a.skor, locked, true)}</div>
          <div class="field"><label for="c-${b.kode}">Catatan / temuan auditor</label><textarea id="c-${b.kode}" data-f="catatan" rows="3" ${ro}>${esc(a.catatan || '')}</textarea></div>
          <div class="grid2">
            <div class="field"><label for="r-${b.kode}">Rekomendasi tindak lanjut (Pengendalian)</label><textarea id="r-${b.kode}" data-f="rekomendasi" rows="3" ${ro}>${esc(a.rekomendasi || '')}</textarea></div>
            <div class="field"><label for="t-${b.kode}">Batas waktu tindak lanjut</label><input type="date" id="t-${b.kode}" data-f="batas" value="${esc(a.batas || '')}" ${ro}>
              <div class="small muted" style="margin-top:6px">Wajib diisi untuk Weakness/Defisiensi; dibawa ke daftar RTL pada Rekap.</div></div>
          </div>
        </div>
      </div></article>`;
  }

  // Pembaruan ringan tanpa render ulang (agar fokus input tidak hilang).
  function refreshCard(mode, id, kode) {
    const p = penugasan(id); const b = matriks(p.jenjang).butir.find((x) => x.kode === kode); const d = P(id);
    const st = mode === 'audit' ? aStatus(d.audit[kode]) : mStatus(b, d.mandiri[kode]);
    const el = document.querySelector(`.card[data-kode="${CSS.escape(kode)}"]`);
    if (el) { el.className = 'card ' + st; const lb = el.querySelector('[data-stlabel]'); lb.className = 'st ' + st; lb.textContent = mode === 'audit' ? aStLabel(d.audit[kode]) : mStLabel(st); }
    const dot = document.querySelector(`[data-dot="${CSS.escape(kode)}"]`); if (dot) dot.className = 'dot ' + st;
    const r = progress(id); const set = (i, v) => { const e = document.getElementById(i); if (e) e.textContent = v; };
    if (mode === 'audit') { set('pg-a', `${r.dinilai}/${r.n}`); set('pg-acc', r.acc + r.con); set('pg-tm', r.weak + r.def); set('pg-n', r.dinilai ? num(nilai(id).rerata) : '—'); }
    else { set('pg-full', `${r.full}/${r.n}`); set('pg-part', r.part); set('pg-none', r.none); }
  }
  function rerenderCard(mode, id, kode) {
    const p = penugasan(id); const b = matriks(p.jenjang).butir.find((x) => x.kode === kode);
    const el = document.querySelector(`.card[data-kode="${CSS.escape(kode)}"]`);
    if (el) el.outerHTML = card(mode, id, b);
    refreshCard(mode, id, kode);
  }

  /* ---------- Rekap ---------- */
  function viewRekap(id) {
    const p = penugasan(id); const mx = matriks(p.jenjang); const d = P(id); const r = progress(id); const nl = nilai(id);
    const sc = (b) => d.audit[b.kode] && d.audit[b.kode].skor;
    const cols = PPEPP.concat(['Lainnya']);
    const cell = (list) => {
      if (!list.length) return '<td class="c na">·</td>';
      const avg = wavg(list.map((b) => ({ b, s: sc(b) })));
      const dn = list.filter(sc).length; const mi = list.filter((b) => mStatus(b, d.mandiri[b.kode]) !== 'none').length;
      const cls = avg == null ? 's0' : 's' + Math.max(1, Math.min(4, Math.floor(avg + 1e-9)));
      return `<td class="c ${cls}" title="${list.map((b) => b.kode).join(', ')}">${avg == null ? '—' : num(avg)}<small>dinilai ${dn}/${list.length} · mandiri ${mi}/${list.length}</small></td>`;
    };
    const heatRows = mx.kriteria.map((k) => {
      const bk = mx.butir.filter((b) => b.kriteria === k.id);
      return `<tr><td><b>${kLabel(k.id)}</b> ${esc(k.nama)}</td>${cols.map((t) => cell(bk.filter((b) => t === 'Lainnya' ? !PPEPP.includes(b.tahap) : b.tahap === t))).join('')}</tr>`;
    }).join('');
    const totRow = `<tr><td><b>Semua kriteria</b></td>${cols.map((t) => cell(mx.butir.filter((b) => t === 'Lainnya' ? !PPEPP.includes(b.tahap) : b.tahap === t))).join('')}</tr>`;

    const krRows = mx.kriteria.map((k) => {
      const bk = mx.butir.filter((b) => b.kriteria === k.id);
      const bob = bk.reduce((s, b) => s + b.bobot, 0);
      const ws = bk.reduce((s, b) => s + (sc(b) ? b.bobot * sc(b) : 0), 0);
      const avg = wavg(bk.map((b) => ({ b, s: sc(b) })));
      const kontrib = ws / (4 * mx.totalBobot) * 400; const maks = bob / mx.totalBobot * 400;
      return `<tr><td><b>${kLabel(k.id)}</b> ${esc(k.nama)}</td><td class="num">${bk.length}</td><td class="num">${num(bob, 1)}</td><td class="num">${num(avg)}</td>
        <td><div class="bar" title="${num(kontrib)} dari ${num(maks)}"><span style="width:${maks ? kontrib / maks * 100 : 0}%;background:var(--blue)"></span></div></td><td class="num">${num(kontrib)} / ${num(maks)}</td></tr>`;
    }).join('');

    const unggul = mx.butir.filter((b) => b.syaratUnggul && (!sc(b) || sc(b) < 3));
    const temuan = mx.butir.filter((b) => sc(b) && sc(b) <= 3).sort((x, y) => sc(x) - sc(y));
    const selisih = mx.butir.filter((b) => sc(b) && d.mandiri[b.kode] && d.mandiri[b.kode].skor && d.mandiri[b.kode].skor !== sc(b));
    const temRows = temuan.map((b) => { const a = d.audit[b.kode]; const m = d.mandiri[b.kode] || {}; const tl = sc(b) <= 2;
      return `<tr><td><a href="#/audit/${id}" data-goto="${esc(b.kode)}"><b>${esc(b.kode)}</b></a></td><td><span class="badge t-${b.tahap.split(' ')[0]}">${esc(b.tahap)}</span></td>
        <td>${esc(shortEl(b))}</td><td class="num">${m.skor || '—'}</td><td><span class="st ${LV[a.skor].cls}">${a.skor} · ${LV[a.skor].siqa}</span><div class="small muted">${tl ? 'Temuan' : 'Observasi'}</div></td>
        <td class="small">${esc(a.catatan || '')}</td><td class="small">${esc(a.rekomendasi || '') || (tl ? '<span class="gap">Rekomendasi belum diisi</span>' : '')}</td>
        <td class="small">${a.batas ? fmtDate(a.batas) : (tl ? '<span class="gap">Belum ada</span>' : '—')}</td></tr>`; }).join('');

    return `
      <div class="crumb">Beranda › Rekap PPEPP</div>
      <div class="box">
        <div class="unit-head">
          <div><h1>Rekap Audit & Siklus PPEPP</h1>
            <div><b>${esc(p.unit)}</b> · ${esc(SEED.siklus)}</div>
            <div class="small muted">Instrumen ${esc(mx.sumber)} · total bobot ${num(mx.totalBobot, 1)}</div></div>
          <div class="actions no-print"><button class="btn" data-act="csv">Ekspor CSV</button><button class="btn" data-act="print">Cetak / PDF</button>
            <a class="btn" href="#/audit/${id}">Halaman Auditor</a><a class="btn" href="#/">Kembali</a></div>
        </div>
        <div class="stats">
          <div class="stat"><b>${num(nl.proyeksi)}</b><span>proyeksi nilai (skala 400, butir belum dinilai = 0)</span></div>
          <div class="stat"><b>${num(nl.rerata)}</b><span>rerata skor tertimbang butir yang dinilai (0–4)</span></div>
          <div class="stat"><b>${r.dinilai}/${r.n}</b><span>butir dinilai auditor</span></div>
          <div class="stat"><b>${r.weak + r.def}</b><span>temuan (Weakness/Defisiensi)</span></div>
          <div class="stat"><b>${unggul.length}</b><span>butir bersyarat Unggul belum ≥ 3</span></div>
        </div>
        <p class="small muted" style="margin:10px 0 0">Proyeksi nilai = Σ(bobot × skor) ÷ (4 × total bobot) × 400. Ini simulasi internal untuk memantau kesiapan, bukan nilai resmi LAM INFOKOM.</p>
      </div>

      <div class="box"><h2>Peta siklus PPEPP per kriteria</h2>
        <p class="small muted">Setiap sel: rerata skor auditor tertimbang bobot; keterangan kecil menunjukkan kelengkapan audit dan isian mandiri. Sel kosong/abu-abu berarti tahap tersebut belum dievaluasi — celah inilah yang perlu ditutup agar siklus PPEPP lengkap.</p>
        <div class="table-wrap"><table class="heat"><thead><tr><th>Kriteria</th>${cols.map((c) => `<th>${c === 'Lainnya' ? 'Konteks / Kekhasan' : c}</th>`).join('')}</tr></thead>
          <tbody>${heatRows}${totRow}</tbody></table></div>
        <div class="legend"><span><i style="background:var(--acc)"></i>≥ 4,00</span><span><i style="background:#8fd3a9"></i>3,00–3,99</span><span><i style="background:#f6c37a"></i>2,00–2,99</span><span><i style="background:#ef8f80"></i>&lt; 2,00</span><span><i style="background:#eef1f4"></i>belum dinilai</span></div>
      </div>

      <div class="box"><h2>Kontribusi nilai per kriteria</h2><div class="table-wrap"><table>
        <thead><tr><th>Kriteria</th><th class="num">Butir</th><th class="num">Bobot</th><th class="num">Rerata skor</th><th style="width:30%">Capaian</th><th class="num">Nilai / maks</th></tr></thead>
        <tbody>${krRows}</tbody></table></div></div>

      <div class="box"><h2>Daftar temuan & rekomendasi (bahan Pengendalian / RTM)</h2>
        ${temRows ? `<div class="table-wrap"><table><thead><tr><th>Butir</th><th>Tahap</th><th>Elemen</th><th class="num">Mandiri</th><th>Auditor</th><th>Catatan</th><th>Rekomendasi</th><th>Batas</th></tr></thead><tbody>${temRows}</tbody></table></div>`
          : '<p class="muted">Belum ada butir dengan skor ≤ 3.</p>'}
      </div>

      <div class="grid2">
        <div class="box"><h2>Syarat Unggul belum terpenuhi</h2>
          ${unggul.length ? '<ul>' + unggul.map((b) => `<li><b>${esc(b.kode)}</b> — skor ${sc(b) || 'belum dinilai'}<div class="small muted">${esc(b.syaratUnggul)}</div></li>`).join('') + '</ul>' : '<p class="muted">Semua butir bersyarat Unggul sudah ≥ 3.</p>'}
        </div>
        <div class="box"><h2>Kalibrasi: selisih skor mandiri vs auditor</h2>
          ${selisih.length ? '<ul>' + selisih.map((b) => `<li><b>${esc(b.kode)}</b>: mandiri ${d.mandiri[b.kode].skor} → auditor ${sc(b)}</li>`).join('') + '</ul>' : '<p class="muted">Tidak ada selisih.</p>'}
        </div>
      </div>`;
  }

  function csv(id) {
    const p = penugasan(id); const mx = matriks(p.jenjang); const d = P(id);
    const extraKeys = ['indikator', 'lkps', 'pendukung', 'akar', 'survei', 'rtl', 'optimasi', 'peluang', 'ancaman', 'kekuatan', 'kelemahan'];
    const head = ['kode', 'kriteria', 'tahap', 'jenis', 'bobot', 'elemen', 'narasi_unit'].concat(extraKeys).concat(['bukti', 'aspek_unit', 'skor_mandiri', 'aspek_auditor', 'skor_auditor', 'kategori_siqa', 'status', 'catatan_auditor', 'rekomendasi', 'batas_tindak_lanjut']);
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = mx.butir.map((b) => {
      const m = d.mandiri[b.kode] || {}; const a = d.audit[b.kode] || {};
      const asp = (arr) => b.aspek.map((_, i) => (arr || [])[i] ? '1' : '0').join('');
      return [b.kode, kName(p.jenjang, b.kriteria), b.tahap, JENIS[b.jenis], String(b.bobot).replace('.', ','), shortEl(b), m.narasi]
        .concat(extraKeys.map((k) => m[k]))
        .concat([(m.bukti || []).map((x) => x.judul + (x.url ? ' <' + x.url + '>' : '')).join(' | '), asp(m.aspek), m.skor, asp(a.aspek), a.skor,
          a.skor ? LV[a.skor].siqa : '', a.skor ? LV[a.skor].st : 'Belum dinilai', a.catatan, a.rekomendasi, a.batas]).map(q).join(';');
    });
    download(`SIQA-INFOKOM_${id}_${today()}.csv`, '﻿' + head.map(q).join(';') + '\n' + rows.join('\n'), 'text/csv;charset=utf-8');
  }

  /* ---------- Panduan & analisis kesenjangan ---------- */
  function viewPanduan() {
    const j = ui.gapJ; const mx = matriks(j);
    const touched = new Set(); SEED.siqaMap.forEach((x) => x.butir.forEach((k) => touched.add(k)));
    const cols = ['Konteks'].concat(PPEPP);
    let tot = 0, totT = 0;
    const rows = mx.kriteria.map((k) => {
      const bk = mx.butir.filter((b) => b.kriteria === k.id);
      return `<tr><td><b>${kLabel(k.id)}</b> ${esc(k.nama)}</td>${cols.map((t) => {
        const l = bk.filter((b) => b.tahap === t || (t === 'Konteks' && b.tahap === 'Kekhasan PS'));
        if (!l.length) return '<td class="c na">·</td>';
        const n = l.filter((b) => touched.has(b.kode)).length; tot += l.length; totT += n;
        return `<td class="c ${n === 0 ? 's1' : n < l.length ? 's2' : 's3'}" title="${l.map((b) => b.kode + (touched.has(b.kode) ? ' ✓' : '')).join(', ')}">${n}/${l.length}</td>`;
      }).join('')}</tr>`;
    }).join('');
    const mapRows = SEED.siqaMap.map((x) => `<tr><td><b>${esc(x.ind)}</b></td><td>${esc(x.nama)}</td><td>${x.butir.map((k) => `<span class="badge">${esc(k)}</span>`).join(' ')}</td></tr>`).join('');
    const jChips = ['S1', 'S2', 'S3'].map((x) => `<button class="chip ${j === x ? 'on' : ''}" data-act="gapj" data-v="${x}">${JENJANG[x]}</button>`).join('');
    return `
      <div class="crumb">Beranda › Panduan</div>
      <h1>Panduan PPEPP, Skala Penilaian & Kesenjangan SIQA</h1>
      <div class="box"><h2>Mengapa SIQA-INFOKOM?</h2>
        <p>Audit AIM pada SIQA berfokus pada indikator SPMI PTN-BH (mis. akreditasi, rasio dosen, kurikulum OBE). Matriks Penilaian LAM INFOKOM menilai
        <b>setiap kriteria pada kelima tahap PPEPP</b> — Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan — ditambah Kondisi Eksternal dan Profil UPPS.
        Tabel di bawah menunjukkan berapa butir LAM yang <i>tersentuh sebagian</i> oleh indikator SIQA saat ini (pemetaan awal, perlu diverifikasi tim penjaminan mutu).</p>
        <div class="filters">${jChips}</div>
        <div class="table-wrap"><table class="heat"><thead><tr><th>Kriteria</th>${cols.map((c) => `<th>${c === 'Konteks' ? 'Konteks / Kekhasan' : c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        <p><b>${totT} dari ${tot} butir</b> (${Math.round(totT / tot * 100)}%) Matriks ${JENJANG[j]} tersentuh oleh indikator SIQA; tahap Penetapan, Pengendalian, dan Peningkatan nyaris tidak dinilai.
        SIQA-INFOKOM mengaudit seluruh ${tot} butir.</p>
        <details class="desk"><summary>Pemetaan indikator SIQA (AIM Siklus 25) → butir LAM INFOKOM</summary><div><table><thead><tr><th>Indikator SIQA</th><th>Topik</th><th>Butir LAM yang tersentuh</th></tr></thead><tbody>${mapRows}</tbody></table></div></details>
      </div>

      <div class="box"><h2>Padanan skala LAM INFOKOM dan kategori audit SIQA</h2>
        <div class="table-wrap"><table><thead><tr><th>Skor LAM</th><th>Kategori SIQA</th><th>Status</th><th>Makna untuk audit</th></tr></thead><tbody>
          <tr><td>4 · Sangat Baik</td><td><span class="st acc">Acceptable</span></td><td>Memenuhi</td><td>Butir sepenuhnya memenuhi kriteria; bukti sahih dan sangat lengkap.</td></tr>
          <tr><td>3 · Baik</td><td><span class="st con">Concern</span></td><td>Memenuhi</td><td>Memenuhi (batas minimum Syarat Unggul), tetapi berpotensi turun; perlu perbaikan berkelanjutan.</td></tr>
          <tr><td>2 · Cukup</td><td><span class="st weak">Weakness</span></td><td>Tidak memenuhi</td><td>Memenuhi sebagian; tindakan perbaikan diperlukan → masuk daftar temuan.</td></tr>
          <tr><td>1 · Kurang</td><td><span class="st def">Defisiensi</span></td><td>Tidak memenuhi</td><td>Tidak memenuhi kriteria → temuan prioritas.</td></tr>
        </tbody></table></div></div>

      <div class="box"><h2>Isian per tahap PPEPP (dari Instrumen LED)</h2><div class="table-wrap"><table>
        <thead><tr><th>Tahap</th><th>Yang diminta</th><th>Isian tambahan di SIQA-INFOKOM</th></tr></thead><tbody>
        ${PPEPP.map((t) => `<tr><td><span class="badge t-${t}">${t}</span></td><td class="small">${esc(TAHAP[t].hint)}</td><td class="small">${TAHAP[t].fields.map((f) => esc(f.label)).join('<br>')}</td></tr>`).join('')}
        <tr><td><span class="badge t-Konteks">Konteks A/B</span></td><td class="small">${esc(KONTEKS.A.hint)}<br>${esc(KONTEKS.B.hint)}</td><td class="small">Analisis SWOT: peluang, ancaman, kekuatan, kelemahan</td></tr>
        </tbody></table></div>
        <h3 style="margin-top:12px">Survei yang diminta pada tahap Evaluasi</h3>
        <ul>${Object.keys(SURVEI).map((k) => `<li><b>${k}:</b> ${esc(SURVEI[k])}</li>`).join('')}</ul>
      </div>`;
  }

  /* ---------- Event ---------- */
  const app = document.getElementById('app');
  const ctx = () => ({ mode: app.dataset.page, id: app.dataset.id });
  function rec(mode, id, kode) {
    const d = P(id); const bag = mode === 'audit' ? d.audit : d.mandiri;
    return bag[kode] || (bag[kode] = {});
  }
  function locked(mode, id) { const d = P(id); return mode === 'audit' ? !!d.meta.finishedAudit : !!d.meta.submittedMandiri; }

  app.addEventListener('input', (e) => {
    const t = e.target; const { mode, id } = ctx();
    if (t.dataset.act === 'q') { ui.q = t.value; document.getElementById('ws').innerHTML = wsInner(mode, id); return; }
    const cardEl = t.closest('.card'); if (!cardEl || !t.dataset.f || locked(mode, id)) return;
    rec(mode, id, cardEl.dataset.kode)[t.dataset.f] = t.value; save();
    refreshCard(mode, id, cardEl.dataset.kode);
    const sv = cardEl.querySelector('[data-saved]'); if (sv) sv.textContent = 'Tersimpan';
  });

  app.addEventListener('change', (e) => {
    const t = e.target; const { mode, id } = ctx();
    if (t.dataset.act === 'st') { ui.st = t.value; document.getElementById('ws').innerHTML = wsInner(mode, id); return; }
    const cardEl = t.closest('.card'); if (!cardEl || locked(mode, id)) return;
    const kode = cardEl.dataset.kode; const r = rec(mode, id, kode);
    if (t.dataset.skor) {
      r.skor = Number(t.value); save(true);
      if (mode === 'audit') rerenderCard(mode, id, kode);
      else { cardEl.querySelectorAll('.skala label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked)); refreshCard(mode, id, kode); }
    } else if (t.dataset.aspek != null) {
      r.aspek = r.aspek || []; r.aspek[Number(t.dataset.aspek)] = t.checked; save(true); refreshCard(mode, id, kode);
    }
  });

  app.addEventListener('click', (e) => {
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); const el = document.getElementById('b-' + jump.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const go = e.target.closest('[data-goto]');
    if (go) { e.preventDefault(); const k = go.dataset.goto; Object.assign(ui, { kr: 'all', th: 'all', st: 'all', q: '' }); location.hash = go.getAttribute('href'); setTimeout(() => { const el = document.getElementById('b-' + k); if (el) el.scrollIntoView({ block: 'start' }); }, 50); return; }
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT') return;
    const act = b.dataset.act; const { mode, id } = ctx(); const d = id ? P(id) : null;
    switch (act) {
      case 'jj': ui.jj = b.dataset.v; route(); break;
      case 'gapj': ui.gapJ = b.dataset.v; route(); break;
      case 'kr': ui.kr = b.dataset.v; route(); break;
      case 'th': ui.th = b.dataset.v; route(); break;
      case 'add-bukti': {
        const c = b.closest('.card'); const judul = c.querySelector('[data-new=judul]').value.trim(); const url = c.querySelector('[data-new=url]').value.trim();
        if (!judul && !url) { toast('Isi judul atau tautan bukti.'); return; }
        if (url && !/^https?:\/\//i.test(url)) { toast('Tautan harus diawali http:// atau https://'); return; }
        const r = rec(mode, id, c.dataset.kode); (r.bukti = r.bukti || []).push({ judul: judul || url, url }); save(true); rerenderCard(mode, id, c.dataset.kode); break;
      }
      case 'del-bukti': { const c = b.closest('.card'); const r = rec(mode, id, c.dataset.kode); r.bukti.splice(Number(b.dataset.i), 1); save(true); rerenderCard(mode, id, c.dataset.kode); break; }
      case 'submit-mandiri': {
        const r = progress(id);
        if (!confirm(`Kirim Penilaian Mandiri? ${r.full} dari ${r.n} butir lengkap, ${r.none} belum diisi. Setelah dikirim isian tidak dapat diubah.`)) return;
        d.meta.submittedMandiri = today(); save(true); route(); toast('Penilaian mandiri dikirim ke auditor.'); break;
      }
      case 'unlock-mandiri': d.meta.submittedMandiri = null; save(true); route(); break;
      case 'return-unit': if (!confirm('Kembalikan penilaian mandiri ke unit untuk diperbaiki?')) return; d.meta.submittedMandiri = null; save(true); route(); toast('Dikembalikan ke unit.'); break;
      case 'finish-audit': {
        const r = progress(id);
        const missing = penugasan(id) && matriks(penugasan(id).jenjang).butir.filter((x) => { const a = d.audit[x.kode]; return a && a.skor && a.skor <= 2 && !(a.rekomendasi || '').trim(); }).map((x) => x.kode);
        if (missing.length) { alert('Rekomendasi tindak lanjut wajib diisi untuk temuan: ' + missing.join(', ')); return; }
        if (!confirm(`Selesaikan audit? ${r.dinilai} dari ${r.n} butir sudah dinilai.`)) return;
        d.meta.finishedAudit = today(); save(true); route(); toast('Audit diselesaikan.'); break;
      }
      case 'reopen-audit': d.meta.finishedAudit = null; save(true); route(); break;
      case 'csv': csv(id); break;
      case 'print': window.print(); break;
    }
  });

  // Menu samping: ekspor/impor/reset.
  document.querySelector('.sidenav').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    if (b.dataset.act === 'export-json') download(`SIQA-INFOKOM_data_${today()}.json`, JSON.stringify(S, null, 1), 'application/json');
    if (b.dataset.act === 'reset-demo' && confirm('Hapus semua isian di browser ini dan kembali ke data contoh?')) { S = fresh(); save(true); route(); toast('Data contoh dipulihkan.'); }
  });
  document.querySelector('input[data-act=import-json]').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((txt) => {
      const s = JSON.parse(txt); if (!s || s.v !== 1 || typeof s.data !== 'object') throw new Error('format');
      S = s; save(true); route(); toast('Data diimpor.');
    }).catch(() => toast('Berkas JSON tidak valid.')).finally(() => { e.target.value = ''; });
  });

  route();
})();
