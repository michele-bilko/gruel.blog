#!/usr/bin/env python3
"""
gruel.blog auto formatter

Turns rows from the "Essay Publication Form" responses CSV into .md articles
in the right content/<section>/ folder, and downloads each article's image
into public/images/uploads/.

Run it like this:
    python3 auto-formatting-script/format-essay.py
    python3 auto-formatting-script/format-essay.py path/to/responses.csv

Everything likely to change lives in the SETTINGS section below.
"""

import csv
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Settings

CSV_PATH = "autoformat_script_form - Form Responses 1.csv" # you can also run it with a path as an arg

# Which submissions to format, based on the "Timestamp" 
# DAYS_BACK to a number to take everything from the last N days.
# Or set DAYS_BACK = None and fill in START_DATE / END_DATE ("YYYY-MM-DD",
# both inclusive; either one can be None for "no limit").
DAYS_BACK = 7
START_DATE = None   # e.g. "2026-10-01"
END_DATE = None     # e.g. "2026-10-15"

# If an .md file with the same name already exists, overwrite it?
# False = skip it (just for now ig).
OVERWRITE = False

# True = print what would be written without creating any files.
DRY_RUN = False

# SECTIONS
# Key = answer under form's "Section" question
# folder = folder under content/ (must match a slug in src/lib/categories.js)
# subcat_column = column holding that section's subcategory, or None
# subcategories = form answer -> the site filters on (must match the subcategories list in src/lib/categories.js)
#
# To add a section: add the option to the form, add an entry to CATEGORIES in
# categories.js, make the content/ folder, then add an entry here.
# To add a subcategory: add it to the form, to categories.js, and to the
# matching "subcategories" dict here.
SECTIONS = {
    "essays": {
        "folder": "essays",
        "subcat_column": "Essay Subcategory",
        "subcategories": {
            "art": "art",
            "books": "books",
            "food": "food",
            "misc": "misc",
            "movies": "movies",
            "music": "music",
        },
    },
    "interviews/profiles": {
        "folder": "interviews-profiles",
        "subcat_column": None,
        "subcategories": {},
    },
    "real life things": {
        "folder": "real-life-things",
        "subcat_column": "Real Life Things Subcategory",
        "subcategories": {
            "boston": "boston",
            "nyc": "new york",
        },
    },
    "review": {
        "folder": "reviews",
        "subcat_column": "Review Subcategory",
        "subcategories": {
            "new releases...": "new releases",
            "rethinking": "rethinking...",
        },
    },
    # Not on the form yet, but the site has it:
    "misc": {
        "folder": "misc",
        "subcat_column": None,
        "subcategories": {},
    },
}

# FORM COLUMN NAMES
# If a question on the form is renamed, update the matching value here.
COLUMNS = {
    "timestamp": "Timestamp",
    "section": "Section",
    "title": "Title",
    "subtitle": "Subtitle",
    "author": "Author",
    "date": "Date",
    "tags": "Tags (separated by comma, i.e.: cat, dog, fish)",
    "image": "Image",
    "essay": "Essay",
    "editor": "Editor",  # not written to the .md, used to filter
}

# Date formats Google Forms/Sheets does
TIMESTAMP_FORMATS = ["%m/%d/%Y %H:%M:%S", "%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M:%S"]
DATE_FORMATS = ["%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y"]

# Block-quote markers
QUOTE_OPEN = ">"
QUOTE_CLOSE = "<"

# Paths dont touch

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent                      # gruel-blog/
CONTENT_DIR = REPO_ROOT / "content"
UPLOADS_DIR = REPO_ROOT / "public" / "images" / "uploads"
UPLOADS_URL = "/images/uploads"                    # how the site refers to it


# Helper I hardly know her

def warn(msg):
    print(f"  ! {msg}")


def parse_with_formats(value, formats):
    value = (value or "").strip()
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def date_window():
    """Return (start, end) datetimes for the submission filter."""
    if DAYS_BACK is not None:
        return datetime.now() - timedelta(days=DAYS_BACK), None
    start = datetime.strptime(START_DATE, "%Y-%m-%d") if START_DATE else None
    end = (datetime.strptime(END_DATE, "%Y-%m-%d") + timedelta(days=1)
           if END_DATE else None)  # +1 day so END_DATE is inclusive
    return start, end


