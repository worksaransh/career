/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@next/next/recommended",
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "jsx-a11y",
    "import",
    "unicorn",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { alwaysTryTypes: true },
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/jsx-no-target-blank": "error",
    "react/no-array-index-key": "warn",
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-ts-comment": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/anchor-is-valid": "error",
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
    "unicorn/filename-case": [
      "warn",
      {
        cases: { kebabCase: true },
        ignore: ["^\\[.*\\]$"],
      },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
  },
  overrides: [
    {
      files: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
      rules: {
        "no-console": "off",
        "import/no-extraneous-dependencies": "off",
      },
    },
  ],
};
