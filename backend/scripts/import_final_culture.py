import csv
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.cultural_item import CulturalItem
from app.models.media import Media
from app.models.state import State


CSV_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "raw"
    / "culture_final_import.csv"
)


STATE_MAPPING = {
    "Ajanta Caves": "Maharashtra",
    "Ellora Caves": "Maharashtra",
    "Elephanta Caves": "Maharashtra",
    "Bathukamma": "Telangana",
    "Warli Painting": "Maharashtra",
}


CATEGORY_MAPPING = {
    "Ajanta Caves": "Heritage Places",
    "Ellora Caves": "Heritage Places",
    "Elephanta Caves": "Heritage Places",
    "Bathukamma": "Festivals",
    "Warli Painting": "Arts & Crafts",
}


REQUIRED_COLUMNS = {
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
}


def load_csv():
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"CSV file not found: {CSV_PATH}"
        )

    with CSV_PATH.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        if reader.fieldnames is None:
            raise ValueError("CSV has no header row")

        missing = REQUIRED_COLUMNS - set(reader.fieldnames)

        if missing:
            raise ValueError(
                "CSV is missing required columns: "
                + ", ".join(sorted(missing))
            )

        rows = list(reader)

    if not rows:
        raise ValueError("CSV contains no records")

    return rows


def get_state(
    db: Session,
    state_name: str,
):
    return (
        db.query(State)
        .filter(State.name == state_name)
        .first()
    )


def get_category(
    db: Session,
    category_name: str,
):
    return (
        db.query(Category)
        .filter(Category.name == category_name)
        .first()
    )


def validate_mapping(
    db: Session,
    title: str,
):
    state_name = STATE_MAPPING.get(title)

    if not state_name:
        raise ValueError(
            f"No state mapping found for: {title}"
        )

    category_name = CATEGORY_MAPPING.get(title)

    if not category_name:
        raise ValueError(
            f"No category mapping found for: {title}"
        )

    state = get_state(
        db,
        state_name,
    )

    if state is None:
        raise ValueError(
            f"State not found in database: {state_name}"
        )

    category = get_category(
        db,
        category_name,
    )

    if category is None:
        raise ValueError(
            f"Category not found in database: {category_name}"
        )

    return state, category


def get_existing_item(
    db: Session,
    title: str,
):
    return (
        db.query(CulturalItem)
        .filter(CulturalItem.title == title)
        .first()
    )


def clean(value):
    if value is None:
        return None

    value = value.strip()

    return value if value else None


def create_media_from_row(
    db: Session,
    item: CulturalItem,
    row: dict,
):
    image_url = clean(
        row.get("original_image_url")
    )

    if not image_url:
        return None, False

    # Prevent duplicate media for the same
    # cultural item and image URL.
    existing_media = (
        db.query(Media)
        .filter(
            Media.cultural_item_id == item.id,
            Media.url == image_url,
        )
        .first()
    )

    if existing_media is not None:
        return existing_media, False

    commons_file = clean(
        row.get("commons_file")
    )

    media_role = clean(
        row.get("media_role")
    )

    if commons_file and media_role:
        media_title = (
            f"{commons_file} ({media_role})"
        )
    else:
        media_title = (
            commons_file
            or media_role
            or "Cultural image"
        )

    media = Media(
        cultural_item_id=item.id,
        media_type="image",
        storage_type="external",
        storage_key=None,
        url=image_url,
        title=media_title,
        author=clean(row.get("author")),
        license=clean(row.get("license")),
        license_url=clean(
            row.get("license_url")
        ),
        source_url=clean(
            row.get("commons_url")
        ),
    )

    db.add(media)

    return media, True


def run_import(dry_run=True):
    rows = load_csv()

    db = SessionLocal()

    created_items = 0
    existing_items = 0
    created_media = 0
    skipped_media = 0

    try:
        processed_items = {}

        for row in rows:
            title = clean(
                row.get("culture_title")
            )

            if not title:
                raise ValueError(
                    "CSV contains a row without "
                    "culture_title"
                )

            # Find/create the cultural item only once
            # for each unique title.
            if title not in processed_items:
                state, category = validate_mapping(
                    db,
                    title,
                )

                existing = get_existing_item(
                    db,
                    title,
                )

                if existing is not None:
                    item = existing
                    existing_items += 1
                else:
                    description = (
                        clean(row.get("description"))
                        or clean(row.get("summary"))
                    )

                    item = CulturalItem(
                        state_id=state.id,
                        category_id=category.id,
                        title=title,
                        description=description,
                    )

                    db.add(item)
                    db.flush()

                    created_items += 1

                processed_items[title] = item

            else:
                item = processed_items[title]

            # Create media only if it does not already exist.
            media, was_created = create_media_from_row(
                db,
                item,
                row,
            )

            if was_created:
                created_media += 1
            else:
                skipped_media += 1

        print()
        print("========== IMPORT SUMMARY ==========")
        print(f"CSV rows:              {len(rows)}")
        print(
            f"Unique cultural items: "
            f"{len(processed_items)}"
        )
        print(
            f"New cultural items:    "
            f"{created_items}"
        )
        print(
            f"Existing items:        "
            f"{existing_items}"
        )
        print(
            f"Media records created: "
            f"{created_media}"
        )
        print(
            f"Media records skipped: "
            f"{skipped_media}"
        )
        print(f"Dry run:               {dry_run}")
        print("====================================")
        print()

        if dry_run:
            db.rollback()

            print("DRY RUN COMPLETE")
            print("No database changes were saved.")

        else:
            db.commit()

            print("IMPORT COMPLETE")
            print("Database changes committed.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    run_import(dry_run=False)