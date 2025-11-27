import { api, HydrateClient } from "@/lib/trpc/server";

import ClientPage from "./client-page";

export default async function Page() {
  void api.patienForm.list.prefetch();

  return (
    <HydrateClient>
      <ClientPage />
    </HydrateClient>
  );
}
