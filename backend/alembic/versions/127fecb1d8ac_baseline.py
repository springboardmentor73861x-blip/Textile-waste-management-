"""baseline

Revision ID: 127fecb1d8ac
Revises: 
Create Date: 2026-09-18 15:16:50.051023

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '127fecb1d8ac'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Baseline existing database schema."""
    pass


def downgrade() -> None:
    """Baseline migration has nothing to downgrade."""
    pass
