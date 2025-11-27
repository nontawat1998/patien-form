import assert from "node:assert";

import { patienForm } from "@/server/db/schema";

import { db } from "@/server/db";
import { env } from "@/env";

import _data from "./data.json";
import {count} from "drizzle-orm";

type DataItem = {
  id: number;
  first_name: string,
    last_name: string,
    middle_name: string,
    date_of_birth: string,
    gender: string,
    nationality: string,
    preferred_language: string,
    religion: string,
    address: string,
    email: string,
    phone_number: string,
    emergency_name: string,
    emergency_relationship: string,
};
const data = _data as DataItem[];

export async function seedData() {
  // assert.equal(env.NODE_ENV, "development");

  // await db.transaction(async (tx) => {
  //   const [result] = await tx
  //     .select({ count: count(patienForm.id) })
  //     .from(patienForm);

  //   assert(result, "Query did not return document count");
  //   if (result.count > 0) return;

  //   console.debug('Seeding patienForm table');

  //   await tx
  //     .insert(patienForm)
  //     .values(data.map(({ id: _, ...data }) => ({ ...data })));
  // });
}

