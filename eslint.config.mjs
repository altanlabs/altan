import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticJsx from '@stylistic/eslint-plugin-jsx';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  reactPlugin.configs.flat.recommended, // React recommended config
  reactPlugin.configs.flat['jsx-runtime'], // React 17+ jsx-runtime config
  {
    files: ['src/**/*.{js,jsx}'], // Target JS and JSX files
    plugins: {
      '@stylistic/js': stylisticJs,
      '@stylistic/jsx': stylisticJsx,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // project: './tsconfig.json', // Required for TypeScript linting with project references
      },
      parser: tsParser, // Use TypeScript parser
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      // ...importPlugin.configs.typescript.rules,
      ...reactPlugin.configs.flat.recommended.rules, // React rules
      ...reactPlugin.configs.flat['jsx-runtime'].rules, // React jsx-runtime rules
      // ...tsPlugin.configs.recommended.rules, // Add recommended TypeScript rules
      // ...tsPlugin.configs['recommended-requiring-type-checking'].rules, // Add rules requiring type checking
      ...reactHooksPlugin.configs.recommended.rules,
      'react/jsx-uses-react': 'error',
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
      /**
       * ------------------------------------------------------------------------
       * STYLISTIC RULES
       * (Your previously provided config + some extras)
       * ------------------------------------------------------------------------
       */
      '@stylistic/js/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          offsetTernaryExpressions: true,
          ignoredNodes: [
            // Redux Toolkit or arrow function bodies
            'ArrowFunctionExpression > :matches(BlockStatement, ArrowFunctionExpression, AwaitExpression)',
            'ArrowFunctionExpression ArrowFunctionExpression',
          ],
        },
      ],
      '@stylistic/js/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/js/semi': ['error', 'always'],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/array-bracket-spacing': ['error', 'never'],
      '@stylistic/js/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/js/eol-last': ['error', 'always'],
      '@stylistic/js/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/js/space-before-function-paren': [
        'error',
        { anonymous: 'never', named: 'never', asyncArrow: 'always' },
      ],
      '@stylistic/js/space-in-parens': ['error', 'never'],
      '@stylistic/js/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/js/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/js/func-call-spacing': ['error', 'never'],
      '@stylistic/js/no-trailing-spaces': ['error'],
      '@stylistic/js/quote-props': [
        'error',
        'as-needed',
        {
          keywords: false,
          unnecessary: true,
          numbers: true,
        },
      ],
      '@stylistic/js/semi-spacing': ['error', { before: false, after: true }],
      '@stylistic/js/space-before-blocks': ['error', 'always'],
      '@stylistic/js/space-infix-ops': ['error', { int32Hint: false }],
      '@stylistic/js/space-unary-ops': ['error', { words: true, nonwords: false }],

      // Additional nice-to-have style rules
      '@stylistic/js/block-spacing': ['error', 'always'],
      '@stylistic/js/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/js/dot-location': ['error', 'property'],
      '@stylistic/js/new-parens': 'error',
      '@stylistic/js/no-whitespace-before-property': 'error',
      '@stylistic/js/padded-blocks': [
        'error',
        { blocks: 'never', classes: 'never', switches: 'never' },
      ],
      '@stylistic/js/spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],

      /**
       * ------------------------------------------------------------------------
       * JSX-SPECIFIC RULES
       * ------------------------------------------------------------------------
       */
      '@stylistic/jsx/jsx-child-element-spacing': ['error'],
      '@stylistic/jsx/jsx-closing-bracket-location': ['error', 'line-aligned'],
      '@stylistic/jsx/jsx-closing-tag-location': ['error'],
      '@stylistic/jsx/jsx-curly-newline': ['error', 'consistent'],
      '@stylistic/jsx/jsx-curly-spacing': ['error', { when: 'never' }],
      '@stylistic/jsx/jsx-equals-spacing': ['error', 'never'],
      '@stylistic/jsx/jsx-first-prop-new-line': ['error', 'multiline'],
      '@stylistic/jsx/jsx-indent-props': ['error', 2],
      '@stylistic/jsx/jsx-props-no-multi-spaces': 'error',
      '@stylistic/jsx/jsx-tag-spacing': [
        'error',
        {
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          closingSlash: 'never',
        },
      ],
      '@stylistic/jsx/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
      '@stylistic/jsx/jsx-wrap-multilines': ['error', { declaration: true, assignment: true }],

      // Use double quotes in JSX attributes (recommended in some style guides)
      '@stylistic/js/jsx-quotes': ['error', 'prefer-double'],

      /**
       * ------------------------------------------------------------------------
       * DISABLE RULES HANDLED BY PRETTIER
       * ------------------------------------------------------------------------
       */
      '@stylistic/js/max-len': 'off',
      '@stylistic/jsx/max-len': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'], // Target TS and TSX files
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // TypeScript linting with project references
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // Replaced by unused-imports/no-unused-vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-empty-interface': 'warn',
    },
  },
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        'eslint-import-resolver-custom-alias': {
          alias: {
            '@agents-sdk': 'agents-sdk/src/index.ts',
            '@components': 'src/components',
            '@assets': 'src/assets/',
            '@pages': 'src/pages/',
            '@layout': 'src/layout/',
            '@hooks': 'src/hooks/',
            '@utils': 'src/utils/',
            '@widgets': 'src/widgets/',
            '@modules': 'src/modules/',
            '@editor': 'src/editor/',
            '@redux': 'src/redux/',
            '@lib': 'src/lib/',
            lodash: 'lodash-es',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          packages: ['packages/*'],
        },
      },
    },
    rules: {
      /**
       * ------------------------------------------------------------------------
       * IMPORT RULES
       * (No external config like `eslint-config-airbnb`, we define them manually)
       * ------------------------------------------------------------------------
       */
      'import/no-unresolved': 'error', // Ensure an imported module can be resolved
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{js,jsx,ts,tsx}',
            '**/*.spec.{js,jsx,ts,tsx}',
            '**/test/**',
            '**/scripts/**',
            'eslint.config.mjs',
            'vite.config.mjs',
          ],
          optionalDependencies: false,
        },
      ],

      'import/no-duplicates': 'error',
      'import/no-absolute-path': 'error',
      'import/first': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      // 'import/extensions': [
      //   'error',
      //   'ignorePackages',
      //   {
      //     js: 'never',
      //     jsx: 'never',
      //     ts: 'never',
      //     tsx: 'never',
      //   },
      // ],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],

      /**
       * ------------------------------------------------------------------------
       * BEST PRACTICE & REDUX TOOLKIT FRIENDLY (No Param Reassign)
       * ------------------------------------------------------------------------
       */
      // This rule is from core ESLint, not from `@stylistic/js`.
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: [
            'state', // Redux Toolkit uses immer to allow state mutations
            'acc', // typical reduce accumulators
            'e', // e.g. for event param in React
            'ctx', // If you have context objects, Koa, etc.
          ],
        },
      ],

      // Example: other best-practice rules (same from earlier suggestion)
      'no-unused-vars': 'off', // Replaced by unused-imports/no-unused-vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn'],
      'no-debugger': 'error',
      'no-undef': 'error',
      'no-alert': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

