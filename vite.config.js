import { defineConfig } from 'vite'

export default defineConfig({
  // ...other config options
  server: {
    allowedHosts: [
      'serval-generous-secondly.ngrok-free.app'
      // you can add more allowed hosts here if needed
    ]
  }
})