import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert/localhost.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert/localhost.crt")),
    },
    host: true,
    port: 5175
  }
});
