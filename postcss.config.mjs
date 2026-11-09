const postcssConfig = process.env.VITEST
  ? { plugins: {} }
  : {
      plugins: {
        '@tailwindcss/postcss': {},
      },
    };

export default postcssConfig;
