import csv
from pathlib import Path


INPUT_CSV = Path(
    "data/raw/commons_candidates_review.csv"
)

OUTPUT_CSV = Path(
    "data/raw/image_approval.csv"
)


def main():

    if not INPUT_CSV.exists():
        print(f"Missing file: {INPUT_CSV}")
        return

    with INPUT_CSV.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        rows = list(csv.DictReader(file))

    if not rows:
        print("No candidate images found.")
        return

    output_rows = []

    for row in rows:

        output_rows.append({
            "cultural_item": "Ellora Caves",
            "candidate_number": row[
                "candidate_number"
            ],
            "approved": "",
            "image_role": "",
            "commons_file": row[
                "commons_file"
            ],
            "original_image_url": row[
                "original_image_url"
            ],
            "thumbnail_url": row[
                "thumbnail_url"
            ],
            "commons_url": row[
                "commons_url"
            ],
            "author": row[
                "author"
            ],
            "license": row[
                "license"
            ],
            "license_url": row[
                "license_url"
            ],
            "description": row[
                "description"
            ],
        })

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "cultural_item",
        "candidate_number",
        "approved",
        "image_role",
        "commons_file",
        "original_image_url",
        "thumbnail_url",
        "commons_url",
        "author",
        "license",
        "license_url",
        "description",
    ]

    with OUTPUT_CSV.open(
        "w",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()
        writer.writerows(output_rows)

    print("=" * 70)
    print("IMAGE APPROVAL FILE CREATED")
    print("=" * 70)
    print(f"Candidates: {len(output_rows)}")
    print(f"Created: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()