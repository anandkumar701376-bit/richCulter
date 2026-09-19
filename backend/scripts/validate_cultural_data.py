"""
Rich Culture - Cultural Data Quality Checker

Run from the backend directory:

    python scripts\validate_cultural_data.py

The checker is READ-ONLY. It does not update or delete database records.

It checks:
- exact duplicate titles within the same state
- possible near-duplicate titles
- test/placeholder records
- missing title/description/state/category
- title formatting issues
- cultural items without sources
- possible state mismatches mentioned explicitly in descriptions
- simple category/content warnings
"""

from __future__ import annotations

import difflib
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.db.session import SessionLocal
from app.models.cultural_item import CulturalItem
from app.models.state import State
from app.models.category import Category
from app.models.source import Source



BACKEND_DIR = Path(__file__).resolve().parents[1]
REPORT_DIR = BACKEND_DIR / "data" / "cleaned"
REPORT_FILE = REPORT_DIR / "data_quality_report.json"

TEST_PATTERNS = [
    r"\btest\b",
    r"\bdummy\b",
    r"\bsample\b",
    r"\bplaceholder\b",
]

CATEGORY_KEYWORDS = {
    "Music": [
        "song", "songs", "music", "singing", "chanting",
        "melody", "musical", "drumming", "instrument",
    ],
    "Dance": [
        "dance", "dancing", "choreography", "performer",
    ],
    "Theatre": [
        "theatre", "theater", "ritual theatre", "drama",
    ],
    "Food": [
        "food", "dish", "curry", "recipe", "cuisine",
        "rice", "bread", "sweet", "fish", "spice",
    ],
    "Clothing": [
        "clothing", "dress", "saree", "sari", "garment",
        "textile", "attire", "wear", "costume",
    ],
    "Festivals": [
        "festival", "celebration", "celebrated", "feast",
        "annual festival",
    ],
    "Arts & Crafts": [
        "craft", "handicraft", "painting", "weaving",
        "pottery", "carving", "embroidery", "art form",
    ],
}

TITLE_CLEAN_RE = re.compile(r"\s+")


def clean_text(value: str | None) -> str:
    return (value or "").strip()


def has_test_pattern(text: str) -> bool:
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in TEST_PATTERNS)


