import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier'; // Import the plugin
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'out/**',
    "src-tauri/**"
  ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  ...compat.extends('prettier'),
];


export default eslintConfig;
