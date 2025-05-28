export default {
  entrypoints: ["./webflow-form-submission.js"],
  outdir: "./dist",
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
  target: "browser",
  format: "iife", // Immediately Invoked Function Expression for browser compatibility
  naming: {
    entry: "[dir]/[name].[ext]",
  },
};
