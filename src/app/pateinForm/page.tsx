import { HydrateClient } from "@/lib/trpc/server";
import ClientPage from "./client-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ permission?: string }>;
}) {
  const sp = await searchParams;
  const permission = sp.permission ?? "";

  return (
    <HydrateClient>
      <ClientPage permission={permission} />
    </HydrateClient>
  );
}
