简体中文 | [English](./README_EN.md)

<p>
<strong><h2>Yalisの主页</h2></strong>
</p>

> [!NOTE]
> 本项目基于 [imsyy/home](https://github.com/imsyy/home) 优化而来，原作者已于 **2026 年 3 月 2 日** 归档原项目。
>
> 原项目地址：<https://github.com/imsyy/home>

![Yalisの主页](https://i.ibb.co/9mtyMxZL/home.webp)

>主页的 Logo 字体已经过压缩，若用本站 Logo 以外的字母会变回默认字体，这里是 [完整字体](https://file.imsyy.top/font/Other/Pacifico-Regular.ttf)，若无法下载，可将字体目录下的 `Pacifico-Regular-all.ttf` 进行替换

### Demo

>由于 CDN 缓存原因，查看最新效果可能需要 `Ctrl` + `F5` 强制刷新浏览器缓存

- [Yalisの主页](https://yalis.cn)

### 功能

- [x] 载入动画
- [x] 站点简介
- [x] Hitokoto 一言
- [x] 日期及时间
- [x] 实时天气（支持高德、Open-Meteo、和风天气、教书先生多平台与自动轮询冷却）
- [x] 时光进度条
- [x] 音乐播放器（支持歌单播放、音乐搜索、全屏沉浸式歌词、双语歌词拆分及设置面板动态配置）
- [x] 个性壁纸（支持本地壁纸自动扫描、每日一图、随机风景、随机动漫，自动区分 PC 与移动端）
- [x] 移动端适配（含移动端全局设置 Tab 切换、歌词触摸滚动定位等交互优化）
- [x] PWA 离线缓存与自动更新

### 部署

* **安装** [node.js](https://nodejs.org/zh-cn/) **环境**

  > node > 16.16.0  
  > npm > 8.15.0

* **初始化配置文件**

  仓库已将 `.env` 与 `src/assets/*.json` 加入 `.gitignore`，首次克隆后请先复制模板文件并按需修改：

  - 复制 `.env.example` 为 `.env`（配置站点信息、天气 Key、音乐 API 等）
  - 复制 `src/assets/siteLinks.example.json` 为 `src/assets/siteLinks.json`
  - 复制 `src/assets/socialLinks.example.json` 为 `src/assets/socialLinks.json`

* 然后运行终端并 `cd` 到项目根目录，输入：

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 预览（默认端口 56512）
pnpm dev

# 构建
pnpm build
```
> 构建完成后，静态资源会在 **`dist` 目录** 中生成，可将 **`dist` 文件夹下的文件**上传至服务器，也可使用 `Vercel` 等托管平台一键导入并自动部署

### 网站链接

在 `src/assets/siteLinks.json`（参考 `src/assets/siteLinks.example.json`）中可以自定义网站链接（以指向自己的网站），支持通过 `"hide": true` 临时隐藏某条链接：

```json
{
  "icon": "Blog",
  "name": "博客",
  "link": "https://example.com/",
  "hide": false
}
```

其中 `icon` 网站链接的图标可以在 `src/components/Links.vue` 中添加:

```js
// 可前往 https://www.xicons.org 自行挑选并在此处引入
// 目前引入了 @vicons/fa、@vicons/carbon、@vicons/tabler 图标
import {
  Link,
  Blog,
  CompactDisc,
  Cloud,
  LaptopCode,
  ...
} from "@vicons/fa";
import { EmailNew } from "@vicons/carbon";
import { FileSymlink } from "@vicons/tabler";

...

// 网站链接图标
const siteIcon = {
  Blog,
  CompactDisc,
  Cloud,
  LaptopCode,
  EmailNew,
  FileSymlink,
  ...
};
```

### 社交链接

在 `src/assets/socialLinks.json`（参考 `src/assets/socialLinks.example.json`）中可以自定义社交链接，同样支持 `"hide": true` 隐藏对应条目：

```json
{
  "name": "BiliBili",
  "icon": "/images/icon/bilibili.png",
  "tip": "(゜-゜)つロ 干杯 ~",
  "url": "https://space.bilibili.com/your-id",
  "hide": true
}
```

### 天气

天气功能支持多个数据平台，通过 `.env` 中的 `VITE_WEATHER_PROVIDER` 选择：

| 平台 | `VITE_WEATHER_PROVIDER` 值 | 是否需要 Key | 申请/控制台地址 |
|------|---------------------------|-------------|----------------|
| 高德 | `amap` | 需要 | [高德开放平台控制台](https://console.amap.com/dev/key/app) |
| Open-Meteo | `open-meteo` | 无需 | [Open-Meteo 文档](https://open-meteo.com/en/docs) |
| 和风天气 | `qweather` | 需要 | [和风天气控制台](https://console.qweather.com/) |
| 教书先生 | 留空 | 无需 | [教书先生 API](https://api.oioweb.cn/doc/weather/GetWeather) |

在 `.env` 中配置：

```bash
# 天气平台选择（amap-高德 | open-meteo-Open-Meteo | qweather-和风天气 | 留空-教书先生）
VITE_WEATHER_PROVIDER="amap"

# 天气 Key（按所选平台填入对应 Key，Open-Meteo/教书先生 无需 Key 可留空）
VITE_WEATHER_KEY=""

# 和风天气 API Host（仅 qweather 平台需要）
## 和风天气已弃用公共域名，需在控制台「设置」页查看个人专属 API Host
## 形如：h2a9cf3mhs.xy.qweatherapi.com（不含 https:// 前缀）
VITE_WEATHER_QWEATHER_API=""

# 天气缓存时间（分），0 表示不使用缓存
VITE_WEATHER_CACHE_TIME=10
```

> 说明：
> - **高德**：前往 [高德开放平台控制台](https://console.amap.com/dev/key/app) 创建 `Web 服务` 类型的 `Key`，填入 `VITE_WEATHER_KEY`。
> - **Open-Meteo**：免费开源，无需 Key，自动通过 IP 定位经纬度。
> - **和风天气**：需在 [控制台](https://console.qweather.com/) 申请 Key，并在「设置」页获取个人 API Host 填入 `VITE_WEATHER_QWEATHER_API`；接口使用 `X-QW-Api-Key` 请求头鉴权。
> - **教书先生**：无需 Key，作为默认备用方案。

#### 自动轮询与错误冷却

天气功能内置**多平台自动轮询**机制，提升可用性：

- **候选平台池**：`VITE_WEATHER_PROVIDER` + `open-meteo` + `other`（教书先生），自动去重。`VITE_WEATHER_KEY` 指定的平台不参与轮询（除非它就是 `VITE_WEATHER_PROVIDER`）。
- **优先使用** `VITE_WEATHER_PROVIDER` 指定的平台。
- **失败立即轮询**：当前平台获取失败时，立即尝试候选池中的下一个平台，无需等待。
- **错误冷却**：失败的平台进入黑名单，冷却 **10 分钟**（每个平台独立计时），冷却期内轮询时自动跳过。
- **防止死循环**：若候选池中所有平台都在黑名单/全部失败，则停止轮询并返回"天气数据获取失败"。


### 音乐

>本项目采用了基于 `MetingJS` 的 `Aplayer` 音乐播放器，支持歌单播放、在线搜索与全屏沉浸式歌词  
>*仅支持 **中国大陆地区**

#### 默认配置（`.env`）

请在 `.env` 文件中更改歌曲相关参数即可设置默认歌单，也可在网页端 **全局设置 -> 播放器配置** 中实时修改并持久化保存：

```bash
# 歌曲 API 地址
VITE_SONG_API="https://music-home.yalis.cn/api"
# 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
VITE_SONG_SERVER="netease"
# 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
VITE_SONG_TYPE="playlist"
# 播放 ID ( 若无需播放器，请设为空即可 )
VITE_SONG_ID=""
```

#### 音乐搜索与全屏歌词

- **音乐搜索**：在音乐列表弹窗右上角点击搜索图标，可切换 **网易云** / **QQ 音乐** 渠道搜索歌曲；QQ 音乐渠道支持「加载更多」分页加载。
- **全屏沉浸式歌词**：支持 **双栏模式（唱片 + 歌词）**、**频谱律动**、**纯享歌词** 三种视图切换（移动端为 **唱片** / **歌词** 模式），支持 `Esc` 快捷键关闭。
- **双语歌词与移动端交互**：自动拆分 `原文 (翻译)` 或换行格式的双语歌词；移动端支持歌词导航与触摸滚动定位。

### 字体

现采用 `HarmonyOS Sans` 开源字体，采用字体拆分，提升加载速度

>由于本站 `CDN` 已开启防盗链，**非本站域名不可访问**，请将字体引入链接更改为下方内容，否则 **自定义字体将失效**
>
>`https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css`

<details>
<summary>旧版方式</summary>

>由于本项目引入了中文字体，需要压缩中文字体以提高网页加载速度（ 也可以取消使用中文字体 ）

#### 中文字体去除繁体

- 安装 `Python 3.7` 和 `pip`
- 运行 `pip install fonttools`
- 下载 [sc_unicode.txt](https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt)
- 运行 `pyftsubset 字体名称.ttf --unicodes-file=sc_unicode.txt`

#### 字体进一步压缩

- 编译安装 `Google woff2`

```bash
sudo apt-get install -y git g++ make
git clone --recursive https://github.com/google/woff2.git
cd woff2
make clean all
```

- 再压缩字体

```
./woff2_compress ./字体名称.ttf
```

- 最终可对原字体进行缓加载，**先行加载压缩后的字体**

>详细信息可前往 [虹墨空间站](https://www.imaegoo.com/2020/chinese-font-compress/) 查看原文

</details>

### 网站图标及网站背景

#### 网站背景

可以在 **全局设置 -> 个性壁纸** 中切换四种壁纸来源（均自动区分 PC 横屏与移动端竖屏）：

1. **默认壁纸**：读取本地 `public/images/` 目录壁纸
2. **每日一图**：必应每日壁纸
3. **随机风景**：随机风景壁纸 API
4. **随机动漫**：随机动漫壁纸 API

本地壁纸存放在 `public/images` 中，现已支持 **PC 端与移动端（手机竖屏）自适应壁纸** 与 **完全自动化扫描**：

- **PC 端壁纸**：存放在 `public/images/pc/` 目录下
- **移动端壁纸**：存放在 `public/images/mobile/` 目录下

> [!TIP]
> **无需规范文件名与固定后缀**：
> 系统已内置自动扫描插件，支持任意文件名（如 `风景.png`、`wallpaper_01.webp`、`IMG_2024.jpg`）与任意图片格式（`.jpg`、`.jpeg`、`.png`、`.webp`、`.avif`、`.gif`、`.bmp`、`.svg`），放入文件夹即可自动识别，无需手动修改数量或修改代码！
> 
> 构建或启动项目时，会自动生成 `public/wallpapers.json` 壁纸清单。若部署到服务器后不想重新打包，也可直接编辑服务器上的 `dist/wallpapers.json` 动态增减壁纸。

#### 网站图标

可以在 `public/images/icon` 中修改网站图标。

### 技术栈

* [Vue](https://cn.vuejs.org/)
* [Vite](https://vitejs.cn/vite3-cn/)
* [Pinia](https://pinia.vuejs.org/zh/)
* [Element Plus](https://element-plus.org/zh-CN/)
* [IconPark](https://iconpark.oceanengine.com/official)
* [xicons](https://xicons.org/)（`@vicons/fa`、`@vicons/carbon`、`@vicons/tabler`）
* [Aplayer](https://aplayer.js.org/)
* [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

### API

* [小歪 API](https://api.aixiaowai.cn)
* [搏天 API](https://api.btstu.cn/doc/sjbz.php)
* [高德开放平台](https://lbs.amap.com/)
* [Open-Meteo](https://open-meteo.com/)
* [和风天气](https://dev.qweather.com/)
* [Hitokoto 一言](https://hitokoto.cn/)
* [MetingAPI By 武恩赐](https://api.wuenci.com/meting/api/)

<a title="SSL" target="_blank" href="https://myssl.com/seal/detail?domain=yalis.cn"><img src="https://img.shields.io/badge/MySSL-安全认证-brightgreen"></a>&nbsp;<a title="CDN" target="_blank" href="https://cdnjs.com/"><img src="https://img.shields.io/badge/CDN-Cloudflare-blue"></a>&nbsp;<a title="Copyright" target="_blank" href="https://yalis.cn/"><img src="https://img.shields.io/badge/Copyright%20%C2%A9%202026--2026-Yalis-red"></a>
