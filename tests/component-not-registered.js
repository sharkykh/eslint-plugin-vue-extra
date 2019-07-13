/**
 * @fileoverview Report usage of unregisted components
 * @author sharkykh
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../src/component-not-registered.js');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const tester = new RuleTester({
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
});

tester.run('component-not-registered', rule, {
  valid: [
    { // 1
      filename: 'test.vue',
      code: `<template>
        <div>
          <my-component />
        </div>
      </template>
      <script>
        export default {
          components: {
            MyComponent
          }
        }
      </script>`
    },
    { // 2 -- dynamic components are not supported yet
      filename: 'test.vue',
      code: `<template>
        <component is="my-component" />
      </template>
      <script>
        export default {
          components: {
            MyComponent,
          },
        }
      </script>`
    }
  ],
  invalid: [
    { // 1
      filename: 'test.vue',
      code: `<template>
        <my-component />
      </template>
      <script>
        export default {}
      </script>`,
      errors: [{
        message: 'Component "my-component" is used but not registered.',
        line: 2
      }]
    }
  ]
});
