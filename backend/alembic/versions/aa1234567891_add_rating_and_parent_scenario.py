"""add rating and parent_scenario_id to scenarios

Revision ID: aa1234567891
Revises: ff1234567890
Create Date: 2026-02-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'aa1234567891'
down_revision = '560fbaaa2d4f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('scenarios', sa.Column('rating', sa.String(length=10), nullable=True))
    op.add_column('scenarios', sa.Column('parent_scenario_id', UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        'fk_scenarios_parent_scenario_id',
        'scenarios', 'scenarios',
        ['parent_scenario_id'], ['id']
    )


def downgrade():
    op.drop_constraint('fk_scenarios_parent_scenario_id', 'scenarios', type_='foreignkey')
    op.drop_column('scenarios', 'parent_scenario_id')
    op.drop_column('scenarios', 'rating')
