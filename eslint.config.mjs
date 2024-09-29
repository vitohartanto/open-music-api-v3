import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node, // Menambahkan global Node.js
      },
    },
  },
  pluginJs.configs.recommended,
];
