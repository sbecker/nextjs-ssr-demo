const { withFederatedSidecar } = require('@module-federation/nextjs-ssr');
// this enables you to use import() and the webpack parser
// loading remotes on demand, not ideal for SSR
const remotes = isServer => {
  const location = isServer ? 'ssr' : 'chunks';
  return {
    app_a: `app_a@http://localhost:5001/_next/static/${location}/remoteEntry.js?${Date.now()}`,
    app_b: `app_b@http://localhost:5002/_next/static/${location}/remoteEntry.js?${Date.now()}`,
  };
};
module.exports = withFederatedSidecar({
  name: 'app_b',
  filename: 'static/chunks/remoteEntry.js',
  remotes,
  exposes: {
    './app_b': './pages/app_b',
    './pages-map': './pages-map.js',
  },
  shared: {
    react: {
      requiredVersion: false,
      singleton: true,
    },
  },
}, {
  experiments: {
    hot: true,
  },
})({
  webpack(config, options) {
    config.module.rules.push({
      test: [/_app.[jt]sx?/,/_document.[jt]sx?/],
      loader: '@module-federation/nextjs-ssr/lib/federation-loader.js',
    });

    return config;
  },
});