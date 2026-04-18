const {
  shareAll,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'bkt',
  exposes: {
    './bkt': './src/app/app.ts',
    './bkt-payment-step2': './src/app/components/payment-step2-bkt/payment-step2-bkt.component.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    '@vcb/shared-libs': { singleton: true, strictVersion: false, requiredVersion: false }
  },
});
