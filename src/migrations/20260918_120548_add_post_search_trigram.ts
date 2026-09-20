import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from '@payloadcms/db-postgres'

export async function up({
  db,
}: MigrateUpArgs): Promise<void> {
  // Enable PostgreSQL trigram similarity search.
  await db.execute(
    sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`,
  )

  // Fast fuzzy matching for post titles.
  await db.execute(
    sql`
      CREATE INDEX IF NOT EXISTS posts_title_trgm_idx
      ON "posts"
      USING GIN ("title" gin_trgm_ops)
    `,
  )

  // Fast fuzzy matching for product/tool names
  // that commonly appear in slugs.
  await db.execute(
    sql`
      CREATE INDEX IF NOT EXISTS posts_slug_trgm_idx
      ON "posts"
      USING GIN ("slug" gin_trgm_ops)
    `,
  )
}

export async function down({
  db,
}: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql`
      DROP INDEX IF EXISTS posts_title_trgm_idx
    `,
  )

  await db.execute(
    sql`
      DROP INDEX IF EXISTS posts_slug_trgm_idx
    `,
  )

  // Intentionally keep pg_trgm installed.
  // Other search features may use it later.
}