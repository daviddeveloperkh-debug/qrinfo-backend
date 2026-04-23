import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // 1. Sxema (jadvallar) manzili
  schema: ["./src/db/schema.js", "./src/db/*.schema.js"],

  // 2. Migratsiya fayllari (SQL) tushadigan papka
  out: "./drizzle",

  // 3. Ma'lumotlar bazasi turi
  dialect: "postgresql",

  // 4. Baza bilan ulanish siri (ConnectionString)
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
