"""add hybrid media storage fields

Revision ID: 387606607604
Revises: 08897c88fffc
Create Date: 2026-09-10 13:30:13.905109
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '387606607604'
down_revision: Union[str, Sequence[str], None] = '08897c88fffc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "media",
        sa.Column(
            "storage_type",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.execute(
        "UPDATE media SET storage_type = 'external' "
        "WHERE storage_type IS NULL"
    )

    op.alter_column(
        "media",
        "storage_type",
        existing_type=sa.String(length=50),
        nullable=False,
    )

    op.add_column(
        "media",
        sa.Column(
            "storage_key",
            sa.Text(),
            nullable=True,
        ),
    )

    op.alter_column(
        "media",
        "url",
        existing_type=sa.Text(),
        nullable=True,
    )

def downgrade() -> None:
    op.alter_column(
        "media",
        "url",
        existing_type=sa.Text(),
        nullable=False,
    )

    op.drop_column("media", "storage_key")
    op.drop_column("media", "storage_type")