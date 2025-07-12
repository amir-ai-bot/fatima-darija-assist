module.exports = {
  overrides: [
    {
      files: ["supabase/functions/**/*.ts"],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
      env: {
        deno: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  ],
}; 