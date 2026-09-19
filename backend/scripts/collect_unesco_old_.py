import csv
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BACKEND_DIR / "data" / "raw"
OUTPUT_FILE = RAW_DIR / "unesco_india_ich.csv"


DATA = [
    {
        "state": "Gujarat",
        "code": "GJ",
        "category": "Dance",
        "title": "Garba of Gujarat",
        "description": "Traditional Garba cultural practice of Gujarat inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2023.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "West Bengal",
        "code": "WB",
        "category": "Festival",
        "title": "Durga Puja in Kolkata",
        "description": "Annual festival tradition associated particularly with Kolkata and West Bengal, inscribed on UNESCO's Representative List in 2021.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Festival",
        "title": "Kumbh Mela",
        "description": "Major Indian cultural and religious congregation inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2017.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Tradition",
        "title": "Yoga",
        "description": "Indian tradition of yoga inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2016.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Punjab",
        "code": "PB",
        "category": "Craft",
        "title": "Traditional brass and copper craft of utensil making among the Thatheras of Jandiala Guru",
        "description": "Traditional brass and copper utensil-making craft practiced by the Thatheras of Jandiala Guru in Punjab.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Manipur",
        "code": "MN",
        "category": "Music and Dance",
        "title": "Sankirtana",
        "description": "Ritual singing, drumming and dancing tradition of Manipur inscribed by UNESCO in 2013.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Ladakh",
        "code": "LA",
        "category": "Music and Chanting",
        "title": "Buddhist chanting of Ladakh",
        "description": "Recitation of sacred Buddhist texts in the trans-Himalayan Ladakh region.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Dance",
        "title": "Chhau dance",
        "description": "Traditional Chhau dance tradition inscribed on UNESCO's Representative List in 2010.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Rajasthan",
        "code": "RJ",
        "category": "Music and Dance",
        "title": "Kalbelia folk songs and dances of Rajasthan",
        "description": "Traditional folk songs and dances associated with the Kalbelia community of Rajasthan.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Kerala",
        "code": "KL",
        "category": "Dance and Theatre",
        "title": "Mudiyettu",
        "description": "Ritual theatre and dance drama tradition of Kerala inscribed by UNESCO in 2010.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Uttarakhand",
        "code": "UK",
        "category": "Festival and Theatre",
        "title": "Ramman",
        "description": "Religious festival and ritual theatre tradition of the Garhwal Himalayas.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "Kerala",
        "code": "KL",
        "category": "Theatre",
        "title": "Kutiyattam",
        "description": "Traditional Sanskrit theatre tradition of Kerala.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Tradition",
        "title": "Tradition of Vedic chanting",
        "description": "Traditional practice of transmitting Vedic chanting.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Theatre",
        "title": "Ramlila",
        "description": "Traditional performance of the Ramayana.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
    {
        "state": "India",
        "code": "IN",
        "category": "Festival",
        "title": "Deepavali",
        "description": "Indian cultural festival inscribed on UNESCO's Representative List in 2025.",
        "source_name": "UNESCO Intangible Cultural Heritage",
        "source_url": "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
    },
]


def collect():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "state",
        "code",
        "category",
        "title",
        "description",
        "source_name",
        "source_url",
    ]

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
        writer.writerows(DATA)

    print(f"Created: {OUTPUT_FILE}")
    print(f"Records collected: {len(DATA)}")


if __name__ == "__main__":
    collect()