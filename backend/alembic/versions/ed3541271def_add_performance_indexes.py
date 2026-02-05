"""add_performance_indexes

Revision ID: ed3541271def
Revises: ce73f5a4f549
Create Date: 2026-02-04 17:34:48.140222

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed3541271def'
down_revision: Union[str, None] = 'ce73f5a4f549'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users 테이블 인덱스
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_is_active', 'users', ['is_active'], unique=False)
    op.create_index('ix_users_auth_provider', 'users', ['auth_provider'], unique=False)

    # Scenarios 테이블 인덱스
    op.create_index('ix_scenarios_user_id_created_at', 'scenarios', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_scenarios_created_at', 'scenarios', ['created_at'], unique=False)

    # UsageLogs 테이블 인덱스
    op.create_index('ix_usage_logs_user_id_created_at', 'usage_logs', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_usage_logs_action', 'usage_logs', ['action'], unique=False)


def downgrade() -> None:
    # UsageLogs 테이블 인덱스 제거
    op.drop_index('ix_usage_logs_action', table_name='usage_logs')
    op.drop_index('ix_usage_logs_user_id_created_at', table_name='usage_logs')

    # Scenarios 테이블 인덱스 제거
    op.drop_index('ix_scenarios_created_at', table_name='scenarios')
    op.drop_index('ix_scenarios_user_id_created_at', table_name='scenarios')

    # Users 테이블 인덱스 제거
    op.drop_index('ix_users_auth_provider', table_name='users')
    op.drop_index('ix_users_is_active', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
