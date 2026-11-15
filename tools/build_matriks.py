"""Bangun prototype/data/matriks.js dari berkas 'Matriks Penilaian *.md' (LAM INFOKOM).

Jalankan dari root repo:  python tools/build_matriks.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    "S1": ROOT / "Matriks Penilaian Sarjana.md",
    "S2": ROOT / "Matriks Penilaian Magister.md",
    "S3": ROOT / "Matriks Penilaian Doktor.md",
}
OUT = ROOT / "prototype" / "data" / "matriks.js"

TAHAP = {"1": "Penetapan", "2": "Pelaksanaan", "3": "Evaluasi", "4": "Pengendalian", "5": "Peningkatan"}
JENIS = {"I": "Input", "P": "Proses", "O": "Output"}
LEVEL_KEYS = {"Sangat Baik (skor 4)": "4", "Baik (skor 3)": "3", "Cukup (skor 2)": "2", "Kurang (skor 1)": "1"}
STAGE_HDR = re.compile(r"^\d+\.\d+\.?\s*\[[A-Z]+\]\s*$")
STAGE_PREFIX = re.compile(r"^\d+\.\d+\.?\s*\[[A-Z]+\]\s*")


def clean(lines):
    """Gabungkan baris menjadi teks, buang header tahap '1.1 [PENETAPAN]'."""
    out = [STAGE_PREFIX.sub("", l.rstrip()) for l in lines if not STAGE_HDR.match(l.strip())]
    return "\n".join(out).strip()


def numbered(lines):
    items = [re.sub(r"^\d+\.\s*", "", l).strip() for l in lines if re.match(r"^\d+\.\s", l)]
    # Buang ekor kalimat rubrik (", disertai bukti ...", ", secara efektif ...") bila aspek diambil dari rubrik.
    items = [re.split(r",\s*(?:disertai bukti|secara (?:sangat )?efektif|yang dilaksanakan|dilaksanakan secara)", i)[0] for i in items]
    return [i.strip().rstrip(",.;") for i in items]


def parse_kriteria(title):
    m = re.match(r"Kriteria (\d+) (.+)", title)
    if m:
        return {"id": "K" + m.group(1), "nama": m.group(2).replace("PKM", "PkM")}
    return {"id": "K0", "nama": "Kondisi Eksternal & Profil UPPS"}


def parse(path):
    lines = path.read_text(encoding="utf-8").split("\n")
    kriteria, butir = [], []
    cur_k, cur, sect = None, None, None
    buf = {}

    def flush():
        if cur is None:
            return
        for k, v in buf.items():
            cur["_raw"][k] = v
        finalize(cur)
        butir.append(cur)

    for line in lines:
        if line.startswith("## "):
            flush(); cur = None; buf = {}
            cur_k = parse_kriteria(line[3:].strip())
            kriteria.append(cur_k)
            continue
        m = re.match(r"^### Butir (\d+) \(No\. Butir (.+?)\)", line)
        if m:
            flush(); buf = {}; sect = None
            cur = {"urut": int(m.group(1)), "no": m.group(2).strip(), "kriteria": cur_k["id"], "_raw": {}}
            continue
        if cur is None:
            continue
        m = re.match(r"^- \*\*Jenis:\*\* .*\((\w)\)", line)
        if m:
            cur["jenis"] = m.group(1); continue
        m = re.match(r"^- \*\*Bobot \(dari 400\)\:\*\* ([\d,\.]+)", line)
        if m:
            cur["bobot"] = float(m.group(1).replace(",", ".")); continue
        if line.startswith("#### "):
            sect = line[5:].strip(); buf[sect] = []; continue
        if sect:
            buf[sect].append(line)
    flush()
    return kriteria, butir


def finalize(b):
    raw = b.pop("_raw")
    no = b["no"]
    m = re.match(r"(\d)\.(\d)", no)
    if m:
        # 6.6–6.8 (Magister) bukan tahap PPEPP: kekhasan keilmuan PS.
        b["tahap"] = TAHAP.get(m.group(2), "Kekhasan PS")
        sub = re.search(r"([A-Z])\s*$", no.replace(".", " ").strip())
        b["kode"] = f"{m.group(1)}.{m.group(2)}" + (f".{sub.group(1)}" if sub else "")
    else:
        b["tahap"] = "Konteks"
        b["kode"] = no.strip()
    b["elemen"] = clean(raw.get("Elemen Penilaian LAM", []))
    desk_lines = raw.get("Deskriptor", [])
    syarat = [l for l in desk_lines if l.startswith("Syarat Unggul")]
    b["syaratUnggul"] = syarat[0].split(":", 1)[1].strip() if syarat else ""
    b["deskriptor"] = clean([l for l in desk_lines if not l.startswith("Syarat Unggul")])
    # Aspek yang dinilai: daftar bernomor di deskriptor; bila tidak ada, ambil dari rubrik skor 4.
    b["aspek"] = numbered(desk_lines) or numbered(raw.get("Sangat Baik (skor 4)", []))
    b["rubrik"] = {v: clean(raw.get(k, [])) for k, v in LEVEL_KEYS.items()}


def main():
    data = {}
    for jenjang, path in SOURCES.items():
        kriteria, butir = parse(path)
        data[jenjang] = {"sumber": path.name, "kriteria": kriteria, "butir": butir,
                         "totalBobot": round(sum(b.get("bobot", 0) for b in butir), 2)}
        print(f"{jenjang}: {len(butir)} butir, total bobot {data[jenjang]['totalBobot']}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("// Dihasilkan otomatis oleh tools/build_matriks.py — jangan diedit manual.\n"
                   "window.MATRIKS = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print("->", OUT)


if __name__ == "__main__":
    main()
