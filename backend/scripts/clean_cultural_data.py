import csv
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

RAW_FILE = BACKEND_DIR / "data" / "raw" / "unesco_india_ich.csv"
CLEANED_DIR = BACKEND_DIR / "data" / "cleaned"

STATE_OUTPUT = CLEANED_DIR / "unesco_state_items.csv"
NATIONAL_OUTPUT = CLEANED_DIR / "unesco_national_items.csv"
MULTI_STATE_OUTPUT = CLEANED_DIR / "unesco_multi_state_items.csv"
MULTINATIONAL_OUTPUT = CLEANED_DIR / "unesco_multinational_items.csv"


def clean_text(value):
    """Remove unnecessary whitespace."""
    if value is None:
        return ""

    return " ".join(value.strip().split())


def clean():
    if not RAW_FILE.exists():
        print(f"ERROR: Input file not found: {RAW_FILE}")
        sys.exit(1)

    CLEANED_DIR.mkdir(parents=True, exist_ok=True)

    state_rows = []
    national_rows = []
    multi_state_rows = []
    multinational_rows = []

    seen = {
        "state": set(),
        "national": set(),
        "multi_state": set(),
        "multinational": set(),
    }

    with RAW_FILE.open(
        "r",
        encoding="utf-8",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        required_columns = {
            "scope",
            "state",
            "code",
            "category",
            "title",
            "inscription_year",
            "description",
            "source_name",
            "source_url",
        }

        missing = required_columns - set(reader.fieldnames or [])

        if missing:
            print(
                "ERROR: Missing columns:",
                ", ".join(sorted(missing)),
            )
            sys.exit(1)

        for row in reader:

            # Clean all text fields
            row = {
                key: clean_text(value)
                for key, value in row.items()
            }

            scope = row["scope"].lower()
            state = row["state"]
            title = row["title"]

            # Basic validation
            if not title:
                print("WARNING: Skipping row with empty title.")
                continue

            if not row["description"]:
                print(f"WARNING: Empty description: {title}")

            if not row["source_url"]:
                print(f"WARNING: Missing source URL: {title}")

            # Duplicate key
            duplicate_key = (
                state.lower(),
                title.lower(),
            )

            if duplicate_key in seen.get(scope, set()):
                print(
                    f"SKIP duplicate: [{scope}] {title}"
                )
                continue

            if scope not in seen:
                print(
                    f"WARNING: Unknown scope '{scope}' "
                    f"for: {title}"
                )
                continue

            seen[scope].add(duplicate_key)

            # Separate by scope
            if scope == "state":
                if not state:
                    print(
                        f"WARNING: State record has no state: {title}"
                    )

                state_rows.append(row)

            elif scope == "national":
                national_rows.append(row)

            elif scope == "multi_state":
                multi_state_rows.append(row)

            elif scope == "multinational":
                multinational_rows.append(row)

    fieldnames = [
        "scope",
        "state",
        "code",
        "category",
        "title",
        "inscription_year",
        "description",
        "source_name",
        "source_url",
    ]

    outputs = [
        (STATE_OUTPUT, state_rows),
        (NATIONAL_OUTPUT, national_rows),
        (MULTI_STATE_OUTPUT, multi_state_rows),
        (MULTINATIONAL_OUTPUT, multinational_rows),
    ]

    for output_file, rows in outputs:

        with output_file.open(
            "w",
            encoding="utf-8",
            newline="",
        ) as file:

            writer = csv.DictWriter(
                file,
                fieldnames=fieldnames,
            )

            writer.writeheader()
            writer.writerows(rows)

    print()
    print("========== CLEANING COMPLETE ==========")
    print(f"State records:          {len(state_rows)}")
    print(f"National records:       {len(national_rows)}")
    print(f"Multi-state records:    {len(multi_state_rows)}")
    print(f"Multinational records:  {len(multinational_rows)}")
    print(
        f"Total cleaned:          "
        f"{len(state_rows) + len(national_rows) + len(multi_state_rows) + len(multinational_rows)}"
    )

    print()
    print("Files created:")

    for output_file, rows in outputs:
        print(f"  {output_file} ({len(rows)} records)")


if __name__ == "__main__":
    clean()