def slugify(text):
    """lowercase, words joined by hyphens, safe for filenames and URLs."""
    text = (text or "").lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "untitled"


def build_name(section_folder, subcategory, author, title):
    """section_(subcategory)_author_title, each part slugified."""
    parts = [section_folder, subcategory, author, title]
    return "_".join(slugify(p) for p in parts if p)


def yaml_str(value):
    """quote a string so titles with colons, #, quotes etc. stay valid YAML."""
    return json.dumps(value, ensure_ascii=False)


def parse_tags(raw):
    return [t.strip() for t in (raw or "").split(",") if t.strip()]


def paragraphs(text):
    """split plain text into paragraphs on line breaks"""
    return [p.strip() for p in re.split(r"\s*\n\s*", text) if p.strip()]


def format_essay(raw):
    """
    "Intro. >A quote.< More text. >Another quote.< End."
    line breaks in the form answer become paragraph breaks.
    """
    raw = (raw or "").replace("\r\n", "\n").replace("\r", "\n")
    blocks = []
    pos = 0
    while pos < len(raw):
        start = raw.find(QUOTE_OPEN, pos)
        if start == -1:
            blocks += paragraphs(raw[pos:])
            break
        end = raw.find(QUOTE_CLOSE, start + 1)
        if end == -1:
            warn(f'a "{QUOTE_OPEN}" has no closing "{QUOTE_CLOSE}"; '
                 "left as plain text")
            blocks += paragraphs(raw[pos:])
            break
        blocks += paragraphs(raw[pos:start])
        quote_lines = paragraphs(raw[start + 1:end])
        # KEEP CLOSING REMARK PUNCUTUATION ON SAMELINE AS QUOTE!!!
        trailing = re.match(r"[.,;:!?\"'”’)]+", raw[end + 1:])
        if trailing:
            if quote_lines:
                quote_lines[-1] += trailing.group(0)
            end += len(trailing.group(0))
        if quote_lines:
            # blank "> " line between quote paragraphs keeps them in one quote.
            blocks.append("\n>\n".join(f"> {line}" for line in quote_lines))
        pos = end + 1
    # blank line between every block
    return "\n\n".join(blocks) + "\n"


# get images from Google Drive (form upload maybe will change IDK)
# made Claude write this cause I was getting mad at regexes and urllib and stuff

def drive_file_ids(raw):
    """Pull Drive file IDs out of the Image column (may hold several links)."""
    ids = []
    for link in re.split(r"[,\s]+", raw or ""):
        if not link:
            continue
        parsed = urlparse(link)
        file_id = parse_qs(parsed.query).get("id", [None])[0]
        if not file_id:
            m = re.search(r"/d/([\w-]+)", parsed.path)
            file_id = m.group(1) if m else None
        if file_id:
            ids.append(file_id)
        else:
            warn(f"couldn't read a Drive file id from: {link}")
    return ids


def guess_extension(data, content_type):
    if data.startswith(b"\x89PNG"):
        return ".png"
    if data.startswith(b"\xff\xd8"):
        return ".jpg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if "png" in content_type:
        return ".png"
    if "jpeg" in content_type or "jpg" in content_type:
        return ".jpg"
    return None


def download_drive_image(file_id, base_name):
    """
    Download a Drive file and save it as <base_name>.<ext> in the uploads
    folder. Returns the site path (/images/uploads/...) or None on failure.

    The file must be shared as "Anyone with the link can view" (sharing the
    form's upload folder that way covers every upload).
    """
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            content_type = resp.headers.get("Content-Type", "")
    except (urllib.error.URLError, TimeoutError) as e:
        warn(f"image download failed ({e}); article written without image")
        return None

    ext = guess_extension(data, content_type)
    if not ext:
        warn("Drive didn't return an image (usually means the file isn't "
             "shared as 'Anyone with the link'); article written without image")
        return None

    filename = base_name + ext
    if DRY_RUN:
        print(f"  would save image  {UPLOADS_DIR / filename}")
    else:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        (UPLOADS_DIR / filename).write_bytes(data)
        print(f"  saved image       public/images/uploads/{filename}")
    return f"{UPLOADS_URL}/{filename}"




