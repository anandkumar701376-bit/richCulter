import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import (
    MEDIA_IMAGES_DIR,
    MEDIA_VIDEOS_DIR,
    MEDIA_AUDIO_DIR,
)


# ============================================================
# MEDIA DIRECTORIES
# ============================================================

MEDIA_DIRECTORIES = {
    "image": MEDIA_IMAGES_DIR,
    "video": MEDIA_VIDEOS_DIR,
    "audio": MEDIA_AUDIO_DIR,
}


# ============================================================
# ALLOWED FILE EXTENSIONS
# ============================================================

ALLOWED_EXTENSIONS = {
    "image": {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
    },
    "video": {
        ".mp4",
        ".webm",
        ".mov",
        ".avi",
    },
    "audio": {
        ".mp3",
        ".wav",
        ".ogg",
        ".m4a",
    },
}


# ============================================================
# MAXIMUM FILE SIZE
# ============================================================

MAX_FILE_SIZE = {
    "image": 10 * 1024 * 1024,      # 10 MB
    "video": 500 * 1024 * 1024,     # 500 MB
    "audio": 50 * 1024 * 1024,      # 50 MB
}


# ============================================================
# ALLOWED MIME / CONTENT TYPES
# ============================================================

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


# ============================================================
# FILE SIGNATURES
# ============================================================

# These signatures allow us to verify that the actual file
# content matches the claimed image extension.
#
# We intentionally keep this conservative.
# Video/audio containers can have more complicated structures,
# so we don't pretend that one simple magic-byte check is enough
# for every format.
FILE_SIGNATURES = {
    "image": {
        ".jpg": [
            (0, b"\xff\xd8\xff"),
        ],
        ".jpeg": [
            (0, b"\xff\xd8\xff"),
        ],
        ".png": [
            (0, b"\x89PNG\r\n\x1a\n"),
        ],
        ".gif": [
            (0, b"GIF87a"),
            (0, b"GIF89a"),
        ],
        ".webp": [
            (0, b"RIFF"),
            (8, b"WEBP"),
        ],
    },
}


# ============================================================
# GET MEDIA DIRECTORY
# ============================================================

def get_media_directory(media_type: str) -> Path:
    """
    Return the directory used for a particular media type.

    Creates the directory if it does not already exist.
    """

    media_type = media_type.lower().strip()

    directory = MEDIA_DIRECTORIES.get(media_type)

    if directory is None:
        raise ValueError("Unsupported media type")

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return directory


# ============================================================
# GENERATE SAFE UNIQUE FILENAME
# ============================================================

def generate_filename(original_filename: str | None) -> str:
    """
    Generate a UUID-based filename while preserving
    the original file extension.

    Example:
        photo.jpg
        ->
        550e8400-e29b-41d4-a716-446655440000.jpg
    """

    extension = Path(
        original_filename or ""
    ).suffix.lower()

    return f"{uuid.uuid4()}{extension}"


# ============================================================
# BASIC FILE VALIDATION
# ============================================================

def validate_media_file(
    file: UploadFile,
    media_type: str,
) -> None:
    """
    Validate:

    1. Media type
    2. File extension
    3. MIME/content type
    """

    media_type = media_type.lower().strip()

    # --------------------------------------------------------
    # Validate media type
    # --------------------------------------------------------

    if media_type not in MEDIA_DIRECTORIES:
        raise ValueError(
            "Unsupported media type. "
            "Allowed types: image, video, audio"
        )

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    original_filename = file.filename or ""

    if not original_filename.strip():
        raise ValueError(
            "File name is required"
        )

    # --------------------------------------------------------
    # Validate extension
    # --------------------------------------------------------

    extension = Path(
        original_filename
    ).suffix.lower()

    if not extension:
        raise ValueError(
            "File must have an extension"
        )

    allowed_extensions = ALLOWED_EXTENSIONS[
        media_type
    ]

    if extension not in allowed_extensions:

        allowed = ", ".join(
            sorted(allowed_extensions)
        )

        raise ValueError(
            f"Invalid file type for {media_type}. "
            f"Allowed extensions: {allowed}"
        )

    # --------------------------------------------------------
    # Validate MIME / Content-Type
    # --------------------------------------------------------

    content_type = (
        file.content_type or ""
    ).lower().strip()

    allowed_content_types = (
        ALLOWED_CONTENT_TYPES[
            media_type
        ]
    )

    if content_type not in allowed_content_types:

        allowed = ", ".join(
            sorted(allowed_content_types)
        )

        raise ValueError(
            f"Invalid content type for {media_type}. "
            f"Allowed content types: {allowed}"
        )


