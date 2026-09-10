from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]

MEDIA_ROOT = BASE_DIR.parent / "storage" / "media"

MEDIA_IMAGES_DIR = MEDIA_ROOT / "images"
MEDIA_VIDEOS_DIR = MEDIA_ROOT / "videos"
MEDIA_AUDIO_DIR = MEDIA_ROOT / "audio"