# Main

def build_markdown(fields):
    lines = ["---",
             f"title: {yaml_str(fields['title'])}",
             f"author: {yaml_str(fields['author'])}",
             f"date: {fields['date']}",
             "tags: [" + ", ".join(yaml_str(t) for t in fields["tags"]) + "]"]
    if fields.get("subcategory"):
        lines.append(f"subcategory: {yaml_str(fields['subcategory'])}")
    if fields.get("image"):
        lines.append(f"image: {fields['image']}")
    if fields.get("subtitle"):
        lines.append(f"subtitle: {yaml_str(fields['subtitle'])}")
    lines.append("---")
    return "\n".join(lines) + "\n" + fields["body"]


def process_row(row, rownum):
    get = lambda key: (row.get(COLUMNS[key]) or "").strip()

    title, author = get("title"), get("author")
    print(f"\nrow {rownum}: {title or '(no title)'} by {author or '(no author)'}")

    section_answer = get("section")
    section = SECTIONS.get(section_answer)
    if not section:
        warn(f'unknown section "{section_answer}" (add it to SECTIONS); skipped')
        return False

    subcategory = None
    if section["subcat_column"]:
        answer = (row.get(section["subcat_column"]) or "").strip()
        if answer:
            subcategory = section["subcategories"].get(answer)
            if subcategory is None:
                warn(f'unknown subcategory "{answer}" for {section_answer} '
                     "(add it to SECTIONS); written without a subcategory")

    if not title or not author:
        warn("missing title or author; skipped")
        return False

    pub_date = parse_with_formats(get("date"), DATE_FORMATS)
    if not pub_date:
        warn(f'couldn\'t read date "{get("date")}"; skipped')
        return False

    name = build_name(section["folder"], subcategory, author, title)
    out_dir = CONTENT_DIR / section["folder"]
    out_path = out_dir / f"{name}.md"

    if out_path.exists() and not OVERWRITE:
        print(f"  exists, skipped   content/{section['folder']}/{name}.md")
        return False

    image_path = None
    file_ids = drive_file_ids(get("image"))
    if len(file_ids) > 1:
        warn("more than one image uploaded; the site shows one, using the first")
    if file_ids:
        image_path = download_drive_image(file_ids[0], f"{name}_image")

    md = build_markdown({
        "title": title,
        "author": author,
        "date": pub_date.strftime("%Y-%m-%d"),
        "tags": parse_tags(get("tags")),
        "subcategory": subcategory,
        "image": image_path,
        "subtitle": get("subtitle"),
        "body": format_essay(get("essay")),
    })

    if DRY_RUN:
        print(f"  would write       content/{section['folder']}/{name}.md")
        print("  " + md.replace("\n", "\n  "))
    else:
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path.write_text(md, encoding="utf-8")
        print(f"  wrote             content/{section['folder']}/{name}.md")
    return True


def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(CSV_PATH)
    if not csv_path.is_absolute() and not csv_path.exists():
        csv_path = SCRIPT_DIR / csv_path
    if not csv_path.exists():
        sys.exit(f"CSV not found: {csv_path}")

    start, end = date_window()
    print(f"reading {csv_path.name}")
    print(f"submissions from {start or 'the beginning'} to {end or 'now'}"
          + ("  [DRY RUN]" if DRY_RUN else ""))

    written = skipped_by_date = 0
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        for rownum, row in enumerate(csv.DictReader(f), start=2):
            ts = parse_with_formats(row.get(COLUMNS["timestamp"]), TIMESTAMP_FORMATS)
            if ts is None:
                print(f"\nrow {rownum}: unreadable timestamp, skipped")
                continue
            if (start and ts < start) or (end and ts >= end):
                skipped_by_date += 1
                continue
            if process_row(row, rownum):
                written += 1

    print(f"\ndone: {written} article(s) "
          f"{'would be ' if DRY_RUN else ''}written, "
          f"{skipped_by_date} outside the date range")


if __name__ == "__main__":
    main()