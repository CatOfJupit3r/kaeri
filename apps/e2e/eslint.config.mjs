import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import { configs, plugins, rules } from "eslint-config-airbnb-extended";
import { rules as prettierConfigRules } from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import prettierPlugin from "eslint-plugin-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const gitignorePath = path.resolve(".", ".gitignore");
const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);
const tsconfigRootDir = path.resolve(currentDirname);

const jsConfig = [
  // ESLint Recommended Rules
  {
    name: "js/config",
    ...js.configs.recommended,
  },
  // Stylistic Plugin
  plugins.stylistic,
  // Import X Plugin
  plugins.importX,
  // Airbnb Base Recommended Config
  ...configs.base.recommended,
  // Strict Import Config
  rules.base.importsStrict,
];

const nodeConfig = [
  // Node Plugin
  plugins.node,
  // Airbnb Node Recommended Config
  ...configs.node.recommended,
];

const typescriptConfig = [
  // TypeScript ESLint Plugin
  plugins.typescriptEslint,
  // Airbnb Base TypeScript Config
  ...configs.base.typescript,
  // Strict TypeScript Config
  rules.typescript.typescriptEslintStrict,
];

const prettierConfig = [
  // Prettier Plugin
  {
    name: "prettier/plugin/config",
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier Config
  {
    name: "prettier/config",
    rules: {
      ...prettierConfigRules,
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
];

const silenceOpinions = [
  {
    rules: {
      "import-x/prefer-default-export": "off",
      "no-console": "off",
      "import-x/no-unresolved": [
        "error",
        {
          ignore: ["^@e2e/"],
        },
      ],
      // Allow devDependencies in test files
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
        },
      ],
      "import-x/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@e2e/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // E2E tests often need to access private members for testing
      "@typescript-eslint/dot-notation": "off",
      // Playwright tests use describe/test patterns
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "import-x/no-named-as-default": "off",
      "class-methods-use-this": "off",
      "@typescript-eslint/only-throw-error": "off",
      "import-x/no-anonymous-default-export": "off",
      "@typescript-eslint/array-type": "off",
      "no-underscore-dangle": "off",
      // Allow type definitions (common in test fixtures)
      "@typescript-eslint/consistent-type-definitions": "off",
      // Allow inline type imports for Playwright patterns
      "import-x/consistent-type-specifier-style": "off",
      "@typescript-eslint/no-import-type-side-effects": "off",
      // Allow useless constructors (needed for Page Object pattern)
      "@typescript-eslint/no-useless-constructor": "off",
      // Allow await in loops for retry logic
      "no-await-in-loop": "off",
      // Allow for...of loops
      "no-restricted-syntax": "off",
      // Allow ++ in loops
      "no-plusplus": "off",
      // Allow unsafe returns in API helper (responses are typed by Playwright)
      "@typescript-eslint/no-unsafe-return": "off",
      // Allow blank lines between class members to be flexible
      "@stylistic/lines-between-class-members": "off",
      // Allow modern Node.js builtins like Response (available from Node 18+)
      "n/no-unsupported-features/node-builtins": [
        "error",
        {
          ignores: ["Response", "Request"],
        },
      ],
    },
  },
];

export default [
  {
    ignores: [
      "eslint.config.mjs",
      "test-results/**",
      "playwright-report/**",
      "playwright/.cache/**",
    ],
  },
  includeIgnoreFile(gitignorePath),
  ...jsConfig,
  ...nodeConfig,
  ...typescriptConfig,
  {
    name: "typescript/parser-options",
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    name: "typescript/import-resolver",
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
  },
  ...prettierConfig,
  ...silenceOpinions,
];
