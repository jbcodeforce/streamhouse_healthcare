"""PostgreSQL connection pool and schema/publication management."""

from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Any, Callable, Generator, Sequence

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

from config import get_settings

logger = logging.getLogger("healthcare.db")

CDC_PUBLICATION = "healthcare_cdc_publication"

_pool: pool.ThreadedConnectionPool | None = None


def get_connection_pool() -> pool.ThreadedConnectionPool:
    global _pool
    if _pool is None or _pool.closed:
        settings = get_settings()
        dsn = settings.database_url
        if "sslmode=" not in dsn:
            sep = "&" if "?" in dsn else "?"
            dsn = f"{dsn}{sep}sslmode=prefer"
        logger.info("Initializing PostgreSQL ThreadedConnectionPool")
        _pool = pool.ThreadedConnectionPool(minconn=1, maxconn=20, dsn=dsn)
    return _pool


def close_connection_pool() -> None:
    global _pool
    if _pool is not None and not _pool.closed:
        logger.info("Closing PostgreSQL ThreadedConnectionPool")
        _pool.closeall()
        _pool = None


@contextmanager
def cursor(
    dict_rows: bool = False, commit: bool = False
) -> Generator[psycopg2.extensions.cursor, None, None]:
    p = get_connection_pool()
    conn = p.getconn()
    try:
        cursor_factory = RealDictCursor if dict_rows else None
        cur = conn.cursor(cursor_factory=cursor_factory)
        try:
            yield cur
            if commit:
                conn.commit()
        finally:
            cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        p.putconn(conn)


def _ensure_cdc_table(cur: psycopg2.extensions.cursor, table_name: str) -> None:
    """Ensure PostgreSQL logical replication publication exists and contains table."""
    try:
        cur.execute(
            "SELECT 1 FROM pg_publication WHERE pubname = %s",
            (CDC_PUBLICATION,),
        )
        if not cur.fetchone():
            cur.execute(f"CREATE PUBLICATION {CDC_PUBLICATION}")
            logger.info("Created PostgreSQL publication %s", CDC_PUBLICATION)

        cur.execute(
            """
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = %s AND tablename = %s
            """,
            (CDC_PUBLICATION, table_name),
        )
        if not cur.fetchone():
            cur.execute(f"ALTER PUBLICATION {CDC_PUBLICATION} ADD TABLE {table_name}")
            logger.info("Added table %s to publication %s", table_name, CDC_PUBLICATION)
    except Exception as e:
        logger.warning("Could not register %s in CDC publication: %s", table_name, e)


def init_schema(ddl: str, cdc_table: str | None = None) -> None:
    """Execute idempotent DDL statements and optionally register with publication."""
    with cursor(commit=True) as cur:
        cur.execute(ddl)
        if cdc_table:
            _ensure_cdc_table(cur, cdc_table)


def seed_if_empty(
    table: str,
    rows: Sequence[Any],
    insert_sql: str,
    to_params: Callable[[Any], Sequence[Any]],
    label: str = "rows",
) -> int:
    """Seed table if it currently contains 0 records."""
    if not rows:
        return 0
    with cursor(commit=True) as cur:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        if count == 0:
            logger.info("Seeding %d %s into table %s", len(rows), label, table)
            for row in rows:
                cur.execute(insert_sql, to_params(row))
            return len(rows)
        return 0
