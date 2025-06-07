module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2020, // Use a modern ECMAScript version
  },
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": "off", // Optional: Turn off the requirement for JSDoc comments
    "max-len": ["error", { "code": 120 }], // Optional: Increase max line length
  },
};
