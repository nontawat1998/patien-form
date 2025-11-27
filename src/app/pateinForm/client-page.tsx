"use client";
import { IconCalendarWeek } from "@tabler/icons-react";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CreatePatienFormInput } from "@/server/api/routers/patienForm.input";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
type DraftField = {
  user_id: number;
  field: string;
  value: string;
};

export default function ClientPage() {
  return (
    <div className="flex flex-col gap-4">
      <CardTop />
      <CardForm />
    </div>
  );
}

function CardTop() {
  const [now, setNow] = useState("");

  useEffect(() => {
    setNow(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }, []);

  return (
    <Card className="border border-[#ffffff] bg-[#ffffff] py-2 shadow-sm">
      <div className="grid grid-cols-2 gap-4 px-4 lg:px-6">
        <div className="content-evenly">
          <Avatar className="size-[70px] rounded-[0]">
            <AvatarImage src="/avatars/logo 2.svg" />
          </Avatar>
        </div>
        <div className="content-evenly text-end">
          <strong className="text-[18px] text-[#1A59C2]">Patient Form</strong>
          <br />
          <small className="text-[#1A59C2]">{now}</small>
        </div>
      </div>
    </Card>
  );
}

function CardForm() {
  const formId = React.useId();
  const [formToSupabase, setFormToSupabase] = useState<Record<string, any>>({});
  const searchParams = useSearchParams();
  const permission = searchParams.get("permission");
  const form = useForm({
    resolver: zodResolver(CreatePatienFormInput),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      date_of_birth: undefined,
      gender: "",
      nationality: "",
      preferred_language: "",
      religion: "",
      address: "",
      email: "",
      phone_number: "",
      emergency_name: "",
      emergency_relationship: "",
    },
  });

  const utils = api.useUtils();
  const create = api.patienForm.create.useMutation({
    async onSuccess() {
      await utils.patienForm.list.invalidate();
    },
  });
  const [lastUserId, setLastUserId] = useState<number>(0);

  useEffect(() => {
    const fetchLastUserId = async () => {
    const { data, error } = await supabase
      .from("patienForm_draft")
      .select("*")
      .order("user_id", { ascending: false })
      .limit(1);
    if (error) return console.error(error);
    if (data && data.length > 0) setLastUserId(data[0].user_id);
  };
  fetchLastUserId();
    const channel = supabase
      .channel("public:patienForm_draft")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patienForm_draft" },
        (payload: any) => {
          const newDraft: DraftField = payload.new;
          setFormToSupabase((prev: Record<string, any>) => ({
            ...prev,
            [newDraft.field]: newDraft.value,
          }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleChange = async (name: string, value: any) => {
    setFormToSupabase((prev) => ({ ...prev, [name]: value }));
    await supabase
      .from("patienForm_draft")
      .upsert([{ user_id: lastUserId + 1, field: name, value }], {
        onConflict: "user_id,field",
      });
  };
  const handleCreate = (data: CreatePatienFormInput) =>
    toast.promise(
      (async () => {
        const { error } = await supabase.from("patienForm").insert(data);
        if (error) throw error;
        await utils.patienForm.list.invalidate();
        return data;
      })(),
      {
        loading: "Creating patient form...",
        success: "Patient form created",
        error: "Error creating patient form",
      },
    );
  return (
    <div className="@container/main flex flex-1 flex-col gap-0">
      <div className="flex flex-col gap-4 pt-4 pb-32 md:gap-6 md:py-2">
        <Card className="border border-[#ffffff] bg-[#ffffff] py-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 px-4 lg:px-4 @xl/main:grid-cols-[8fr_16fr] @5xl/main:grid-cols-[8fr_16fr]">
            <Card className="items-center rounded-lg border border-[#C0ECFF] bg-[#C0ECFF] py-2 shadow-sm">
              <Avatar className="size-[120px] max-w-[120px] rounded-[0]">
                <AvatarImage src="/avatars/nurse.svg" />
              </Avatar>
              <div className="px-2 text-center">
                <strong className="text-[18px] text-[#1A59C2]">
                  Ms. Somsri Saiyai
                </strong>
                <br />
                <span className="text-[#1A59C2]">
                  Registered Nurse, Senior Professional Level
                </span>
                <br />
                <span className="text-[#1A59C2]">Internal Medicine (MED)</span>
              </div>
            </Card>
            <div className="">
              {permission !== "admin" ? (
                <form
                  id={formId}
                  onSubmit={form.handleSubmit(handleCreate)}
                  className="flex flex-col gap-2 px-2 lg:px-2"
                >
                  <strong className="text-[#1A59C2] text-[18]">
                    Personal Informations
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="first_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                First Name
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="First Name"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="middle_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Middle Name (Optional)
                              </small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Middle Name (Optional)"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="last_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Last Name
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Last Name"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="date_of_birth"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Date of Birth
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Popover>
                              <PopoverTrigger
                                asChild
                                aria-invalid={fieldState.invalid}
                              >
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <IconCalendarWeek className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    handleChange(field.name, date);
                                  }}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  captionLayout="dropdown"
                                />
                              </PopoverContent>
                            </Popover>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="gender"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">Gender</small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleChange(field.name, value);
                              }}
                              defaultValue={field.value}
                            >
                              <SelectTrigger aria-invalid={fieldState.invalid}>
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Gender</SelectLabel>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="nationality"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Nationality
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Nationality"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="preferred_language"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Preferred Language
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Preferred Language"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="religion"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Religion (Optional)
                              </small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Religion (Optional)"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </div>
                  <strong className="text-[#1A59C2] text-[18]">
                    Contact Informations
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="address"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">Address</small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Address"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">Email</small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="email"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="email"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="phone_number"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Phone Number
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="number"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Phone Number"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </div>
                  <strong className="text-[#1A59C2] text-[18]">
                    Emergency Contact
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="emergency_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">Name</small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Name"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Controller
                        name="emergency_relationship"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-demo-title">
                              <small className="text-[#1A59C2]">
                                Relationship
                              </small>
                              <small className="text-[#FC1C1C]">*</small>
                            </FieldLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(field.name, e.target.value);
                              }}
                              type="text"
                              id="form-rhf-demo-title"
                              aria-invalid={fieldState.invalid}
                              placeholder="Relationship"
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      className="min-w-[80px] border-[#1A59C2] text-[#1A59C2]"
                      variant={"outline"}
                      disabled={create.isPending || create.isSuccess}
                      asChild
                    >
                      <Link href="/dashboard/patienForms">Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      className="min-w-[80px] border-[#1A59C2] bg-[#1A59C2] text-[#ffffff]"
                      disabled={create.isPending || create.isSuccess}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2 px-2 lg:px-2">
                  <strong className="text-[#1A59C2] text-[18]">
                    Personal Informations
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">First Name</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.first_name || ""}
                          readOnly
                          placeholder="First Name"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">
                            Middle Name (Optional)
                          </small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.middle_name || ""}
                          readOnly
                          placeholder="Middle Name (Optional)"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Last Name</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.last_name || ""}
                          readOnly
                          placeholder="Last Name"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">
                            Date of Birth
                          </small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>

                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !formToSupabase.date_of_birth &&
                              "text-muted-foreground",
                          )}
                        >
                          {formToSupabase.date_of_birth ? (
                            format(formToSupabase.date_of_birth, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <IconCalendarWeek className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Gender</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Select value={formToSupabase.gender || ""} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Gender</SelectLabel>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Nationality</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.nationality || ""}
                          readOnly
                          placeholder="Nationality"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">
                            Preferred Language
                          </small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.preferred_language || ""}
                          readOnly
                          placeholder="Preferred Language"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">
                            Religion (Optional)
                          </small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.religion || ""}
                          readOnly
                          placeholder="Religion (Optional)"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                  <strong className="text-[#1A59C2] text-[18]">
                    Contact Informations
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Address</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.address || ""}
                          readOnly
                          placeholder="Address"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Email</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.email || ""}
                          readOnly
                          placeholder="Email"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Phone Number</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.phone_number || ""}
                          readOnly
                          placeholder="Phone Number"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                  <strong className="text-[#1A59C2] text-[18]">
                    Emergency Contact
                  </strong>
                  <div className="grid grid-cols-1 gap-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Name</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.emergency_name || ""}
                          readOnly
                          placeholder="Name"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col">
                      <Field>
                        <FieldLabel htmlFor="form-rhf-demo-title">
                          <small className="text-[#1A59C2]">Relationship</small>
                          <small className="text-[#FC1C1C]">*</small>
                        </FieldLabel>
                        <Input
                          value={formToSupabase.emergency_relationship || ""}
                          readOnly
                          placeholder="Relationship"
                          autoComplete="off"
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      className="min-w-[80px] border-[#1A59C2] bg-[#ffffff] text-[#1A59C2]"
                      disabled
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="min-w-[80px] border-[#1A59C2] bg-[#1A59C2] text-[#ffffff]"
                      disabled
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
