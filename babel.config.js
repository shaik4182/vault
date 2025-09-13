module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ⛔ Remove this line if you already have it:
      // "react-native-reanimated/plugin",

      // ✅ Use this instead:
      "react-native-worklets/plugin",
    ],
  };
};
