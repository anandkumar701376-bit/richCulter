import csv
from pathlib import Path

import requests


COMMONS_API = "https://commons.wikimedia.org/w/api.php"

INPUT_CSV = Path("data/raw/wikipedia_wikimedia_review.csv")
OUTPUT_CSV = Path("data/raw/commons_candidates_review.csv")

HEADERS = {
    "User-Agent": "CultureProject/1.0 (educational cultural-data project)"
}


def search_commons(search_text: str, limit: int = 10):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": search_text,
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": 500,
    }

    response = requests.get(
        COMMONS_API,
        params=params,
        headers=HEADERS,
        timeout=15,
    )

    response.raise_for_status()

    return response.json()


def metadata_value(metadata, name):
    value = metadata.get(name, "")

    if isinstance(value, dict):
        return value.get("value", "")

    return value


def clean_author(author):
    """
    Keep the Commons-provided author text.
    We do not attempt to guess or rewrite attribution.
    """
    return author.strip()


def main():

    search_text = "Ellora Caves"

    print("=" * 70)
    print("WIKIMEDIA COMMONS CANDIDATE SEARCH")
    print("=" * 70)
    print(f"Search: {search_text}")

    data = search_commons(search_text)

    pages = data.get("query", {}).get("pages", {})

    if not pages:
        print()
        print("No Commons results found.")
        return

    results = []

    for index, page in enumerate(pages.values(), start=1):

        imageinfo = page.get("imageinfo", [])

        if not imageinfo:
            continue

        info = imageinfo[0]
        metadata = info.get("extmetadata", {})

        title = page.get("title", "")

        commons_url = (
            "https://commons.wikimedia.org/wiki/"
            + title.replace(" ", "_")
        )

        author = clean_author(
            metadata_value(metadata, "Artist")
        )

        license_name = metadata_value(
            metadata,
            "LicenseShortName",
        )

        license_url = metadata_value(
            metadata,
            "LicenseUrl",
        )

        description = metadata_value(
            metadata,
            "ImageDescription",
        )

        result = {
            "candidate_number": index,
            "commons_file": title,
            "thumbnail_url": info.get("thumburl", ""),
            "original_image_url": info.get("url", ""),
            "commons_url": commons_url,
            "author": author,
            "license": license_name,
            "license_url": license_url,
            "description": description,
        }

        results.append(result)

        print()
        print("-" * 70)
        print(f"CANDIDATE #{index}")
        print("-" * 70)

        print(f"File: {title}")
        print(f"Author: {author or 'NOT PROVIDED'}")
        print(f"License: {license_name or 'NOT PROVIDED'}")
        print(f"Commons: {commons_url}")
        print(f"Original: {info.get('url', '')}")

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "candidate_number",
        "commons_file",
        "thumbnail_url",
        "original_image_url",
        "commons_url",
        "author",
        "license",
        "license_url",
        "description",
    ]

    with OUTPUT_CSV.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as output_file:

        writer = csv.DictWriter(
            output_file,
            fieldnames=fieldnames,
        )

        writer.writeheader()
        writer.writerows(results)

    print()
    print("=" * 70)
    print("COMPLETE")
    print("=" * 70)
    print(f"Candidates found: {len(results)}")
    print(f"Created: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()