def title_format_issues(title: str) -> list[str]:
    issues = []

    if title != title.strip():
        issues.append("leading/trailing whitespace")

    if re.search(r"\s{2,}", title):
        issues.append("multiple consecutive spaces")

    if title != title.strip():
        return issues

    if title and title[0].islower():
        issues.append("starts with lowercase letter")

    return issues


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(
        None,
        a.lower().strip(),
        b.lower().strip(),
    ).ratio()


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    db = SessionLocal()

    try:
        items = db.execute(
            select(CulturalItem)
            .options(
                joinedload(CulturalItem.state),
                joinedload(CulturalItem.category),
                joinedload(CulturalItem.sources),
            )
        ).unique().scalars().all()

        states = db.execute(select(State)).scalars().all()

        total_items = len(items)

        exact_duplicates: dict[tuple[str, str], list[dict]] = defaultdict(list)
        title_records: list[dict] = []

        missing_data = []
        test_records = []
        title_issues = []
        no_source_records = []
        possible_state_mismatches = []
        category_warnings = []

        state_names = {
            clean_text(state.name)
            for state in states
            if clean_text(state.name)
        }

        for item in items:
            title = clean_text(item.title)
            description = clean_text(item.description)
            state_name = clean_text(item.state.name if item.state else None)
            category_name = clean_text(item.category.name if item.category else None)

            record = {
                "id": str(item.id),
                "title": title,
                "state": state_name,
                "category": category_name,
            }

            title_records.append(record)

            # Exact duplicate key: state + normalized title.
            exact_key = (state_name.lower(), title.lower())
            exact_duplicates[exact_key].append(record)

            # Missing required data.
            missing_fields = []

            if not title:
                missing_fields.append("title")
            if not description:
                missing_fields.append("description")
            if not state_name:
                missing_fields.append("state")
            if not category_name:
                missing_fields.append("category")

            if missing_fields:
                missing_data.append({
                    **record,
                    "missing_fields": missing_fields,
                })

            # Test / placeholder content.
            combined = f"{title} {description}"
            if has_test_pattern(combined):
                test_records.append({
                    **record,
                    "reason": "title or description contains a test/placeholder keyword",
                })

            # Formatting.
            issues = title_format_issues(item.title or "")
            if issues:
                title_issues.append({
                    **record,
                    "issues": issues,
                })

            # Source coverage.
            if not item.sources:
                no_source_records.append(record)

            # Conservative state mismatch heuristic.
            # Only flag when another known state name appears in the description
            # as a whole word. This is a REVIEW flag, never an automatic correction.
            description_lower = description.lower()
            other_states = [
                s for s in state_names
                if s.lower() != state_name.lower()
                and re.search(rf"\b{re.escape(s.lower())}\b", description_lower)
            ]

            if other_states:
                possible_state_mismatches.append({
                    **record,
                    "other_states_mentioned_in_description": sorted(other_states),
                })

            # Conservative category/content warning.
            # Only flag if a strong keyword points to another category and the
            # current category is different. This is for human review.
            for candidate_category, keywords in CATEGORY_KEYWORDS.items():
                if category_name.lower() == candidate_category.lower():
                    continue

                matched = [
                    keyword for keyword in keywords
                    if re.search(rf"\b{re.escape(keyword)}\b", combined.lower())
                ]

                if matched:
                    category_warnings.append({
                        **record,
                        "possible_category": candidate_category,
                        "matched_keywords": matched[:8],
                    })
                    break

        duplicate_groups = [
            records
            for records in exact_duplicates.values()
            if len(records) > 1
        ]

        # Near duplicate detection within the same state.
        near_duplicate_groups = []
        by_state: dict[str, list[dict]] = defaultdict(list)

        for record in title_records:
            by_state[record["state"].lower()].append(record)

        seen_pairs: set[tuple[str, str]] = set()

        for state_name, state_items in by_state.items():
            for i in range(len(state_items)):
                for j in range(i + 1, len(state_items)):
                    a = state_items[i]
                    b = state_items[j]

                    pair = tuple(sorted((a["id"], b["id"])))
                    if pair in seen_pairs:
                        continue

                    score = similarity(a["title"], b["title"])

                    # Conservative threshold. Generic titles can still be
                    # reviewed, but exact duplicates are reported separately.
                    if 0.82 <= score < 1.0:
                        seen_pairs.add(pair)
                        near_duplicate_groups.append({
                            "state": a["state"],
                            "similarity": round(score, 3),
                            "items": [a, b],
                        })

        report = {
            "summary": {
                "total_cultural_items": total_items,
                "exact_duplicate_groups": len(duplicate_groups),
                "possible_near_duplicate_pairs": len(near_duplicate_groups),
                "test_or_placeholder_records": len(test_records),
                "records_with_missing_required_data": len(missing_data),
                "title_formatting_issues": len(title_issues),
                "records_without_sources": len(no_source_records),
                "possible_state_mismatches": len(possible_state_mismatches),
                "possible_category_warnings": len(category_warnings),
            },
            "exact_duplicates": duplicate_groups,
            "near_duplicates": near_duplicate_groups,
            "test_records": test_records,
            "missing_data": missing_data,
            "title_issues": title_issues,
            "records_without_sources": no_source_records,
            "possible_state_mismatches": possible_state_mismatches,
            "category_warnings": category_warnings,
        }

        REPORT_FILE.write_text(
            json.dumps(report, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        print("=" * 60)
        print("RICH CULTURE DATA QUALITY REPORT")
        print("=" * 60)
        print(f"Total cultural items       : {total_items}")
        print(f"Exact duplicate groups     : {len(duplicate_groups)}")
        print(f"Possible near-duplicates   : {len(near_duplicate_groups)}")
        print(f"Test/placeholder records   : {len(test_records)}")
        print(f"Missing required data      : {len(missing_data)}")
        print(f"Title formatting issues    : {len(title_issues)}")
        print(f"Records without sources    : {len(no_source_records)}")
        print(f"Possible state mismatches  : {len(possible_state_mismatches)}")
        print(f"Category review warnings   : {len(category_warnings)}")
        print("-" * 60)
        print(f"JSON report: {REPORT_FILE}")
        print("=" * 60)

        if test_records:
            print("\nTEST / PLACEHOLDER RECORDS:")
            for record in test_records:
                print(f"  - {record['title']} [{record['state']}]")

        if duplicate_groups:
            print("\nEXACT DUPLICATES:")
            for group in duplicate_groups:
                print("  - " + " | ".join(
                    f"{r['title']} [{r['state']}]"
                    for r in group
                ))

        if near_duplicate_groups:
            print("\nPOSSIBLE NEAR-DUPLICATES:")
            for group in near_duplicate_groups:
                a, b = group["items"]
                print(
                    f"  - {a['title']} <-> {b['title']} "
                    f"[{group['state']}, similarity={group['similarity']}]"
                )

        if possible_state_mismatches:
            print("\nPOSSIBLE STATE MISMATCHES:")
            for record in possible_state_mismatches:
                print(
                    f"  - {record['title']} [{record['state']}] "
                    f"mentions: {', '.join(record['other_states_mentioned_in_description'])}"
                )

        print("\nNOTE: This checker is READ-ONLY.")
        print("Review warnings before making database changes.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
