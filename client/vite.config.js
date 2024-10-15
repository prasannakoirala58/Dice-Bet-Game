export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Proxy API requests to the backend
    },
  },
};
