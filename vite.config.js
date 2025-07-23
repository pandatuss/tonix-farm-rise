// vite.config.js
export default {
  server: {
    port: 8080,
    host: '0.0.0.0', // Accept connections from any IP (optional)
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'serval-generous-secondly.ngrok-free.app', // Add your custom domains here
      // Add more hosts as needed
    ]
  }
}
