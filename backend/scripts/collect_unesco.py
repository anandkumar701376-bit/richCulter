import csv
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BACKEND_DIR / "data" / "raw"
OUTPUT_FILE = RAW_DIR / "unesco_india_ich.csv"


UNESCO_SOURCE = (
    "https://ich.unesco.org/en/state/india-IN"
    "?info=elements-on-the-lists"
)


DATA = [
    {
        "scope": "state",
        "state": "Gujarat",
        "code": "GJ",
        "category": "Dance",
        "title": "Garba of Gujarat",
        "inscription_year": "2023",
        "description": (
            "Traditional Garba cultural practice of Gujarat "
            "inscribed on UNESCO's Representative List of the "
            "Intangible Cultural Heritage of Humanity."
        ),
    },
    {
        "scope": "state",
        "state": "West Bengal",
        "code": "WB",
        "category": "Festival",
        "title": "Durga Puja in Kolkata",
        "inscription_year": "2021",
        "description": (
            "Annual festival tradition associated particularly "
            "with Kolkata and West Bengal."
        ),
    },
    {
        "scope": "national",
        "state": "",
        "code": "IN",
        "category": "Festival",
        "title": "Kumbh Mela",
        "inscription_year": "2017",
        "description": (
            "Major Indian cultural and religious congregation "
            "inscribed on UNESCO's Representative List."
        ),
    },
    {
        "scope": "national",
        "state": "",
        "code": "IN",
        "category": "Tradition",
        "title": "Yoga",
        "inscription_year": "2016",
        "description": (
            "Indian tradition of yoga inscribed on UNESCO's "
            "Representative List."
        ),
    },
    {
        "scope": "state",
        "state": "Punjab",
        "code": "PB",
        "category": "Craft",
        "title": (
            "Traditional brass and copper craft of utensil "
            "making among the Thatheras of Jandiala Guru"
        ),
        "inscription_year": "2014",
        "description": (
            "Traditional brass and copper utensil-making craft "
            "practiced by the Thatheras of Jandiala Guru in Punjab."
        ),
    },
    {
        "scope": "state",
        "state": "Manipur",
        "code": "MN",
        "category": "Music and Dance",
        "title": "Sankirtana",
        "inscription_year": "2013",
        "description": (
            "Ritual singing, drumming and dancing tradition "
            "of Manipur."
        ),
    },
    {
        "scope": "state",
        "state": "Ladakh",
        "code": "LA",
        "category": "Music and Chanting",
        "title": "Buddhist chanting of Ladakh",
        "inscription_year": "2012",
        "description": (
            "Sacred Buddhist chanting tradition practiced "
            "in the Ladakh region."
        ),
    },
    {
        "scope": "state",
        "state": "",
        "code": "IN",
        "category": "Dance",
        "title": "Chhau dance",
        "inscription_year": "2010",
        "description": (
            "Traditional Chhau dance tradition associated "
            "with eastern India."
        ),
    },
    {
        "scope": "state",
        "state": "Rajasthan",
        "code": "RJ",
        "category": "Music and Dance",
        "title": "Kalbelia folk songs and dances of Rajasthan",
        "inscription_year": "2010",
        "description": (
            "Traditional folk songs and dances associated "
            "with the Kalbelia community of Rajasthan."
        ),
    },
    {
        "scope": "state",
        "state": "Kerala",
        "code": "KL",
        "category": "Dance and Theatre",
        "title": "Mudiyettu",
        "inscription_year": "2010",
        "description": (
            "Ritual theatre and dance drama tradition of Kerala."
        ),
    },
    {
        "scope": "state",
        "state": "Uttarakhand",
        "code": "UK",
        "category": "Festival and Theatre",
        "title": "Ramman",
        "inscription_year": "2009",
        "description": (
            "Religious festival and ritual theatre tradition "
            "of the Garhwal Himalayas."
        ),
    },
    {
        "scope": "state",
        "state": "Kerala",
        "code": "KL",
        "category": "Theatre",
        "title": "Kutiyattam",
        "inscription_year": "2008",
        "description": (
            "Traditional Sanskrit theatre tradition of Kerala."
        ),
    },
    {
        "scope": "national",
        "state": "",
        "code": "IN",
        "category": "Tradition",
        "title": "Tradition of Vedic chanting",
        "inscription_year": "2008",
        "description": (
            "Traditional practice of transmitting Vedic chanting."
        ),
    },
    {
        "scope": "national",
        "state": "",
        "code": "IN",
        "category": "Theatre",
        "title": "Ramlila",
        "inscription_year": "2008",
        "description": (
            "Traditional performance of the Ramayana."
        ),
    },
    {
        "scope": "national",
        "state": "",
        "code": "IN",
        "category": "Festival",
        "title": "Deepavali",
        "inscription_year": "2025",
        "description": (
            "Indian festival tradition inscribed on UNESCO's "
            "Representative List in 2025."
        ),
    },
    {
        "scope": "multinational",
        "state": "",
        "code": "IN",
        "category": "Festival",
        "title": "Nawrouz",
        "inscription_year": "2024",
        "description": (
            "Multinational cultural celebration in which India "
            "is one of the participating countries."
        ),
    },
]


def collect():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

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

    rows = []

    for item in DATA:
        row = {
            **item,
            "source_name": "UNESCO Intangible Cultural Heritage",
            "source_url": UNESCO_SOURCE,
        }

        rows.append(row)

    with OUTPUT_FILE.open(
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

    print(f"Created: {OUTPUT_FILE}")
    print(f"Records collected: {len(rows)}")

    state_count = sum(
        1 for row in rows
        if row["scope"] == "state"
    )

    national_count = sum(
        1 for row in rows
        if row["scope"] == "national"
    )

    multinational_count = sum(
        1 for row in rows
        if row["scope"] == "multinational"
    )

    print(f"State records: {state_count}")
    print(f"National records: {national_count}")
    print(f"Multinational records: {multinational_count}")


if __name__ == "__main__":
    collect()