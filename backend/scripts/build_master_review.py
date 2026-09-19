import csv
from pathlib import Path


MASTER_CSV = Path(
    "data/raw/culture_master_review.csv"
)

APPROVAL_CSV = Path(
    "data/raw/image_approval.csv"
)

OUTPUT_CSV = Path(
    "data/raw/culture_final_import.csv"
)


def load_csv(path: Path):
    with path.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        return list(csv.DictReader(file))


def main():

    if not MASTER_CSV.exists():
        print(f"Missing: {MASTER_CSV}")
        return

    if not APPROVAL_CSV.exists():
        print(f"Missing: {APPROVAL_CSV}")
        return

    master_rows = load_csv(MASTER_CSV)
    approval_rows = load_csv(APPROVAL_CSV)

    approved_ellora = [
        row
        for row in approval_rows
        if row["approved"].strip().lower() == "yes"
    ]

    # Validate Ellora approval
    if len(approved_ellora) > 4:
        raise ValueError(
            "More than 4 Ellora images approved."
        )

    primary_count = sum(
        row["image_role"].strip().lower() == "primary"
        for row in approved_ellora
    )

    if primary_count != 1:
        raise ValueError(
            "Ellora must have exactly one primary image."
        )

    final_rows = []

    for row in master_rows:

        culture_title = row[
            "culture_title"
        ]

        # Ellora gets its approved Wikimedia images
        if culture_title.lower() == "ellora caves":

            for image in approved_ellora:

                final_rows.append({
                    "culture_title": culture_title,
                    "wikipedia_title": row[
                        "wikipedia_title"
                    ],
                    "wikipedia_url": row[
                        "wikipedia_url"
                    ],
                    "summary": row[
                        "summary"
                    ],
                    "media_role": image[
                        "image_role"
                    ],
                    "commons_file": image[
                        "commons_file"
                    ],
                    "original_image_url": image[
                        "original_image_url"
                    ],
                    "thumbnail_url": image[
                        "thumbnail_url"
                    ],
                    "commons_url": image[
                        "commons_url"
                    ],
                    "author": image[
                        "author"
                    ],
                    "license": image[
                        "license"
                    ],
                    "license_url": image[
                        "license_url"
                    ],
                    "description": image[
                        "description"
                    ],
                })

        else:

            # Existing Wikimedia image
            final_rows.append({
                "culture_title": culture_title,
                "wikipedia_title": row[
                    "wikipedia_title"
                ],
                "wikipedia_url": row[
                    "wikipedia_url"
                ],
                "summary": row[
                    "summary"
                ],
                "media_role": "primary",
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
                    "image_description"
                ],
            })

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "culture_title",
        "wikipedia_title",
        "wikipedia_url",
        "summary",
        "media_role",
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
        writer.writerows(final_rows)

    print()
    print("=" * 70)
    print("FINAL IMPORT DATASET CREATED")
    print("=" * 70)

    print(
        f"Records: {len(final_rows)}"
    )

    print(
        f"Created: {OUTPUT_CSV}"
    )

    print()

    for title in sorted(
        set(
            row["culture_title"]
            for row in final_rows
        )
    ):

        count = sum(
            row["culture_title"] == title
            for row in final_rows
        )

        print(
            f"- {title}: {count} image record(s)"
        )


if __name__ == "__main__":
    main()