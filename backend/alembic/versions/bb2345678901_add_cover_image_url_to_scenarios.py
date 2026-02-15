"""add cover_image_url to scenarios

Revision ID: bb2345678901
Revises: aa1234567891
Create Date: 2026-02-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb2345678901'
down_revision = 'aa1234567891'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('scenarios', sa.Column('cover_image_url', sa.String(length=500), nullable=True))


def downgrade():
    op.drop_column('scenarios', 'cover_image_url')
