/**
 * @fileoverview Warn if a component is used in a template without being registered within that file.
 * @author sharkykh
 * Based on:
 * 1. https://github.com/vuejs/eslint-plugin-vue/blob/master/lib/rules/component-name-in-template-casing.js
 * 2. https://github.com/vuejs/eslint-plugin-vue/blob/master/lib/rules/no-unused-components.js
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('eslint-plugin-vue/lib/utils');
const casing = require('eslint-plugin-vue/lib/utils/casing');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const VueBuiltInComponents = [
  'component',
  'keep-alive',
  'slot',
  'transition',
  'transition-group'
];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'array',
        items: {
          type: 'string'
        },
        uniqueItems: true,
        additionalItems: false
      }
    ]
  },

  create(context) {
    const allowedComponents = VueBuiltInComponents.concat(context.options[0] || []);

    const tokens = context.parserServices.getTemplateBodyTokenStore && context.parserServices.getTemplateBodyTokenStore();
    const toPascalCase = casing.getConverter('PascalCase');

    let registeredComponents = [];
    let hasInvalidEOF = false;

    /**
     * Checks whether the given node is the verification target node.
     * @param {VElement} node element node
     * @returns {boolean} `true` if the given node is the verification target node.
     */
    function isVerifyTarget(node) {
      // If the component is allowed, ignore it
      try {
        if (allowedComponents.some(name => name === node.rawName)) {
          return false;
        }
      } catch (_) {}

      // Ignore non-Vue-components (vanilla HTML elements and SVG)
      if ((!utils.isHtmlElementNode(node) && !utils.isSvgElementNode(node)) ||
        utils.isHtmlWellKnownElementName(node.rawName) ||
        utils.isSvgWellKnownElementName(node.rawName)
      ) {
        return false;
      }

      return true;
    }

    function isComponentRegistered(name) {
      const casingName = toPascalCase(name);
      return registeredComponents.some(componentName => casingName === componentName);
    }

    function report(node, name) {
      context.report({
        node,
        loc: node.loc,
        message: 'Component "{{name}}" is used but not registered.',
        data: {
          name
        }
      });
    }

    return utils.defineTemplateBodyVisitor(
      context,
      {
        VElement(node) {
          if (hasInvalidEOF) {
            return;
          }

          if (!isVerifyTarget(node)) {
            return;
          }

          const name = node.rawName;
          if (!isComponentRegistered(name)) {
            const { startTag } = node;
            const open = tokens.getFirstToken(startTag);
            report(open, name);
          }
        },
        "VAttribute[directive=false][key.name='is']"(node) {
          const name = node.value.value;
          if (!isComponentRegistered(name)) {
            report(node.value, name);
          }
        },
        Program(node) {
          hasInvalidEOF = utils.hasInvalidEOF(node);
        }
      },
      utils.executeOnVue(context, obj => {
        registeredComponents = utils.getRegisteredComponents(obj).map(node => toPascalCase(node.name));
      })
    );
  }
};
