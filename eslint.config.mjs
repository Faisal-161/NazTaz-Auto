import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Architecture rule: only the mock adapter (and tests) may read fixtures; nothing outside
  // lib/commerce may call fetch directly.
  {
    files: ['app/**', 'components/**', 'lib/**'],
    ignores: ['lib/commerce/**', 'lib/services/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/data/*', '**/data/*.json'],
              message:
                'Read data through lib/commerce (getCommerce / queries), never fixtures directly.',
            },
            {
              group: [
                '@/lib/commerce/mock',
                '@/lib/commerce/mock/*',
                '@/lib/commerce/shopify',
                '@/lib/commerce/shopify/*',
              ],
              message: 'Import from @/lib/commerce, not a specific adapter.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Fetch only inside lib/commerce or lib/services (server-only modules).',
        },
      ],
    },
  },
  {
    files: ['tests/**'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    '.artifacts/**',
  ]),
])

export default eslintConfig
