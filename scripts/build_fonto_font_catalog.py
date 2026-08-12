#!/usr/bin/env python3
"""Build categorized previews for Supabase font records from Fonto's APK."""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from collections import Counter
from pathlib import Path, PurePosixPath


PREVIEW_TEXT = {
    "persian": "ایران زیبا",
    "arabic": "الخط العربي",
    "english": "Font Preview",
    "hindi": "फ़ॉन्ट नमूना",
    "japanese": "フォント見本",
    "turkish": "Türkçe Yazı",
}


def normalize(value: str) -> str:
    value = Path(value).stem.lower()
    return re.sub(r"[^a-z0-9]+", "", value)


def category_from_path(path: str) -> str:
    parts = PurePosixPath(path).parts
    if "en" in parts:
        return "english"
    if "ja" in parts:
        return "japanese"
    if "hindi" in parts:
        return "hindi"
    if "turkish" in parts:
        return "turkish"
    name = PurePosixPath(path).name.lower()
    if name.startswith("ar_") or "arabic" in name or "urdu" in name or "ordo" in name:
        return "arabic"
    if name.startswith("en_") or re.match(r"^en[a-z]", name):
        return "english"
    if name.startswith("hi_") or name.startswith("ams"):
        return "hindi"
    if name.startswith("ja_"):
        return "japanese"
    if name.startswith("tr_") or "turkish" in name:
        return "turkish"
    return "persian"


def category_for_record(file_name: str, name: str, apk_index: dict[str, list[tuple[str, str]]]) -> str:
    candidates = apk_index.get(normalize(file_name), [])
    if not candidates:
        candidates = apk_index.get(normalize(name), [])
    categories = [category for _, category in candidates]
    if categories:
        return Counter(categories).most_common(1)[0][0]
    merged = f"{file_name} {name}".lower()
    if "apkhu fonts" in merged:
        return "english"
    if merged.startswith("ams") or "hindi" in merged:
        return "hindi"
    if "turkish" in merged:
        return "turkish"
    if merged.startswith("en"):
        return "english"
    return "persian"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apk", type=Path, required=True)
    parser.add_argument("--fonts-json", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    with zipfile.ZipFile(args.apk) as archive:
        paths = [
            path
            for path in archive.namelist()
            if path.startswith("assets/flutter_assets/assets/fonts/")
            and path.lower().endswith((".ttf", ".otf", ".woff", ".woff2"))
        ]
    apk_index: dict[str, list[tuple[str, str]]] = {}
    for path in paths:
        category = category_from_path(path)
        apk_index.setdefault(normalize(PurePosixPath(path).name), []).append((path, category))

    records = json.loads(args.fonts_json.read_text(encoding="utf-8"))
    catalog = []
    for record in records:
        category = category_for_record(record["file_name"], record["name"], apk_index)
        catalog.append(
            {
                "id": record["id"],
                "name": record["name"],
                "file_name": record["file_name"],
                "category": category,
                "preview_text": PREVIEW_TEXT[category],
            }
        )
    if len(catalog) != len(records):
        raise RuntimeError("Font catalog count mismatch")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(Counter(row["category"] for row in catalog), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
