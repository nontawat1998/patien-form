// import { createClient, type Client } from "@libsql/client";
// import { drizzle } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";

import { env } from "@/env";

import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// const globalForDb = globalThis as unknown as {
//   client: Client | undefined;
// };

// export const client =
//   globalForDb.client ?? createClient({ url: env.DATABASE_URL });
// if (env.NODE_ENV !== "production") globalForDb.client = client;
const sql = postgres(env.DATABASE_URL!); 
export const db = drizzle(sql);
// export const db = drizzle(client, { schema });
