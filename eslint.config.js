import { defineConfig } from 'eslint-define-config';
import js from '@eslint/js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks';
import tsEslint from 'typescript-eslint';

export default defineConfig([
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    reactRecommended,
    reactJsxRuntime,
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'react/jsx-no-undef': 'error',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
  {
      files: ['**/*.tsx', '**/*.ts'],
    languageOptions: {
        parser: tsEslint.parser,
        parserOptions: {
            project: './tsconfig.json',
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        'no-console': 'warn',
      },
  },
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'build/**'],
    },
]);
