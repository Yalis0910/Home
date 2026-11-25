// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取 QQ 音乐搜索列表 (JSONP)
export const searchQQMusic = async (keyword, page = 1, pageSize = 20) => {
  const url = `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?p=${page}&n=${pageSize}&w=${encodeURIComponent(
    keyword,
  )}&format=jsonp`;
  const res = await fetchJsonp(url, {
    jsonpCallback: "jsonpCallback",
  });
  const data = await res.json();
  const list = data?.data?.song?.list || [];
  const songApi = import.meta.env.VITE_SONG_API;

  return list.map((item) => {
    const isVip = item.pay?.payplay === 1;
    const singer = item.singer?.map((s) => s.name).join(" / ") || "未知歌手";
    const pic = item.albummid
      ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`
      : "https://y.gtimg.cn/music/photo_new/T002R300x300M000.jpg";
    const songmid = item.songmid;

    return {
      title: item.songname,
      artist: singer,
      src: `${songApi}?server=tencent&type=url&id=${songmid}`,
      pic,
      lrc: `${songApi}?server=tencent&type=lrc&id=${songmid}`,
      isVip: Boolean(isVip),
    };
  });
};

// 获取音乐播放列表
export const getPlayerList = async (server, type, id, page = 1, pageSize = 20) => {
  if (server === "tencent" && type === "search") {
    return await searchQQMusic(id, page, pageSize);
  }

  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (data[0]?.url?.startsWith("@")) {
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      title: v.name || v.title,
      artist: v.artist || v.author,
      src: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      pic: v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      title: v.name || v.title,
      artist: v.artist || v.author,
      src: v.url,
      pic: v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};

// 获取 Open-Meteo 天气 API（免费开源，无需 Key）
// https://open-meteo.com/en/docs
// 通过 IP 定位城市，需配合 https://ipwho.is/ 获取经纬度（支持 CORS）
export const getOpenMeteoWeather = async () => {
  // 先通过 IP 获取经纬度
  const ipRes = await fetch("https://ipwho.is/");
  const ipData = await ipRes.json();
  const lat = ipData.latitude;
  const lon = typeof ipData.longitude !== "undefined" ? ipData.longitude : 0;

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
  );
  return await res.json();
};

// 获取和风天气（QWeather）API
// https://console.qweather.com/
// 与 Open-Meteo 一样：先通过 IP 获取经纬度，再调用 /weather/v1/current/{lat}/{lon}
export const getQWeather = async (key) => {
  // 和风天气已弃用公共域名，优先使用个人 API Host
  // 控制台「设置」页查看，形如 h2a9cf3mhs.xy.qweatherapi.com
  const apiHost = import.meta.env.VITE_WEATHER_QWEATHER_API;
  if (!apiHost) {
    throw new TypeError("未配置和风天气 API Host（VITE_WEATHER_QWEATHER_API）");
  }

  // 1. 先通过 IP 获取经纬度（使用 ipwho.is，支持 CORS）
  const ipRes = await fetch("https://ipwho.is/");
  const ipData = await ipRes.json();
  const lat = ipData.latitude;
  const lon = typeof ipData.longitude !== "undefined" ? ipData.longitude : 0;
  const city = ipData.city || "当前位置";

  // 2. 调用 Current Weather 接口（X-QW-Api-Key 请求头鉴权）
  const res = await fetch(
    `https://${apiHost}/weather/v1/current/${lat}/${lon}?localTime=false&lang=zh`,
    {
      headers: {
        accept: "application/json",
        "X-QW-Api-Key": key,
      },
    },
  );
  const data = await res.json();
  return {
    ...data,
    city, // 城市名
  };
};
