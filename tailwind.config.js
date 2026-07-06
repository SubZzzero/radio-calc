export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        body: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(45, 212, 191, 0.18)',
      },
    },
  },
  plugins: [],
};
