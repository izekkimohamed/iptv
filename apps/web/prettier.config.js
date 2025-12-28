/** @type {import('prettier').Config} */
const prettierConfig = {
  // Use a consistent print width
  printWidth: 100,
  // Use tabs instead of spaces
  useTabs: false,
  // Indent with 2 spaces
  tabWidth: 2,
  // Use semicolons at the end of statements
  semi: true,
  // Use single quotes instead of double quotes
  singleQuote: true,
  // Print trailing commas wherever possible (e.g. for multi-line ES5 objects)
  trailingComma: 'all',
  // Print spaces between brackets in object literals
  bracketSpacing: true,
  // Put the > of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line
  bracketSameLine: false,
  // Arrow function parentheses eg. always: (x) => x, avoid: x => x
  arrowParens: 'always',
  // Specify the end of line sequence
  endOfLine: 'lf',
  // Enable Prettier to format embedded code if a parser is available
  embeddedLanguageFormatting: 'auto',
  plugins: ['prettier-plugin-tailwindcss'],
};

export default prettierConfig;
