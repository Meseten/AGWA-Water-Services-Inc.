// This is the new, modern flat config format for ESLint.
// It should be named eslint.config.js inside your 'functions' directory.

const js = require("@eslint/js");
const globals = require("globals");
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");
const { fileURLToPath } = require("url");

// Recreate the `__dirname` constant, which is not available in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});


module.exports = [
  // Start with the recommended ESLint configuration.
  js.configs.recommended,

  // Use the legacy `eslint-config-google` by wrapping it with FlatCompat.
  ...compat.extends("google"),

  // Apply rules to all JavaScript files.
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020, // Use a modern ECMAScript version.
      sourceType: "commonjs", // Specify module type for Node.js environment.
      globals: {
        ...globals.node, // Import all standard Node.js globals.
      },
    },
    rules: {
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "object-curly-spacing": ["error", "always"],
      "require-jsdoc": "off", // Optional: Turns off the requirement for JSDoc comments.
      "max-len": ["error", { "code": 120 }], // Optional: Increases max line length.
      "camelcase": "off", // Optional: Common to turn off for things like database field names.
    },
  },
];
