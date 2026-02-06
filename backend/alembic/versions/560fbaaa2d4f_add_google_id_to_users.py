"""Add google_id to users

Revision ID: 560fbaaa2d4f
Revises: 4c932a3af86f
Create Date: 2026-02-06 14:39:12.087811

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '560fbaaa2d4f'
down_revision: Union[str, None] = '4c932a3af86f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
