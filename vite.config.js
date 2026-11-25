import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve, extname } from "path";
import fs from "fs";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// 自动扫描本地壁纸目录插件
const virtualWallpaperId = "virtual:wallpapers";
const resolvedVirtualWallpaperId = "\0" + virtualWallpaperId;

function localWallpapersPlugin() {
  const getImages = (subDir) => {
    const dirPath = resolve(__dirname, "public/images", subDir);
    if (!fs.existsSync(dirPath)) return [];
    const validExts = new Set([
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".avif",
      ".gif",
      ".bmp",
      ".svg",
    ]);
    return fs
      .readdirSync(dirPath)
      .filter((file) => validExts.has(extname(file).toLowerCase()))
      .map((file) => `/images/${subDir}/${file}`);
  };

  return {
    name: "vite-plugin-local-wallpapers",
    resolveId(id) {
      if (id === virtualWallpaperId) {
        return resolvedVirtualWallpaperId;
      }
    },
    load(id) {
      if (id === resolvedVirtualWallpaperId) {
        const pcList = getImages("pc");
        const mobileList = getImages("mobile");
        return `export const pcWallpapers = ${JSON.stringify(pcList)};
export const mobileWallpapers = ${JSON.stringify(mobileList)};
export default { pc: pcWallpapers, mobile: mobileWallpapers };`;
      }
    },
    buildStart() {
      // 构建或启动时自动生成 public/wallpapers.json 清单
      const pcList = getImages("pc");
      const mobileList = getImages("mobile");
      const jsonPath = resolve(__dirname, "public/wallpapers.json");
      fs.writeFileSync(
        jsonPath,
        JSON.stringify({ pc: pcList, mobile: mobileList }, null, 2),
        "utf-8",
      );
    },
    handleHotUpdate({ server, file }) {
      if (file.includes("public/images")) {
        const mod = server.moduleGraph.getModuleById(resolvedVirtualWallpaperId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      localWallpapersPlugin(),
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: 'auto',  // 添加这行：自动注入 SW 注册代码
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,  // 添加这行
          // 添加这个配置，确保每次构建都生成新的 revision
          maximumFileSizeToCacheInBytes: 5000000,
          // ✅ 解决更新问题的关键：添加动态 revision
          additionalManifestEntries: [
            { url: '/version.txt', revision: Date.now().toString() }
          ],
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/, // js / css 静态资源缓存
              handler: "CacheFirst",
              options: {
                cacheName: "js-css-cache",
              },
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/, // 图片缓存
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
              },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            {
              src: "/images/icon/48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "/images/icon/72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "/images/icon/96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "/images/icon/128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "/images/icon/144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "/images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "56512",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          // 静默 Sass 弃用警告（legacy-js-api 与第三方库 swiper 内部的 @import）
          silenceDeprecations: ["legacy-js-api", "import"],
          quietDeps: true,
        },
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  });
