import type { NextConfig } from "next";
import path from "node:path";

// Spline 2.0.52 omits Draco assets and gives its Boolean WASM a different
// published filename. Use the same upstream Draco distribution from Three.js.
const splineAssets = {
  'boolean_wasm_bg.wasm': path.resolve('node_modules/@splinetool/runtime/build/boolean.wasm'),
  ...Object.fromEntries(['draco_decoder.wasm', 'draco_wasm_wrapper.js', 'draco_decoder.js', 'gltf/draco_wasm_wrapper.js', 'gltf/draco_decoder.wasm'].map(file => [
    `../libs/draco/${file}`, path.resolve(`node_modules/three/examples/jsm/libs/draco/${file}`),
  ])),
};

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: { resolveAlias: Object.fromEntries(Object.entries(splineAssets).map(([key, value]) => [key, `./${path.relative(process.cwd(), value)}`])) },
  webpack(config) {
    Object.assign(config.resolve.alias, splineAssets);
    return config;
  },
};

export default nextConfig;
