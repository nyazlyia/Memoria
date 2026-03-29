import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react({
            fastRefresh: false,
            jsxRuntime: "automatic",
        }),
    ],
    server: {
        host: "localhost",
        port: 5173,
        hmr: false,
    },
});
