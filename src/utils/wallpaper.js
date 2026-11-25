/**
 * 壁纸配置与获取工具
 * 支持区分 PC 桌面端与 Mobile 移动端（横屏与竖屏）
 * 自动扫描目录中所有图片，无需按固定格式命名或指定后缀
 */
import { pcWallpapers, mobileWallpapers } from "virtual:wallpapers";

// 动态壁纸清单（初始为构建时自动扫描到的图片列表）
let dynamicPcWallpapers = Array.isArray(pcWallpapers) ? [...pcWallpapers] : [];
let dynamicMobileWallpapers = Array.isArray(mobileWallpapers) ? [...mobileWallpapers] : [];

// 客户端异步获取 wallpapers.json 清单（支持用户部署后免重新打包，热更新壁纸）
if (typeof window !== "undefined") {
  fetch("/wallpapers.json")
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((data) => {
      if (data) {
        if (Array.isArray(data.pc) && data.pc.length > 0) {
          dynamicPcWallpapers = data.pc;
        }
        if (Array.isArray(data.mobile) && data.mobile.length > 0) {
          dynamicMobileWallpapers = data.mobile;
        }
      }
    })
    .catch(() => {});
}

/**
 * 获取随机本地壁纸地址
 * @param {boolean} isMobile 是否为移动端
 * @returns {string} 本地图片路径
 */
export const getRandomLocalWallpaper = (isMobile = false) => {
  const list = isMobile ? dynamicMobileWallpapers : dynamicPcWallpapers;
  if (!list || list.length === 0) {
    // 降级兜底方案
    return isMobile ? "/images/mobile/background1.jpg" : "/images/pc/background1.jpg";
  }
  const randomIdx = Math.floor(Math.random() * list.length);
  return list[randomIdx];
};

/**
 * 根据壁纸种类与设备类型获取壁纸 URL
 * @param {string|number} type 0: 默认壁纸, 1: 每日一图, 2: 随机风景, 3: 随机动漫
 * @param {boolean} isMobile 是否为移动端
 * @returns {string} 壁纸 URL
 */
export const getWallpaperUrl = (type, isMobile = false) => {
  const deviceParam = isMobile ? "mb" : "pc";

  switch (String(type)) {
    case "0":
      // 默认本地壁纸（从任意命名、任意格式的扫描列表中随机选取）
      return getRandomLocalWallpaper(isMobile);

    case "1":
      // 每日一图 (必应)
      // PC 端返回 UHD/1920x1080 横屏，移动端返回 1080x1920 竖屏
      return isMobile
        ? "https://bz.w3h5.com/img/m"
        : "https://bz.w3h5.com/img/1920";

    case "2":
      // 随机风景 (uapis)
      return `https://uapis.cn/api/v1/random/image?category=landscape&type=${deviceParam}`;

    case "3":
      // 随机动漫 (uapis)
      return `https://uapis.cn/api/v1/random/image?category=acg&type=${deviceParam}`;

    default:
      return getRandomLocalWallpaper(isMobile);
  }
};
