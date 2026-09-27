import { createClient, type Client } from "@libsql/client";

let db: Client | undefined;

export async function getDb(): Promise<Client> {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL সেট করা নেই (.env.example দেখুন)");
    }

    const client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    });
    // SQLite-এ foreign key প্রতিটা কানেকশনে আলাদাভাবে চালু করতে হয়
    await client.execute("PRAGMA foreign_keys = ON");
    db = client;
  }
  return db;
}