// import stylisticJs from '@stylistic/eslint-plugin-js';
// import stylisticJsx from '@stylistic/eslint-plugin-jsx';
// import importPlugin from 'eslint-plugin-import';
// import reactPlugin from 'eslint-plugin-react';
// import reactHooksPlugin from 'eslint-plugin-react-hooks';
// import tsParser from '@typescript-eslint/parser';
// // import tsPlugin from '@typescript-eslint/eslint-plugin';
// import globals from 'globals';

// export default [
//   reactPlugin.configs.flat.recommended, // React recommended config
//   reactPlugin.configs.flat['jsx-runtime'], // Add for React 17+ jsx-runtime
//   {
//     files: ['src/**/*.{js,jsx,ts,tsx}'], // Target JS, JSX, TS, TSX files
//     plugins: {
//       '@stylistic/js': stylisticJs,
//       '@stylistic/jsx': stylisticJsx,
//       import: importPlugin,
//       react: reactPlugin,
//       'react-hooks': reactHooksPlugin,
//       // '@typescript-eslint': tsPlugin, // Add TypeScript plugin
//     },
//     settings: {
//       react: {
//         version: 'detect',
//       },
//       // 'import/parsers': {
//       //   '@typescript-eslint/parser': ['.ts', '.tsx'],
//       // },
//       // 'import/resolver': {
//       //   typescript: true,
//       //   node: true,
//       // },
//     },
//     languageOptions: {
//       ...reactPlugin.configs.flat.recommended.languageOptions,
//       globals: {
//         ...globals.serviceworker,
//         ...globals.browser,
//       },
//       parserOptions: {
//         ecmaVersion: 2021,
//         sourceType: 'module',
//         ecmaFeatures: {
//           jsx: true,
//         },
//         // project: './tsconfig.json', // Required for TypeScript linting with project references
//       },
//       parser: tsParser, // Use TypeScript parser
//     },
//     rules: {
//       // ...importPlugin.configs.recommended.rules,
//       // ...importPlugin.configs.typescript.rules,
//       ...reactPlugin.configs.flat.recommended.rules, // React rules
//       ...reactPlugin.configs.flat['jsx-runtime'].rules, // React jsx-runtime rules
//       // ...tsPlugin.configs.recommended.rules, // Add recommended TypeScript rules
//       // ...tsPlugin.configs['recommended-requiring-type-checking'].rules, // Add rules requiring type checking
//       ...reactHooksPlugin.configs.recommended.rules,
//       'react/jsx-uses-react': 'error',
//       'react/prop-types': 'off',
//       'react/jsx-uses-vars': 'error',
//       /**
//        * ------------------------------------------------------------------------
//        * IMPORT RULES
//        * (No external config like `eslint-config-airbnb`, we define them manually)
//        * ------------------------------------------------------------------------
//        */
//       'import/no-unresolved': 'error', // Ensure an imported module can be resolved
//       'import/no-extraneous-dependencies': [
//         'error',
//         {
//           devDependencies: [
//             '**/*.test.{js,jsx,ts,tsx}',
//             '**/*.spec.{js,jsx,ts,tsx}',
//             '**/test/**',
//             '**/scripts/**',
//           ],
//           optionalDependencies: false,
//         },
//       ],
//       'import/no-duplicates': 'error',
//       'import/no-absolute-path': 'error',
//       'import/first': 'error',
//       'import/newline-after-import': ['error', { count: 1 }],
//       // 'import/extensions': [
//       //   'error',
//       //   'ignorePackages',
//       //   {
//       //     js: 'never',
//       //     jsx: 'never',
//       //     ts: 'never',
//       //     tsx: 'never',
//       //   },
//       // ],
//       'import/order': [
//         'error',
//         {
//           groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
//           alphabetize: {
//             order: 'asc',
//             caseInsensitive: true,
//           },
//           'newlines-between': 'always',
//         },
//       ],

