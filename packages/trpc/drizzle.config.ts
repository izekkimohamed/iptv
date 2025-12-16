import { defineConfig } from "drizzle-kit";
//add dotenv conf
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
