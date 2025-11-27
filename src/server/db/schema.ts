import { pgTable, text, integer,uuid, timestamp } from "drizzle-orm/pg-core";



export const patienForm = pgTable("patient_form", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),   
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  middle_name: text("middle_name"),

  date_of_birth: text("date_of_birth").notNull(),

  gender: text("gender").notNull(),
  nationality: text("nationality").notNull(),
  preferred_language: text("preferred_language").notNull(),
  religion: text("religion"),

  address: text("address").notNull(),
  email: text("email").notNull(),
  phone_number: text("phone_number").notNull(),

  emergency_name: text("emergency_name").notNull(),
  emergency_relationship: text("emergency_relationship").notNull(),

  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
