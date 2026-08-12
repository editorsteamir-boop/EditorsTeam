#!/usr/bin/env python3
"""Convert the categorized Fonto font catalog into a reviewable SQL data migration."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    rows = json.loads(args.catalog.read_text(encoding="utf-8"))
    values = ",\n".join(
        f"  ({quote(row['file_name'])}, {quote(row['category'])}, {quote(row['preview_text'])})"
        for row in rows
    )
    sql = f"""-- Categorized live previews for every active Fonto font, derived from the bundled APK catalog.

begin;
set local lock_timeout = '5s';

create temporary table fonto_font_preview_seed (
  file_name text primary key,
  category text not null,
  preview_text text not null
) on commit drop;

insert into fonto_font_preview_seed (file_name, category, preview_text) values
{values};

update public.fonto_fonts as fonts
set category = seed.category,
    preview_text = seed.preview_text
from fonto_font_preview_seed as seed
where fonts.file_name = seed.file_name;

do $$
begin
  if (select count(*) from public.fonto_fonts where is_active and file_name in (select file_name from fonto_font_preview_seed)) <> {len(rows)} then
    raise exception 'Font preview seed did not match all {len(rows)} active fonts';
  end if;
end
$$;

commit;
"""
    args.output.write_text(sql, encoding="utf-8")
    print(f"Generated SQL for {len(rows)} font previews")


if __name__ == "__main__":
    main()
