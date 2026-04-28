"""Initial migration

Revision ID: 0001
Revises: 
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(200), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(200), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('app_name', sa.String(200), nullable=False),
        sa.Column('category', sa.String(50), default='other'),
        sa.Column('duration_minutes', sa.Float(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        'study_sessions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('subject', sa.String(200), default='General'),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Float(), nullable=True),
        sa.Column('break_minutes', sa.Float(), default=0),
        sa.Column('productivity_score', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
    )


def downgrade():
    op.drop_table('study_sessions')
    op.drop_table('activity_logs')
    op.drop_table('users')