# ============================================================
# FILE SIGNATURE VALIDATION
# ============================================================

async def validate_file_signature(
    file: UploadFile,
    media_type: str,
    extension: str,
) -> None:
    """
    Verify that the beginning of the file matches
    the expected signature for supported formats.
    """

    signatures = (
        FILE_SIGNATURES
        .get(media_type, {})
        .get(extension)
    )

    # No signature rule for this format.
    #
    # Extension + MIME validation will still be performed.
    if not signatures:
        return

    # --------------------------------------------------------
    # Read only the required header bytes
    # --------------------------------------------------------

    header = await file.read(12)

    # Reset the file pointer so the actual upload starts
    # from byte zero.
    await file.seek(0)

    # --------------------------------------------------------
    # Check signatures
    # --------------------------------------------------------

    for offset, signature in signatures:

        if (
            header[
                offset:
                offset + len(signature)
            ]
            == signature
        ):
            return

    raise ValueError(
        f"File content does not match "
        f"the {extension} file type"
    )


# ============================================================
# SAVE MEDIA FILE
# ============================================================

async def save_media_file(
    file: UploadFile,
    media_type: str,
) -> tuple[str, str]:
    """
    Validate and save an uploaded media file.

    Returns:

        (
            physical_file_path,
            storage_key
        )
    """

    media_type = media_type.lower().strip()

    # --------------------------------------------------------
    # 1. Basic validation
    # --------------------------------------------------------

    validate_media_file(
        file=file,
        media_type=media_type,
    )

    # --------------------------------------------------------
    # 2. Get extension
    # --------------------------------------------------------

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    # --------------------------------------------------------
    # 3. Validate file signature
    # --------------------------------------------------------

    await validate_file_signature(
        file=file,
        media_type=media_type,
        extension=extension,
    )

    # --------------------------------------------------------
    # 4. Get destination directory
    # --------------------------------------------------------

    directory = get_media_directory(
        media_type
    )

    # --------------------------------------------------------
    # 5. Generate safe unique filename
    # --------------------------------------------------------

    filename = generate_filename(
        file.filename
    )

    file_path = directory / filename

    # --------------------------------------------------------
    # 6. Get maximum allowed size
    # --------------------------------------------------------

    max_size = MAX_FILE_SIZE[
        media_type
    ]

    # --------------------------------------------------------
    # 7. Stream file to disk
    # --------------------------------------------------------

    total_size = 0

    try:

        with file_path.open("wb") as output_file:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(chunk)

                # ------------------------------------------------
                # Size validation
                # ------------------------------------------------

                if total_size > max_size:

                    max_size_mb = (
                        max_size
                        // (1024 * 1024)
                    )

                    raise ValueError(
                        f"File is too large. "
                        f"Maximum size for "
                        f"{media_type} is "
                        f"{max_size_mb} MB"
                    )

                output_file.write(
                    chunk
                )

    except Exception:

        # --------------------------------------------------------
        # Delete partially uploaded file
        # --------------------------------------------------------

        if file_path.exists():

            file_path.unlink()

        raise

    # --------------------------------------------------------
    # 8. Generate database storage key
    # --------------------------------------------------------

    storage_key = (
        f"{media_type}s/{filename}"
    )

    return (
        str(file_path),
        storage_key,
    )


# ============================================================
# GENERATE MEDIA URL
# ============================================================

def get_media_url(
    storage_type: str,
    storage_key: str | None,
    url: str | None,
) -> str | None:
    """
    Convert stored media information into a URL
    usable by the frontend.
    """

    if storage_type == "external":
        return url

    if (
        storage_type == "local"
        and storage_key
    ):
        return f"/media/{storage_key}"

    return None