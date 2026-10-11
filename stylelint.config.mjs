export default {
  rules: {
    'color-no-hex': true,
    'declaration-no-important': true,
    'declaration-property-value-allowed-list': {
      'border-radius': ['/^(var\\(--r-(sm|md|lg|full)\\)|0)$/'],
      'font-size': ['/^(var\\(--fs-(title|h2|body|button|label|caption|overline)\\)|inherit)$/'],
    },
  },
  overrides: [{ files: ['src/app/tokens.css'], rules: { 'declaration-property-value-allowed-list': null } }],
};
