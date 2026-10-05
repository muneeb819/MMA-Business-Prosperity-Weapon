"""Cross-dialect SQLAlchemy types used by the application schema."""

from sqlalchemy import Text
from sqlalchemy.dialects.mssql import NVARCHAR

# SQL Server's legacy TEXT/NTEXT types are unsuitable for normal text queries.
# Keep the portable Text type elsewhere, but store long Unicode text as NVARCHAR(MAX)
# when the selected dialect is Microsoft SQL Server.
LONG_TEXT = Text().with_variant(NVARCHAR(None), "mssql")