//       /**
//        * ------------------------------------------------------------------------
//        * BEST PRACTICE & REDUX TOOLKIT FRIENDLY (No Param Reassign)
//        * ------------------------------------------------------------------------
//        */
//       // This rule is from core ESLint, not from `@stylistic/js`.
//       'no-param-reassign': [
//         'error',
//         {
//           props: true,
//           ignorePropertyModificationsFor: [
//             'state', // Redux Toolkit uses immer to allow state mutations
//             'acc', // typical reduce accumulators
//             'e', // e.g. for event param in React
//             'ctx', // If you have context objects, Koa, etc.
//           ],
//         },
//       ],

//       // Example: other best-practice rules (same from earlier suggestion)
//       'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
//       'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
//       eqeqeq: ['error', 'always'],
//       'no-console': ['warn'],
//       'no-debugger': 'error',
//       'no-alert': 'warn',
//       'prefer-const': 'error',
//       'no-var': 'error',

//       /**
//        * ------------------------------------------------------------------------
//        * STYLISTIC RULES
//        * (Your previously provided config + some extras)
//        * ------------------------------------------------------------------------
//        */
//       '@stylistic/js/indent': [
//         'error',
//         2,
//         {
//           SwitchCase: 1,
//           offsetTernaryExpressions: true,
//           ignoredNodes: [
//             // Redux Toolkit or arrow function bodies
//             'ArrowFunctionExpression > :matches(BlockStatement, ArrowFunctionExpression, AwaitExpression)',
//             'ArrowFunctionExpression ArrowFunctionExpression',
//           ],
//         },
//       ],
//       '@stylistic/js/quotes': ['error', 'single', { avoidEscape: true }],
//       '@stylistic/js/semi': ['error', 'always'],
//       '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
//       '@stylistic/js/object-curly-spacing': ['error', 'always'],
//       '@stylistic/js/array-bracket-spacing': ['error', 'never'],
//       '@stylistic/js/arrow-spacing': ['error', { before: true, after: true }],
//       '@stylistic/js/eol-last': ['error', 'always'],
//       '@stylistic/js/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
//       '@stylistic/js/space-before-function-paren': [
//         'error',
//         { anonymous: 'never', named: 'never', asyncArrow: 'always' },
//       ],
//       '@stylistic/js/space-in-parens': ['error', 'never'],
//       '@stylistic/js/key-spacing': ['error', { beforeColon: false, afterColon: true }],
//       '@stylistic/js/comma-spacing': ['error', { before: false, after: true }],
//       '@stylistic/js/func-call-spacing': ['error', 'never'],
//       '@stylistic/js/no-trailing-spaces': ['error'],
//       '@stylistic/js/quote-props': [
//         'error',
//         'as-needed',
//         {
//           keywords: false,
//           unnecessary: true,
//           numbers: true,
//         },
//       ],
//       '@stylistic/js/semi-spacing': ['error', { before: false, after: true }],
//       '@stylistic/js/space-before-blocks': ['error', 'always'],
//       '@stylistic/js/space-infix-ops': ['error', { int32Hint: false }],
//       '@stylistic/js/space-unary-ops': ['error', { words: true, nonwords: false }],

