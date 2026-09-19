import csv
import sys
from pathlib import Path

from sqlalchemy import select

# Make backend importable when script is run directly
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal
from app.models.state import State
from app.models.category import Category
from app.models.cultural_item import CulturalItem
from app.models.source import Source


DEFAULT_CSV_FILE = (
    BACKEND_DIR
    / "data"
    / "imports"
    / "cultural_items.csv"
)


def get_csv_file():
    """
    Use CSV path provided in command line.
    If no path is provided, use the default import CSV.
    """

    if len(sys.argv) > 1:
        csv_file = Path(sys.argv[1])

        if not csv_file.is_absolute():
            csv_file = BACKEND_DIR / csv_file

        return csv_file

    return DEFAULT_CSV_FILE


def get_or_create_state(db, name, code):
    state = db.scalar(
        select(State).where(State.name == name)
    )

    if state:
        return state

    state = State(
        name=name,
        code=code,
    )

    db.add(state)
    db.flush()

    print(f"Created state: {name}")

    return state


def get_or_create_category(db, name):
    category = db.scalar(
        select(Category).where(Category.name == name)
    )

    if category:
        return category

    category = Category(
        name=name,
    )

    db.add(category)
    db.flush()

    print(f"Created category: {name}")

    return category


def cultural_item_exists(db, state_id, title):
    """
    Check whether this cultural item already exists
    in the same state.

    Category is intentionally NOT included in the duplicate check.
    This prevents records such as:

        Maharashtra + Ajanta Caves + Architecture
        Maharashtra + Ajanta Caves + Heritage Places

    from becoming two separate cultural items.
    """

    return db.scalar(
        select(CulturalItem).where(
            CulturalItem.state_id == state_id,
            CulturalItem.title == title,
        )
    )


def import_data():
    csv_file = get_csv_file()

    if not csv_file.exists():
        print(f"CSV file not found: {csv_file}")
        return

    print(f"Import file: {csv_file}")

    db = SessionLocal()

    imported = 0
    skipped = 0
    failed = 0

    try:
        with csv_file.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:

            reader = csv.DictReader(file)

            required_columns = {
                "state",
                "code",
                "category",
                "title",
                "description",
                "source_name",
                "source_url",
            }

            missing = required_columns - set(
                reader.fieldnames or []
            )

            if missing:
                raise ValueError(
                    "Missing CSV columns: "
                    + ", ".join(sorted(missing))
                )

            for row_number, row in enumerate(
                reader,
                start=2,
            ):

                try:
                    state_name = row["state"].strip()
                    state_code = row["code"].strip()
                    category_name = row["category"].strip()
                    title = row["title"].strip()
                    description = row["description"].strip()
                    source_name = row["source_name"].strip()
                    source_url = row["source_url"].strip()

                    # Basic validation
                    if not state_name:
                        print(
                            f"Row {row_number}: "
                            "missing state"
                        )
                        failed += 1
                        continue

                    if not state_code:
                        print(
                            f"Row {row_number}: "
                            "missing state code"
                        )
                        failed += 1
                        continue

                    if not category_name:
                        print(
                            f"Row {row_number}: "
                            "missing category"
                        )
                        failed += 1
                        continue

                    if not title:
                        print(
                            f"Row {row_number}: "
                            "missing title"
                        )
                        failed += 1
                        continue

                    if not description:
                        print(
                            f"Row {row_number}: "
                            "missing description"
                        )
                        failed += 1
                        continue

                    # Get or create state
                    state = get_or_create_state(
                        db,
                        state_name,
                        state_code,
                    )

                    # Get or create category
                    category = get_or_create_category(
                        db,
                        category_name,
                    )

                    # Duplicate check
                    existing = cultural_item_exists(
                        db,
                        state.id,
                        title,
                    )

                    if existing:
                        print(
                            f"Skipped duplicate: "
                            f"{state_name} → {title}"
                        )

                        skipped += 1
                        continue

                    # Create cultural item
                    cultural_item = CulturalItem(
                        state_id=state.id,
                        category_id=category.id,
                        title=title,
                        description=description,
                    )

                    db.add(cultural_item)
                    db.flush()

                    # Add source if available
                    if source_name:
                        source = Source(
                            cultural_item_id=cultural_item.id,
                            name=source_name,
                            url=source_url or None,
                        )

                        db.add(source)

                    imported += 1

                    print(
                        f"Imported: "
                        f"{state_name} → "
                        f"{category_name} → "
                        f"{title}"
                    )

                except Exception as row_error:
                    print(
                        f"Row {row_number} failed: "
                        f"{row_error}"
                    )

                    failed += 1

            db.commit()

            print(
                "\n========== IMPORT SUMMARY =========="
            )
            print(f"Imported : {imported}")
            print(f"Skipped  : {skipped}")
            print(f"Failed   : {failed}")
            print(
                "===================================="
            )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_data()