import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import (
    MEDIA_IMAGES_DIR,
    MEDIA_VIDEOS_DIR,
    MEDIA_AUDIO_DIR,
)


MEDIA_DIRECTORIES = {
    "image": MEDIA_IMAGES_DIR,
    "video": MEDIA_VIDEOS_DIR,
    "audio": MEDIA_AUDIO_DIR,
}


ALLOWED_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".webp", ".gif"},
    "video": {".mp4", ".webm", ".mov", ".avi"},
    "audio": {".mp3", ".wav", ".ogg", ".m4a"},
}


MAX_FILE_SIZE = {
    "image": 10 * 1024 * 1024,    # 10 MB
    "video": 500 * 1024 * 1024,   # 500 MB
    "audio": 50 * 1024 * 1024,    # 50 MB
}


ALLOWED_CONTENT_TYPES = {
    "image": {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    },
    "video": {
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
    },
    "audio": {
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/x-m4a",
    },
}


FILE_SIGNATURES = {
    "image": {
        ".jpg": [(0, b"\xff\xd8\xff")],
        ".jpeg": [(0, b"\xff\xd8\xff")],
        ".png": [(0, b"\x89PNG\r\n\x1a\n")],
        ".gif": [(0, b"GIF87a"), (0, b"GIF89a")],
        ".webp": [(0, b"RIFF"), (8, b"WEBP")],
    },
}


def get_media_directory(media_type: str) -> Path:
    media_type = media_type.lower().strip()

    directory = MEDIA_DIRECTORIES.get(media_type)

    if directory is None:
        raise ValueError("Unsupported media type")

    directory.mkdir(parents=True, exist_ok=True)

    return directory


def generate_filename(original_filename: str | None) -> str:
    extension = Path(original_filename or "").suffix.lower()

    return f"{uuid.uuid4()}{extension}"


def validate_media_file(
    file: UploadFile,
    media_type: str,
) -> None:
    media_type = media_type.lower().strip()

    if media_type not in MEDIA_DIRECTORIES:
        raise ValueError("Unsupported media type")

    extension = Path(file.filename or "").suffix.lower()

    allowed_extensions = ALLOWED_EXTENSIONS[media_type]

    if extension not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))

        raise ValueError(
            f"Invalid file type for {media_type}. "
            f"Allowed extensions: {allowed}"
        )

    content_type = (file.content_type or "").lower().strip()

    allowed_content_types = ALLOWED_CONTENT_TYPES[media_type]

    if content_type not in allowed_content_types:
        allowed = ", ".join(sorted(allowed_content_types))

        raise ValueError(
            f"Invalid content type for {media_type}. "
            f"Allowed content types: {allowed}"
        )
        


async def validate_file_signature(
    file: UploadFile,
    media_type: str,
    extension: str,
) -> None:
    signatures = FILE_SIGNATURES.get(media_type, {}).get(extension)

    if not signatures:
        return

    header = await file.read(12)
    await file.seek(0)

    for offset, signature in signatures:
        if header[offset:offset + len(signature)] == signature:
            return

    raise ValueError(
        f"File content does not match the {extension} file type"
    )
    
    

async def save_media_file(
    file: UploadFile,
    media_type: str,
) -> tuple[str, str]:

    media_type = media_type.lower().strip()

    validate_media_file(file, media_type)
    
    extension = Path(file.filename or "").suffix.lower()

    await validate_file_signature(
    file=file,
    media_type=media_type,
    extension=extension,
)

    directory = get_media_directory(media_type)

    filename = generate_filename(file.filename)

    file_path = directory / filename

    max_size = MAX_FILE_SIZE[media_type]

    total_size = 0

    try:
        with file_path.open("wb") as output_file:

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > max_size:
                    raise ValueError(
                        f"File is too large. Maximum size for "
                        f"{media_type} is "
                        f"{max_size // (1024 * 1024)} MB"
                    )

                output_file.write(chunk)

    except Exception:
        if file_path.exists():
            file_path.unlink()
        raise

    storage_key = f"{media_type}s/{filename}"

    return str(file_path), storage_key


def get_media_url(storage_type: str, storage_key: str | None, url: str | None) -> str | None:
    if storage_type == "external":
        return url

    if storage_type == "local" and storage_key:
        return f"/media/{storage_key}"

    return None


