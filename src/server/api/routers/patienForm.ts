import assert from "node:assert";
import { TRPCError } from "@trpc/server";
import {
  type SQL,
  and,
  isNull,
  isNotNull,
  lte,
  gte,
  desc,
  asc,
  eq,
} from "drizzle-orm";

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
  list: publicProcedure
    .input(ListPatienFormInput.optional().default({}))
    .query(listPatienForm),

  create: publicProcedure.input(CreatePatienFormInput).mutation(createPatienForm),

  archive: publicProcedure
    .input(ArchivePatienFormInput)
    .mutation(archivePatienForm),
  unarchive: publicProcedure
    .input(ArchivePatienFormInput)
    .mutation(unarchivePatienForm),
});

const PatienFormFields = {
  id: patienForm.id,
  createdAt: patienForm.createdAt,
  updatedAt: patienForm.updatedAt,
  archivedAt: patienForm.archivedAt,
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

function listPatienForm({ input }: { input: ListPatienFormInput }) {
  let archivedFilter: undefined | SQL<unknown> = input.archived
    ? isNotNull(patienForm.archivedAt)
    : isNull(patienForm.archivedAt);

  if (input.archived && (input.archived.before || input.archived.after)) {
    archivedFilter = and(
      archivedFilter,
      input.archived.before
        ? lte(patienForm.archivedAt, input.archived.before)
        : undefined,
      input.archived.after
        ? gte(patienForm.archivedAt, input.archived.after)
        : undefined,
    );
  }

  const orders = {
    asc,
    desc,
    createdAt: desc,
    archivedAt: desc,
  };

  const order =
    input.order && input.order in orders
      ? orders[input.order]
      : input.sort && input.sort in orders
        ? orders[input.sort]
        : asc;

  return db
    .select(PatienFormFields)
    .from(patienForm)
    .where(and(isNull(patienForm.deletedAt), archivedFilter))
    .offset(input.offset ?? 0)
    .limit(input.limit ?? 10)
    .orderBy(order(patienForm[input.sort ?? "createdAt"]));
}

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

function archivePatienForm({ input }: { input: ArchivePatienFormInput }) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .update(patienForm)
      .set({ archivedAt: new Date() })
      .where(
        and(
          eq(patienForm.id, input.id),
          isNull(patienForm.archivedAt),
          isNull(patienForm.deletedAt),
        ),
      )
      .returning({
        id: patienForm.id,
        archivedAt: patienForm.archivedAt,
      });

    assert(
      result,
      new TRPCError({
        code: "NOT_FOUND",
        message: "PatienForm Not Found",
      }),
    );

    assert(
      result.archivedAt,
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error Archiving PatienForm",
      }),
    );

    return result;
  });
}

function unarchivePatienForm({ input }: { input: ArchivePatienFormInput }) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .update(patienForm)
      .set({ archivedAt: null })
      .where(
        and(
          eq(patienForm.id, input.id),
          isNull(patienForm.deletedAt),
          isNotNull(patienForm.archivedAt),
        ),
      )
      .returning({
        id: patienForm.id,
        archivedAt: patienForm.archivedAt,
      });

    assert(
      result,
      new TRPCError({
        code: "NOT_FOUND",
        message: "PatienForm Not Found",
      }),
    );

    assert(
      result.archivedAt === null,
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error Archiving PatienForm",
      }),
    );

    return result;
  });
}
