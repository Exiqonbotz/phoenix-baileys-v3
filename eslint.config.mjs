import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
	globalIgnores([
		'src/Tests/*',
		'**/lib',
		'**/coverage',
		'**/*.lock',
		'**/.eslintrc.json',
		'src/WABinary/index.ts',
		'**/WAProto',
		'Example/Example.ts',
		'**/docs',
		'**/proto-extract'
	]),

	{
		files: ['src/**/*.{ts,js}'],

		plugins: {
			'@typescript-eslint': typescriptEslint
		},

		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				project: './tsconfig.json'
			}
		},

		rules: {
			'no-unused-vars': 'off',

			'@typescript-eslint/no-floating-promises': 'error',

			'@typescript-eslint/no-explicit-any': [
				'warn',
				{
					ignoreRestArgs: true
				}
			],

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					caughtErrors: 'none'
				}
			],

			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/no-redundant-type-constituents': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn'
		}
	}
])
