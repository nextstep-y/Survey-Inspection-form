#!/usr/bin/env python3
"""Generate Monitoring PDF fallback indexes from synced Google Drive files."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import tempfile
from collections import defaultdict
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SURVEY_ROOT = Path(
    "/Users/weerayutpooncharoen/Library/CloudStorage/"
    "GoogleDrive-survey@itdp-cpn03.ph/Shared drives/"
    "SURVEY CP-N03 SHARE DRIVE/SURVEY SHEET SOFT COPY"
)
DRIVE_ITEM_ID_XATTRS = ("com.google.drivefs.item-id#S", "com.google.drivefs.item-id")
PIER_RE = re.compile(r"\bP-\d+[A-Z]*\b", re.IGNORECASE)
PILE_RE = re.compile(r"(?:#|NO\.?|PILE|BP)\s*(\d+)([A-Z]?)\b", re.IGNORECASE)
POINT_RE = re.compile(r"\b(?:BP|CC|SS\d+BP)\s*-?\s*\d+\b", re.IGNORECASE)
CIS_RE = re.compile(r"\bCIS\s*(\d+)\s*[- ]\s*0*(\d+)\b", re.IGNORECASE)
WIR_RE = re.compile(r"\bWIR\s*0*(\d{3,})\b", re.IGNORECASE)


def natural_key(value: str) -> list[object]:
    parts = re.split(r"(\d+)", value.upper())
    return [int(part) if part.isdigit() else part for part in parts]


def read_drive_item_id(path: Path) -> str:
    for attr_name in DRIVE_ITEM_ID_XATTRS:
        try:
            proc = subprocess.run(
                ["xattr", "-p", attr_name, str(path)],
                check=False,
                capture_output=True,
                text=True,
            )
        except OSError:
            return ""
        if proc.returncode == 0:
            item_id = proc.stdout.strip().strip("\x00")
            if item_id:
                return item_id
    return ""


def drive_view_url(item_id: str) -> str:
    return f"https://drive.google.com/file/d/{item_id}/view?usp=sharing"


def file_url(path: Path) -> str:
    item_id = read_drive_item_id(path)
    return drive_view_url(item_id) if item_id else ""


def write_if_changed(path: Path, content: str) -> bool:
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    os.replace(tmp_path, path)
    return True


def versioned_script_src(filename: str, content: str) -> str:
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]
    return f'./{filename}?v={digest}'


def update_index_html_versions(outputs: list[tuple[Path, str, str]]) -> bool:
    index_html = REPO_ROOT / "index.html"
    if not index_html.exists():
        return False
    html = index_html.read_text(encoding="utf-8")
    original = html
    for output, content, _summary in outputs:
        if output.suffix != ".js":
            continue
        filename = re.escape(output.name)
        src = versioned_script_src(output.name, content)
        html = re.sub(
            rf'src="\./{filename}(?:\?v=[^"]+)?"',
            f'src="{src}"',
            html,
        )
    if html == original:
        return False
    write_if_changed(index_html, html)
    return True


def js_payload(value: object) -> str:
    return json.dumps(value, indent=2, ensure_ascii=True)


def render_global(var_name: str, value: object, prefix: str = "const") -> str:
    return (
        f"// Generated from synced Google Drive files. Do not edit by hand.\n"
        f"{prefix} {var_name} = {js_payload(value)};\n\n"
        f"if (typeof window !== 'undefined') {{\n"
        f"  window.{var_name} = {var_name};\n"
        f"}}\n"
    )


def parse_pier(path: Path) -> str:
    for candidate in (path.parent.name, path.name):
        match = PIER_RE.search(candidate)
        if match:
            return match.group(0).upper()
    return ""


def parse_pile_key(path: Path) -> str:
    match = PILE_RE.search(path.stem)
    if not match:
        return ""
    suffix = match.group(2).lower()
    return f"{int(match.group(1))}{suffix}"


def suffix_for_duplicate(index: int) -> str:
    if index <= 0:
        return ""
    letters = []
    while index:
        index -= 1
        letters.append(chr(ord("a") + (index % 26)))
        index //= 26
    return "".join(reversed(letters))


def generate_bored_pile_index(root: Path) -> tuple[dict[str, dict[str, str]], list[str]]:
    casing_root = root / "Substructure Works/01-Bored Pile Works/01-MAINLINE/01-CASING"
    grouped: dict[tuple[str, str], list[tuple[float, str, str]]] = defaultdict(list)
    warnings: list[str] = []
    for path in casing_root.rglob("*.pdf"):
        pier = parse_pier(path)
        pile_key = parse_pile_key(path)
        url = file_url(path)
        if not pier or not pile_key:
            warnings.append(f"bored_pile skipped unreadable pier/pile: {path}")
            continue
        if not url:
            warnings.append(f"bored_pile skipped missing Drive id: {path}")
            continue
        grouped[(pier, pile_key)].append((path.stat().st_mtime, path.name, url))

    index: dict[str, dict[str, str]] = defaultdict(dict)
    for (pier, pile_key), files in grouped.items():
        files.sort(key=lambda item: (-item[0], natural_key(item[1])))
        base_match = re.match(r"^(\d+)([a-z]*)$", pile_key)
        if not base_match:
            continue
        base_number, explicit_suffix = base_match.groups()
        for duplicate_index, (_mtime, _name, url) in enumerate(files):
            key = f"{base_number}{explicit_suffix}" if explicit_suffix and duplicate_index == 0 else f"{base_number}{suffix_for_duplicate(duplicate_index)}"
            while key in index[pier]:
                duplicate_index += 1
                key = f"{base_number}{suffix_for_duplicate(duplicate_index)}"
            index[pier][key] = url

    return (
        {
            pier: dict(sorted(files.items(), key=lambda item: natural_key(item[0])))
            for pier, files in sorted(index.items(), key=lambda item: natural_key(item[0]))
        },
        warnings,
    )


def normalize_point(value: str) -> str:
    return re.sub(r"\s+", "", value.upper().replace("-", ""))


def point_from_path(path: Path) -> str:
    for candidate in (path.stem, path.parent.name):
        match = POINT_RE.search(candidate)
        if match:
            return normalize_point(match.group(0))
    return ""


def station_target(path: Path) -> tuple[str, str, str]:
    rel = str(path).upper()
    if "02-ANGELES SIG-COM" in rel:
        station = "angeles_sigcom"
    elif "01-ANGELES STATION" in rel:
        station = "angeles"
    elif "02-CLARK SIG-COM" in rel:
        station = "clark_sigcom"
    elif "01-CLARK STATION" in rel:
        station = "clark"
    elif "GENERAL BATTERY POST" in rel:
        station = "battery"
    else:
        return "", "", ""

    work = "deviate" if "DEVIATE" in rel else "casing"
    post = ""
    if station == "battery":
        m = re.search(r"\bBP[34]\b", rel)
        post = m.group(0) if m else ""
    return station, work, post


def battery_point_keys(path: Path) -> list[str]:
    text = f"{path.parent} {path.name}".upper()
    match = re.search(r"\bBP\s*([34])\s*[- ]*\(?\s*(\d{1,2})\s*\)?\s*#\s*(\d{1,2})", text)
    if not match:
        return []
    bp, group, point = (int(match.group(1)), int(match.group(2)), int(match.group(3)))
    return [f"BP{bp}{group}{point}", f"BP{bp}{group:02d}{point}"]


def generate_station_index(root: Path) -> tuple[dict[str, dict[str, dict[str, str]]], list[str]]:
    base = root / "Substructure Works/01-Bored Pile Works"
    index: dict[str, dict[str, dict[str, str]]] = defaultdict(lambda: {"casing": {}, "deviate": {}})
    warnings: list[str] = []
    for path in base.rglob("*.pdf"):
        station, work, post = station_target(path)
        if not station:
            continue
        points = battery_point_keys(path) if station == "battery" else []
        point = point_from_path(path)
        if point:
            points.append(point)
        url = file_url(path)
        points = list(dict.fromkeys(points))
        if not points:
            warnings.append(f"station skipped unreadable point: {path}")
            continue
        if not url:
            warnings.append(f"station skipped missing Drive id: {path}")
            continue
        for point in points:
            index[station][work][point] = url

    return (
        {
            station: {
                work: dict(sorted(files.items(), key=lambda item: natural_key(item[0])))
                for work, files in works.items()
            }
            for station, works in sorted(index.items())
        },
        warnings,
    )


def substation_target(path: Path) -> tuple[str, str]:
    rel = str(path).upper()
    m = re.search(r"\bSS(18|19|20|21)\b", rel)
    if not m:
        return "", ""
    work = "deviate" if "DEVIATE" in rel else "casing"
    return f"ss{m.group(1)}", work


def generate_substation_index(root: Path) -> tuple[dict[str, dict[str, dict[str, str]]], list[str]]:
    base = root / "Substructure Works/01-Bored Pile Works/04-SUBSTATION"
    index: dict[str, dict[str, dict[str, str]]] = defaultdict(lambda: {"casing": {}, "deviate": {}})
    warnings: list[str] = []
    for path in base.rglob("*.pdf"):
        ss, work = substation_target(path)
        point = point_from_path(path)
        if ss and not point:
            pile_key = parse_pile_key(path)
            if pile_key and pile_key.isdigit():
                point = f"{ss.upper()}BP{pile_key}"
        url = file_url(path)
        if not ss or not point:
            warnings.append(f"substation skipped unreadable point: {path}")
            continue
        if not url:
            warnings.append(f"substation skipped missing Drive id: {path}")
            continue
        index[ss][work][point] = url
        short = re.sub(r"^SS\d+", "", point)
        if short:
            index[ss][work].setdefault(short, url)

    return (
        {
            ss: {
                work: dict(sorted(files.items(), key=lambda item: natural_key(item[0])))
                for work, files in works.items()
            }
            for ss, works in sorted(index.items())
        },
        warnings,
    )


ALIGN_TYPES = {
    "elasto": ("ELASTOMERIC", "ELASTO"),
    "final_align": ("FINAL ALIGNMENT", "FINAL ALIGN"),
    "seismic": ("SEISMIC",),
    "pre_upstand": ("PRE", "UPSTAND"),
    "pre_ocs": ("PRE", "OCS"),
    "post_upstand": ("POST", "UPSTAND"),
    "post_ocs": ("POST", "OCS"),
}


def span_key(text: str) -> str:
    pair = re.search(
        r"\bP-?(\d+[A-Z]*)\s*(?:TO|[-–])\s*P?-?(\d+[A-Z]*)\b",
        text.upper(),
    )
    if pair:
        return f"P-{pair.group(1)}-P-{pair.group(2)}"
    tokens = re.findall(r"P-\d+[A-Z]*|P\d+[A-Z]*", text.upper())
    normalized = [token if token.startswith("P-") else "P-" + token[1:] for token in tokens]
    distinct = list(dict.fromkeys(normalized))
    if len(distinct) >= 2:
        return f"{distinct[0]}-{distinct[1]}"
    return ""


def span_label(key: str) -> str:
    match = re.fullmatch(r"(P-\d+[A-Z]*)-(P-\d+[A-Z]*)", key, re.IGNORECASE)
    if not match:
        return ""
    return f"{match.group(1).upper()} to {match.group(2).upper()}"


def alignment_type(path: Path) -> str:
    text = f"{path.parent.name} {path.name}".upper()
    for key, tokens in ALIGN_TYPES.items():
        if all(token in text for token in tokens):
            return key
    return ""


def generate_alignment_index(root: Path) -> tuple[dict[str, dict[str, str]], list[str]]:
    base = root / "Superstructure Works/02-Final Alignment"
    index: dict[str, dict[str, str]] = {key: {} for key in ALIGN_TYPES}
    warnings: list[str] = []
    for path in base.rglob("*.pdf"):
        key = span_key(path.stem) or span_key(path.parent.name)
        work = alignment_type(path)
        url = file_url(path)
        if not key or not work:
            warnings.append(f"alignment skipped unreadable span/type: {path}")
            continue
        if not url:
            warnings.append(f"alignment skipped missing Drive id: {path}")
            continue
        index[work][key] = url
    return (
        {work: dict(sorted(files.items(), key=lambda item: natural_key(item[0]))) for work, files in index.items()},
        warnings,
    )


CIS_STAGE_RULES = [
    ("Bottom Formwork", ("BOTTOM", "FORM")),
    ("Bottom Slab / Blister / End Wall", ("BOTTOM", "SLAB")),
    ("Web / Inner Wall", ("WEB",)),
    ("Duct Lower", ("DUCT",)),
    ("Top Slab Formwork", ("TOP", "FORM")),
    ("Top Slab As-Built", ("TOP", "AS")),
    ("Shear Key / Seismic", ("SEISMIC",)),
    ("Top Drain", ("DRAIN",)),
    ("Check Elevation / Load Test", ("ELEVATION",)),
]


def cis_key(text: str) -> str:
    match = CIS_RE.search(text)
    if not match:
        return ""
    return f"CIS{int(match.group(1))}-{int(match.group(2))}"


def cis_stage(path: Path) -> str:
    text = path.name.upper()
    if "WEB" in text or "INNER WALL" in text:
        return "Web / Inner Wall"
    if "BLISTER" in text or "END WALL" in text:
        return "Bottom Slab / Blister / End Wall"
    for stage, tokens in CIS_STAGE_RULES:
        if all(token in text for token in tokens):
            return stage
    return "Other"


def generate_cis_index(root: Path) -> tuple[dict[str, list[dict[str, str]]], list[str]]:
    base = root / "Cast In-Situ"
    records: list[dict[str, str]] = []
    warnings: list[str] = []
    for path in base.rglob("*.pdf"):
        text = f"{path.parent} {path.name}"
        cis = cis_key(text)
        span = span_label(span_key(text))
        url = file_url(path)
        if not cis:
            warnings.append(f"cis skipped unreadable CIS id: {path}")
            continue
        if not url:
            warnings.append(f"cis skipped missing Drive id: {path}")
            continue
        wir_match = WIR_RE.search(path.name)
        records.append({
            "cis": cis,
            "span": span,
            "stage": cis_stage(path),
            "date": "",
            "wir": wir_match.group(1) if wir_match else "",
            "file": path.name,
            "url": url,
            "folder": str(path.parent.relative_to(root)),
        })

    # Some valid files sit directly in the CIS folder and do not repeat the
    # pier range in their filename.  If that CIS has exactly one known span,
    # safely attach those files to it instead of dropping them in the UI.
    spans_by_cis: dict[str, set[str]] = defaultdict(set)
    for record in records:
        if record["span"]:
            spans_by_cis[record["cis"]].add(record["span"])
    for record in records:
        if not record["span"] and len(spans_by_cis[record["cis"]]) == 1:
            record["span"] = next(iter(spans_by_cis[record["cis"]]))
    records.sort(key=lambda record: natural_key(f"{record['cis']} {record['span']} {record['stage']} {record['file']}"))
    return {"records": records}, warnings


def render_bored_index(index: dict[str, dict[str, str]]) -> str:
    return (
        "// Generated from synced Google Drive files for Main line Bored Pile/Casing links. Do not edit by hand.\n"
        "(function(){\n"
        f"  const index = {js_payload(index)};\n"
        "  if (typeof window !== 'undefined') {\n"
        "    window.MAINLINE_BORED_PILE_PDF_INDEX = index;\n"
        "    window.MAINLINE_PDF_INDEX = window.MAINLINE_PDF_INDEX || {};\n"
        "    window.MAINLINE_PDF_INDEX.bored_pile = Object.assign({}, window.MAINLINE_PDF_INDEX.bored_pile || {}, index);\n"
        "  }\n"
        "})();\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=SURVEY_ROOT)
    parser.add_argument("--quiet-warnings", action="store_true")
    args = parser.parse_args()

    outputs = []
    all_warnings: list[str] = []

    bored, warnings = generate_bored_pile_index(args.root)
    all_warnings.extend(warnings)
    outputs.append((REPO_ROOT / "bored-pile-pdf-index.js", render_bored_index(bored), f"bored_pile {len(bored)} piers / {sum(len(v) for v in bored.values())} links"))

    station, warnings = generate_station_index(args.root)
    all_warnings.extend(warnings)
    outputs.append((REPO_ROOT / "station-pdf-index.js", render_global("STATION_PDF_INDEX", station), f"station {sum(len(w) for works in station.values() for w in works.values())} links"))

    substation, warnings = generate_substation_index(args.root)
    all_warnings.extend(warnings)
    outputs.append((REPO_ROOT / "substation-pdf-index.js", render_global("SUBSTATION_PDF_INDEX", substation), f"substation {sum(len(w) for works in substation.values() for w in works.values())} links"))

    alignment, warnings = generate_alignment_index(args.root)
    all_warnings.extend(warnings)
    outputs.append((REPO_ROOT / "alignment-pdf-index.js", render_global("ALIGNMENT_PDF_INDEX", alignment, prefix="var"), f"alignment {sum(len(v) for v in alignment.values())} links"))

    cis, warnings = generate_cis_index(args.root)
    all_warnings.extend(warnings)
    outputs.append((REPO_ROOT / "cis-pdf-index.js", render_global("CIS_PDF_INDEX", cis), f"cis {len(cis['records'])} records"))

    changed = []
    for output, content, summary in outputs:
        if write_if_changed(output, content):
            changed.append(output.name)
        print(f"{output.name}: {summary}")
    if update_index_html_versions(outputs):
        changed.append("index.html")

    print(f"{'updated ' + ', '.join(changed) if changed else 'unchanged'}")
    if not args.quiet_warnings:
        for warning in all_warnings[:30]:
            print(f"warning: {warning}")
        if len(all_warnings) > 30:
            print(f"warning: ... {len(all_warnings) - 30} more warnings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
