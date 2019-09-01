/**
 * @fileoverview Report usage of unregisted components
 * @author sharkykh
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const dedent = require('dedent');
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
    {
      filename: 'test.vue',
      code: dedent`
      <template>
        <div>
          <my-component />
          <MyComponent />
          <other-component />
          <OtherComponent />
        </div>
      </template>
      <script>
        export default {
          components: {
            MyComponent,
            'other-component': OtherComponent
          }
        }
      </script>`
    },
    { // Dynamic component names
      filename: 'test.vue',
      code: dedent`
      <template>
        <component :is="MyComponent" />
        <component is="MyComponent" />
        <component is="my-component" />
      </template>
      <script>
        export default {
          components: {
            MyComponent,
          },
        }
      </script>`
    },
    { // Non-literal dynamic component names is not supported
      filename: 'test.vue',
      code: dedent`
      <template>
        <component :is="'other-component'" />
      </template>
      <script>
        export default {
          components: {
            MyComponent,
          },
        }
      </script>`
    },
    { // Allowed components option
      filename: 'test.vue',
      code: dedent`
      <template>
        <router-link :to="home/" />
      </template>
      <script>
        export default {}
      </script>`,
      options: [
        [
          'router-link'
        ]
      ]
    },
    { // Vue built-in components
      filename: 'test.vue',
      code: dedent`
      <template>
        <template />
        <keep-alive />
        <slot />
        <transition />
        <transition-group />
      </template>
      <script>
        export default {}
      </script>`
    }
  ],
  invalid: [
    {
      filename: 'test.vue',
      code: dedent`
      <template>
        <component is="other-component" />
        <component is="OtherComponent" />
      </template>
      <script>
        export default {
          components: {
            MyComponent,
          },
        }
      </script>`,
      errors: [{
        message: 'Component "other-component" is used but not registered.',
        line: 2,
        column: 17
      },
      {
        message: 'Component "OtherComponent" is used but not registered.',
        line: 3,
        column: 17
      }]
    },
    {
      filename: 'test.vue',
      code: dedent`
      <template>
        <my-component />
      </template>
      <script>
        export default {}
      </script>`,
      errors: [{
        message: 'Component "my-component" is used but not registered.',
        line: 2,
        column: 3
      }]
    }
  ]
});
