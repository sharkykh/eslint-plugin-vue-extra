/* eslint comma-dangle: [error, always-multiline] */
module.exports = {
  extends: [
    'xo-space',
  ],
  rules: {
    'object-curly-spacing': [
      'error',
      'always',
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
};
