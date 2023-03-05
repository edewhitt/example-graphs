module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['node', 'react', 'prettier'],
    extends: ['eslint:recommended', 'plugin:prettier/recommended', "plugin:react/recommended",],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
        tsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      requireConfigFile: false,
    },
    env: {
      browser: true,
      es6: true,
      jasmine: true,
      mocha: true,
      node: true,
      protractor: true,
      es2021: true,
    },
    globals: {
      dv: true,
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx'],
        parser: '@typescript-eslint/parser',
        plugins: ['node', 'prettier', '@typescript-eslint'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/eslint-recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:prettier/recommended',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {
              ignoreRestSiblings: true,
              argsIgnorePattern: '^_',
              caughtErrorsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
            },
          ],
        },
      },
    ],
  };
