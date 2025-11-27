import { z } from "zod";

export type ListPatienFormInput = z.infer<typeof ListPatienFormInput>;
export const ListPatienFormInput = z.object({
  createdAt: z
    .object({
      before: z.date({ coerce: true }).nullable(),
      after: z.date({ coerce: true }).nullable(),
    })
    .optional(),
  archived: z
    .object({
      before: z.date({ coerce: true }).nullable(),
      after: z.date({ coerce: true }).nullable(),
    })
    .optional(),

  sort: z.enum(["createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),

  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(10).max(50).optional(),
});

export type CreatePatienFormInput = z.infer<typeof CreatePatienFormInput>;
export const CreatePatienFormInput = z.object({
  first_name: z.string().min(1, "Please insert require field."),
  last_name: z.string().min(1, "Please insert require field."),
  middle_name: z.string(),
  date_of_birth: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Date of birth is required",
  }),
  gender: z.string().min(1, "Please insert require field."),
  nationality: z.string().min(1, "Please insert require field."),
  preferred_language: z.string().min(1, "Please insert require field."),
  religion: z.string(),
  address: z.string().min(1, "Please insert require field."),
  email: z.string().min(1, "Please insert require field."),
  phone_number: z.string().min(9, "Please insert require field."),
  emergency_name: z.string().min(1, "Please insert require field."),
  emergency_relationship: z.string().min(1, "Please insert require field."),
});

export type ArchivePatienFormInput = z.infer<typeof ArchivePatienFormInput>;
export const ArchivePatienFormInput = z.object({
  id: z.string().min(1, "Please insert require field."),
});
