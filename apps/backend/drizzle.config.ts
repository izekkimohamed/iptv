import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:password@localhost:5432/my-better-t-app",
  },
});