//       // Additional nice-to-have style rules
//       '@stylistic/js/block-spacing': ['error', 'always'],
//       '@stylistic/js/brace-style': ['error', '1tbs', { allowSingleLine: true }],
//       '@stylistic/js/dot-location': ['error', 'property'],
//       '@stylistic/js/new-parens': 'error',
//       '@stylistic/js/no-whitespace-before-property': 'error',
//       '@stylistic/js/padded-blocks': [
//         'error',
//         { blocks: 'never', classes: 'never', switches: 'never' },
//       ],
//       '@stylistic/js/spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],

//       /**
//        * ------------------------------------------------------------------------
//        * JSX-SPECIFIC RULES
//        * ------------------------------------------------------------------------
//        */
//       '@stylistic/jsx/jsx-child-element-spacing': ['error'],
//       '@stylistic/jsx/jsx-closing-bracket-location': ['error', 'line-aligned'],
//       '@stylistic/jsx/jsx-closing-tag-location': ['error'],
//       '@stylistic/jsx/jsx-curly-newline': ['error', 'consistent'],
//       '@stylistic/jsx/jsx-curly-spacing': ['error', { when: 'never' }],
//       '@stylistic/jsx/jsx-equals-spacing': ['error', 'never'],
//       '@stylistic/jsx/jsx-first-prop-new-line': ['error', 'multiline'],
//       '@stylistic/jsx/jsx-indent-props': ['error', 2],
//       '@stylistic/jsx/jsx-props-no-multi-spaces': 'error',
//       '@stylistic/jsx/jsx-tag-spacing': [
//         'error',
//         {
//           beforeSelfClosing: 'always',
//           afterOpening: 'never',
//           closingSlash: 'never',
//         },
//       ],
//       '@stylistic/jsx/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
//       '@stylistic/jsx/jsx-wrap-multilines': ['error', { declaration: true, assignment: true }],

//       // Use double quotes in JSX attributes (recommended in some style guides)
//       '@stylistic/js/jsx-quotes': ['error', 'prefer-double'],

//       /**
//        * ------------------------------------------------------------------------
//        * DISABLE RULES HANDLED BY PRETTIER
//        * ------------------------------------------------------------------------
//        */
//       '@stylistic/js/max-len': 'off',
//       '@stylistic/jsx/max-len': 'off',
//       // '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//       // '@typescript-eslint/no-explicit-any': 'warn',
//       // '@typescript-eslint/explicit-function-return-type': 'off',
//     },
//   },
// ];
