import assert from "node:assert";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { patienForm } from "@/server/db/schema";
import { db } from "@/server/db";
import { env } from "@/env";

import {
  ListPatienFormInput,
  CreatePatienFormInput,
  ArchivePatienFormInput,
} from "./patienForm.input";
import { seedData } from "./_dev/seed-data";

if (env.NODE_ENV === "development") await seedData();

export const patienFormRouter = createTRPCRouter({

  create: publicProcedure
    .input(CreatePatienFormInput)
    .mutation(createPatienForm),

});

const PatienFormFields = {
  id: patienForm.id,
  first_name: patienForm.first_name,
  last_name: patienForm.last_name,
  middle_name: patienForm.middle_name,
  date_of_birth: patienForm.date_of_birth,
  gender: patienForm.gender,
  nationality: patienForm.nationality,
  preferred_language: patienForm.preferred_language,
  religion: patienForm.religion,
  address: patienForm.address,
  email: patienForm.email,
  phone_number: patienForm.phone_number,
  emergency_name: patienForm.emergency_name,
  emergency_relationship: patienForm.emergency_relationship,
};

function createPatienForm({ input }: { input: CreatePatienFormInput }) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .insert(patienForm)
      .values({
        ...input,
        date_of_birth: input.date_of_birth?.toISOString(),
      })
      .returning(PatienFormFields);

    assert(result, "Query did not return document");
    return result;
  });
}

