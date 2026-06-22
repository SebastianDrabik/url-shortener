import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const linksTable = sqliteTable('links', {
  shortUrl: text('short_url').notNull().primaryKey(),
  longUrl: text('long_url').notNull(),
  expiresAt: integer('expires_at', {mode: 'timestamp'}).default(sql`null`),
  active: integer('is_active', {mode: 'boolean'}).default(sql`1`),
  ownerCode: text('owner_code').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(unixepoch())`,
  ),
})