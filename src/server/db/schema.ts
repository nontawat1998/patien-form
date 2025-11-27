import { index, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export const patienForm = sqliteTable("patienForm", (d) => ({
  id: d
    .text()
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),

  first_name: d.text().notNull(),
  last_name: d.text().notNull(),
  middle_name: d.text(),
  date_of_birth: d.text().notNull(),
  gender: d.text().notNull(),
  nationality: d.text().notNull(),
  preferred_language: d.text().notNull(),
  religion:d.text(),
  address: d.text().notNull(),
  email: d.text().notNull(),
  phone_number: d.text().notNull(),
  emergency_name: d.text().notNull(),
  emergency_relationship: d.text().notNull(),
  archivedAt: d.integer({ mode: "timestamp" }),

  createdAt: d
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: d
    .integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  deletedAt: d.integer({ mode: "timestamp" }),
}));
