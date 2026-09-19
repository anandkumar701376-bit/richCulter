import csv
from pathlib import Path

import requests
from PIL import Image, ImageDraw
from io import BytesIO


INPUT_CSV = Path("data/raw/commons_candidates_review.csv")
OUTPUT_IMAGE = Path("data/raw/ellora_commons_candidates.jpg")

HEADERS = {
    "User-Agent": "CultureProject/1.0 (educational cultural-data project)"
}

THUMB_WIDTH = 300
THUMB_HEIGHT = 220
LABEL_HEIGHT = 60
COLUMNS = 2


def download_image(url: str):
    response = requests.get(
        url,
        headers=HEADERS,
        timeout=20,
    )

    response.raise_for_status()

    return Image.open(
        BytesIO(response.content)
    ).convert("RGB")


def main():

    if not INPUT_CSV.exists():
        print(f"CSV not found: {INPUT_CSV}")
        return

    with INPUT_CSV.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as file:

        rows = list(csv.DictReader(file))

    if not rows:
        print("No candidates found.")
        return

    rows = rows[:10]

    rows_count = len(rows)
    rows_per_column = (rows_count + COLUMNS - 1) // COLUMNS

    sheet_width = COLUMNS * THUMB_WIDTH
    sheet_height = rows_per_column * (
        THUMB_HEIGHT + LABEL_HEIGHT
    )

    sheet = Image.new(
        "RGB",
        (sheet_width, sheet_height),
        "white",
    )

    draw = ImageDraw.Draw(sheet)

    for index, row in enumerate(rows):

        candidate_number = row["candidate_number"]
        title = row["commons_file"]

        print(
            f"Downloading candidate #{candidate_number}..."
        )

        try:
            image = download_image(
                row["thumbnail_url"]
            )

            image.thumbnail(
                (THUMB_WIDTH - 20, THUMB_HEIGHT - 20)
            )

            column = index % COLUMNS
            row_number = index // COLUMNS

            x = column * THUMB_WIDTH
            y = row_number * (
                THUMB_HEIGHT + LABEL_HEIGHT
            )

            image_x = x + (
                THUMB_WIDTH - image.width
            ) // 2

            image_y = y + (
                THUMB_HEIGHT - image.height
            ) // 2

            sheet.paste(
                image,
                (image_x, image_y),
            )

            draw.text(
                (x + 10, y + THUMB_HEIGHT + 5),
                f"#{candidate_number} {title[:42]}",
                fill="black",
            )

            draw.text(
                (x + 10, y + THUMB_HEIGHT + 25),
                f"License: {row['license']}",
                fill="black",
            )

        except Exception as error:

            print(
                f"Could not download candidate "
                f"#{candidate_number}: {error}"
            )

    OUTPUT_IMAGE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    sheet.save(
        OUTPUT_IMAGE,
        quality=90,
    )

    print()
    print("=" * 70)
    print("COMPLETE")
    print("=" * 70)
    print(f"Created: {OUTPUT_IMAGE}")


if __name__ == "__main__":
    main()