module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: "3.0.0",
        targets: {
          node: "current",
        },
      },
    ],
  ],
};
