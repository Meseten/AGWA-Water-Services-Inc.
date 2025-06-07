// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  // Global configuration for all files
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { 
      globals: globals.browser, // Use browser global variables
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    settings: {
      react: {
        version: "detect" // Automatically detect the React version
      }
    }
  },
  
  // ESLint's recommended rules
  pluginJs.configs.recommended,
  
  // React-specific recommended rules
  pluginReactConfig,

  // Custom rule overrides
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with Vite/modern React
      "react/prop-types": "off", // Turn off prop-types validation
      "no-unused-vars": ["warn", { "args": "none" }] // Warn on unused variables
    }
  }
];
