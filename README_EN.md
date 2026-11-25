[简体中文](./README.md) | English

<p>
<strong><h2>Yalisの主页</h2></strong>
</p>

> [!NOTE]
> This project is built upon and optimized from [imsyy/home](https://github.com/imsyy/home). The original author archived the original project on **March 2, 2026**.
>
> Original project: <https://github.com/imsyy/home>

![Yalisの主页](https://i.ibb.co/9mtyMxZL/home.webp)

>The logo font on the home page has been compressed, so if you use letters other than this site's logo, it will revert to the default font. Here is the [full font](https://file.imsyy.top/font/Other/Pacifico-Regular.ttf); if you cannot download it, you can replace it with `Pacifico-Regular-all.ttf` in the font directory.

### Demo

>Due to CDN caching, you may need `Ctrl` + `F5` to force a browser cache refresh to see the latest results

- [Yalisの主页](https://yalis.cn)

### Functions

- [x] Loading animation
- [x] Site description
- [x] Hitokoto
- [x] Date and time
- [x] Live weather (supports AMap, Open-Meteo, QWeather, and Teacher multi-provider with auto-fallback & cooldown)
- [x] Time progress bar
- [x] Music player (supports playlist playback, music search, full-screen immersive lyrics, bilingual lyrics splitting, and dynamic configuration in settings)
- [x] Custom wallpapers (supports automatic local wallpaper scanning, Bing daily image, random landscape, random anime, automatically distinguishing PC and mobile)
- [x] Mobile adaptation (including mobile Global Settings tab switching, lyric touch-scroll seeking, and other interaction optimizations)
- [x] PWA offline caching and auto-update

### Deployment

* **Install** [node.js](https://nodejs.org/en/) **environment**

  > node > 16.16.0  
  > npm > 8.15.0

* **Initialize configuration files**

  `.env` and `src/assets/*.json` are included in `.gitignore`. After cloning for the first time, copy the template files and modify them as needed:

  - Copy `.env.example` to `.env` (configure site info, weather key, music API, etc.)
  - Copy `src/assets/siteLinks.example.json` to `src/assets/siteLinks.json`
  - Copy `src/assets/socialLinks.example.json` to `src/assets/socialLinks.json`

* Then open a terminal, `cd` to the project root directory, and run:

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Preview (default port 56512)
pnpm dev

# Build
pnpm build
```
> Once the build is complete, static assets will be generated in the **`dist` directory**. You can upload the files under **`dist`** to your server, or import and deploy automatically with one click on hosting platforms such as `Vercel`.

### Site Links

You can customize site links (to point to your own sites) in `src/assets/siteLinks.json` (refer to `src/assets/siteLinks.example.json`), and temporarily hide an entry using `"hide": true`:

```json
{
  "icon": "Blog",
  "name": "Blog",
  "link": "https://example.com/",
  "hide": false
}
```

The `icon` for site links can be added in `src/components/Links.vue`:

```js
// Browse https://www.xicons.org to pick icons and import them here
// Currently using icons from @vicons/fa, @vicons/carbon, and @vicons/tabler
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

// Site link icons
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

### Social Links

You can customize social links in `src/assets/socialLinks.json` (refer to `src/assets/socialLinks.example.json`), which also supports `"hide": true` to hide an entry:

```json
{
  "name": "BiliBili",
  "icon": "/images/icon/bilibili.png",
  "tip": "(゜-゜)つロ Cheers ~",
  "url": "https://space.bilibili.com/your-id",
  "hide": true
}
```

### Weather

The weather feature supports multiple data providers, selected via `VITE_WEATHER_PROVIDER` in `.env`:

| Provider | `VITE_WEATHER_PROVIDER` value | Key required | Console / Docs |
|----------|------------------------------|--------------|----------------|
| AMap | `amap` | Yes | [AMap Console](https://console.amap.com/dev/key/app) |
| Open-Meteo | `open-meteo` | No | [Open-Meteo Docs](https://open-meteo.com/en/docs) |
| QWeather | `qweather` | Yes | [QWeather Console](https://console.qweather.com/) |
| Teacher (教书先生) | empty | No | [Teacher API](https://api.oioweb.cn/doc/weather/GetWeather) |

Configure in `.env`:

```bash
# Weather provider (amap-AMap | open-meteo-Open-Meteo | qweather-QWeather | empty-Teacher)
VITE_WEATHER_PROVIDER="amap"

# Weather Key (fill in the Key of the selected provider, not needed for Open-Meteo/Teacher)
VITE_WEATHER_KEY=""

# QWeather API Host (only required for qweather provider)
## QWeather has deprecated public domains; find your personal API Host in Console > Settings
## e.g. h2a9cf3mhs.xy.qweatherapi.com (without https:// prefix)
VITE_WEATHER_QWEATHER_API=""

# Weather cache time (minutes), 0 means no cache
VITE_WEATHER_CACHE_TIME=10
```

> Notes:
> - **AMap**: Create a `Web Service` `Key` in the [AMap Console](https://console.amap.com/dev/key/app) and fill it into `VITE_WEATHER_KEY`.
> - **Open-Meteo**: Free and open source, no Key required, automatically locates coordinates via IP.
> - **QWeather**: Apply for a Key in the [Console](https://console.qweather.com/) and get your personal API Host from the "Settings" page into `VITE_WEATHER_QWEATHER_API`; the API uses the `X-QW-Api-Key` request header for authentication.
> - **Teacher**: No Key required, used as the default fallback.

#### Auto-fallback and error cooldown

The weather feature has a built-in **multi-provider auto-fallback** mechanism for better availability:

- **Candidate pool**: `VITE_WEATHER_PROVIDER` + `open-meteo` + `other` (Teacher), de-duplicated automatically. The provider specified by `VITE_WEATHER_KEY` does not participate in fallback (unless it is also `VITE_WEATHER_PROVIDER`).
- **Priority**: Uses the provider specified by `VITE_WEATHER_PROVIDER` first.
- **Immediate fallback**: When the current provider fails, it immediately tries the next provider in the candidate pool without waiting.
- **Error cooldown**: A failed provider is blacklisted for **10 minutes** (each provider timed independently) and is skipped during fallback while cooling down.
- **Prevent infinite loop**: If all providers in the candidate pool are blacklisted / have failed, fallback stops and returns "weather data fetch failed".

### Music

>This project uses the `Aplayer` music player based on `MetingJS`, supporting playlist playback, online search, and full-screen immersive lyrics  
>*Only supported in **Mainland China**

#### Default Configuration (`.env`)

Change the song-related parameters in `.env` to set the default playlist, or modify and persist them in real time under **Global Settings -> Player Config** in the web UI:

```bash
# Songs API address
VITE_SONG_API="https://music-home.yalis.cn/api"
# Song server ( netease-NetEase, tencent-QQ Music )
VITE_SONG_SERVER="netease"
# Playback type ( song-song, playlist-playlist, album-album, search-search, artist-artist )
VITE_SONG_TYPE="playlist"
# Playback ID ( leave empty if player is not needed )
VITE_SONG_ID=""
```

#### Music Search & Full-screen Lyrics

- **Music Search**: Click the search icon in the top-right corner of the music list modal to switch between **NetEase** and **QQ Music** channels and search for tracks; QQ Music supports "Load More" pagination.
- **Full-screen Immersive Lyrics**: Supports switching between three views—**Split Mode (Vinyl + Lyrics)**, **Spectrum Rhythm**, and **Lyrics Only** (**Disc** / **Lyrics** on mobile)—and can be closed with the `Esc` key.
- **Bilingual Lyrics & Mobile Interaction**: Automatically splits bilingual lyrics formatted as `Original (Translation)` or separated by newlines; mobile supports lyric navigation and touch-scroll seeking.

### Fonts

Now using the `HarmonyOS Sans` open-source font with font splitting to improve loading speed.

>Because this site's `CDN` has anti-leech enabled, **non-site domains are not accessible**. Please change the font stylesheet link to the one below, otherwise **custom fonts will not work**:
>
>`https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css`

<details>
<summary>Old way</summary>

>As Chinese fonts are introduced in this project, Chinese fonts need to be compressed to improve the loading speed of the page (you can also cancel the use of Chinese fonts)

#### Chinese font removal traditional

- Install `Python 3.7` and `pip`
- Run `pip install fonttools`
- Download [sc_unicode.txt](https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt)
- Run `pyftsubset font-name.ttf --unicodes-file=sc_unicode.txt`

#### Fonts further compressed

- Compile and install `Google woff2`

```bash
sudo apt-get install -y git g++ make
git clone --recursive https://github.com/google/woff2.git
cd woff2
make clean all
```

- Compress the font again

```
./woff2_compress ./font_name.ttf
```

- Eventually the original font can be slow loaded, **load the compressed font first**

>For more information, please go to [虹墨空间站](https://www.imaegoo.com/2020/chinese-font-compress/) to view the original article

</details>

### Site Icons and Background

#### Background

You can switch between four wallpaper sources in **Global Settings -> Custom Wallpaper** (all automatically distinguish between PC landscape and mobile portrait):

1. **Default Wallpaper**: Reads local wallpapers from `public/images/`
2. **Daily Image**: Bing daily wallpaper
3. **Random Landscape**: Random landscape wallpaper API
4. **Random Anime**: Random anime wallpaper API

Local wallpapers are stored in `public/images`, with **adaptive PC & mobile (portrait) wallpapers** and **fully automatic scanning**:

- **PC wallpapers**: Stored in `public/images/pc/`
- **Mobile wallpapers**: Stored in `public/images/mobile/`

> [!TIP]
> **No fixed filenames or extensions required**:
> The built-in auto-scan plugin supports any filename (e.g. `scenery.png`, `wallpaper_01.webp`, `IMG_2024.jpg`) and any image format (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.bmp`, `.svg`). Simply drop images into the folder and they will be detected automatically—no manual count or code changes needed!
>
> `public/wallpapers.json` is automatically generated when building or starting the project. If you don't want to rebuild after deploying to a server, you can also edit `dist/wallpapers.json` directly on the server to add or remove wallpapers dynamically.

#### Site Icons

You can modify the site icons in `public/images/icon`.

### Technology Stack

* [Vue](https://cn.vuejs.org/)
* [Vite](https://vitejs.cn/vite3-cn/)
* [Pinia](https://pinia.vuejs.org/zh/)
* [Element Plus](https://element-plus.org/zh-CN/)
* [IconPark](https://iconpark.oceanengine.com/official)
* [xicons](https://xicons.org/) (`@vicons/fa`, `@vicons/carbon`, `@vicons/tabler`)
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
