import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier"; // Import the plugin

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Configuration for eslint-plugin-prettier
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"], // Apply to common code files
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error", // Report Prettier errors as ESLint errors
    },
  },
  // eslint-config-prettier: disables ESLint rules that would conflict with Prettier
  // This must be the last configuration in the extends array.
  ...compat.extends("prettier"),
];

export default eslintConfig;
