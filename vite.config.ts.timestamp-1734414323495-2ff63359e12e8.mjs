// vite.config.ts
import { defineConfig, loadEnv } from "file:///c:/Users/Dell/Desktop/p/project/node_modules/vite/dist/node/index.js";
import react from "file:///c:/Users/Dell/Desktop/p/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "c:\\Users\\Dell\\Desktop\\p\\project";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src")
      }
    },
    define: {
      __FIREBASE_CONFIG__: {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
      },
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8888",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      }
    },
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "firebase-vendor": ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
            "ui-vendor": ["@headlessui/react", "framer-motion", "lucide-react", "recharts"],
            "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"]
          }
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        extensions: [".js", ".cjs"]
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production"
        }
      },
      chunkSizeWarningLimit: 1e3
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/storage",
        "@headlessui/react",
        "framer-motion",
        "lucide-react",
        "recharts",
        "react-hook-form",
        "@hookform/resolvers/zod",
        "zod"
      ]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxEZWxsXFxcXERlc2t0b3BcXFxccFxcXFxwcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxEZWxsXFxcXERlc2t0b3BcXFxccFxcXFxwcm9qZWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9jOi9Vc2Vycy9EZWxsL0Rlc2t0b3AvcC9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICAvLyBMb2FkIGVudiBmaWxlIGJhc2VkIG9uIGBtb2RlYCBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgX19GSVJFQkFTRV9DT05GSUdfXzoge1xuICAgICAgICBhcGlLZXk6IGVudi5WSVRFX0ZJUkVCQVNFX0FQSV9LRVksXG4gICAgICAgIGF1dGhEb21haW46IGVudi5WSVRFX0ZJUkVCQVNFX0FVVEhfRE9NQUlOLFxuICAgICAgICBwcm9qZWN0SWQ6IGVudi5WSVRFX0ZJUkVCQVNFX1BST0pFQ1RfSUQsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IGVudi5WSVRFX0ZJUkVCQVNFX1NUT1JBR0VfQlVDS0VULFxuICAgICAgICBtZXNzYWdpbmdTZW5kZXJJZDogZW52LlZJVEVfRklSRUJBU0VfTUVTU0FHSU5HX1NFTkRFUl9JRCxcbiAgICAgICAgYXBwSWQ6IGVudi5WSVRFX0ZJUkVCQVNFX0FQUF9JRCxcbiAgICAgICAgbWVhc3VyZW1lbnRJZDogZW52LlZJVEVfRklSRUJBU0VfTUVBU1VSRU1FTlRfSURcbiAgICAgIH0sXG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24pXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICBob3N0OiB0cnVlLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiBlbnYuVklURV9BUElfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIHNvdXJjZW1hcDogbW9kZSAhPT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAnZmlyZWJhc2UtdmVuZG9yJzogWydmaXJlYmFzZS9hcHAnLCAnZmlyZWJhc2UvYXV0aCcsICdmaXJlYmFzZS9maXJlc3RvcmUnLCAnZmlyZWJhc2Uvc3RvcmFnZSddLFxuICAgICAgICAgICAgJ3VpLXZlbmRvcic6IFsnQGhlYWRsZXNzdWkvcmVhY3QnLCAnZnJhbWVyLW1vdGlvbicsICdsdWNpZGUtcmVhY3QnLCAncmVjaGFydHMnXSxcbiAgICAgICAgICAgICdmb3JtLXZlbmRvcic6IFsncmVhY3QtaG9vay1mb3JtJywgJ0Bob29rZm9ybS9yZXNvbHZlcnMnLCAnem9kJ11cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSxcbiAgICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLmNqcyddXG4gICAgICB9LFxuICAgICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICBkcm9wX2NvbnNvbGU6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiBtb2RlID09PSAncHJvZHVjdGlvbidcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICdyZWFjdCcsXG4gICAgICAgICdyZWFjdC1kb20nLFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAgICdmaXJlYmFzZS9hcHAnLFxuICAgICAgICAnZmlyZWJhc2UvYXV0aCcsXG4gICAgICAgICdmaXJlYmFzZS9maXJlc3RvcmUnLFxuICAgICAgICAnZmlyZWJhc2Uvc3RvcmFnZScsXG4gICAgICAgICdAaGVhZGxlc3N1aS9yZWFjdCcsXG4gICAgICAgICdmcmFtZXItbW90aW9uJyxcbiAgICAgICAgJ2x1Y2lkZS1yZWFjdCcsXG4gICAgICAgICdyZWNoYXJ0cycsXG4gICAgICAgICdyZWFjdC1ob29rLWZvcm0nLFxuICAgICAgICAnQGhvb2tmb3JtL3Jlc29sdmVycy96b2QnLFxuICAgICAgICAnem9kJ1xuICAgICAgXVxuICAgIH1cbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUixTQUFTLGNBQWMsZUFBZTtBQUNqVSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRnhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFFakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ2pDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04scUJBQXFCO0FBQUEsUUFDbkIsUUFBUSxJQUFJO0FBQUEsUUFDWixZQUFZLElBQUk7QUFBQSxRQUNoQixXQUFXLElBQUk7QUFBQSxRQUNmLGVBQWUsSUFBSTtBQUFBLFFBQ25CLG1CQUFtQixJQUFJO0FBQUEsUUFDdkIsT0FBTyxJQUFJO0FBQUEsUUFDWCxlQUFlLElBQUk7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsaUJBQWlCLEtBQUssVUFBVSxRQUFRLElBQUksbUJBQW1CO0FBQUEsSUFDakU7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVEsSUFBSSxnQkFBZ0I7QUFBQSxVQUM1QixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsVUFBVSxFQUFFO0FBQUEsUUFDOUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVyxTQUFTO0FBQUEsTUFDcEIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFlBQ3pELG1CQUFtQixDQUFDLGdCQUFnQixpQkFBaUIsc0JBQXNCLGtCQUFrQjtBQUFBLFlBQzdGLGFBQWEsQ0FBQyxxQkFBcUIsaUJBQWlCLGdCQUFnQixVQUFVO0FBQUEsWUFDOUUsZUFBZSxDQUFDLG1CQUFtQix1QkFBdUIsS0FBSztBQUFBLFVBQ2pFO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLFFBQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxRQUN4QixZQUFZLENBQUMsT0FBTyxNQUFNO0FBQUEsTUFDNUI7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFVBQVU7QUFBQSxVQUNSLGNBQWMsU0FBUztBQUFBLFVBQ3ZCLGVBQWUsU0FBUztBQUFBLFFBQzFCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsSUFDekI7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
