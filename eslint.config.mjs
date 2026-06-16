import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Quiz questions render arbitrary remote images (unsplash, wikimedia,
      // flagcdn, placehold…). Plain <img> is intentional over next/image here.
      "@next/next/no-img-element": "off",
      // French UI copy is full of apostrophes (l'image, d'échecs…). Escaping
      // them in JSX hurts readability for no real benefit.
      "react/no-unescaped-entities": "off",
      // Ported quiz components reset their internal state in an effect keyed on
      // question.id. It's a deliberate, working pattern — keep it a hint, not a
      // build-breaking error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // v1 reference code, ported incrementally — not part of the build.
    "legacy/**",
  ]),
]);

export default eslintConfig;
