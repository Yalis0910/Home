<template>
  <!-- 获取中 -->
  <div class="weather" v-if="loading" @click="getWeatherData(0)">
    <span>天气获取中...</span>
  </div>
  <!-- 获取成功，显示天气信息 -->
  <div
    class="weather"
    v-else-if="weatherData.adCode.city && weatherData.weather.weather"
    @click="getWeatherData(0)"
  >
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden"
      >{{ formatWindDirection(weatherData.weather.winddirection) }}&nbsp;</span
    >
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <!-- 获取失败 -->
  <div class="weather" v-else @click="getWeatherData(0)">
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getAdcode, getOpenMeteoWeather, getOtherWeather, getQWeather, getWeather } from "@/api";
import { Error } from "@icon-park/vue-next";

// 天气平台选择（amap-高德 | open-meteo-Open-Meteo | qweather-和风 | 留空-教书先生）
const weatherProvider = import.meta.env.VITE_WEATHER_PROVIDER;
// 天气 Key（按所选平台填入对应 Key，Open-Meteo/教书先生 无需 Key）
const mainKey = import.meta.env.VITE_WEATHER_KEY;
// 天气缓存时间（分），0 表示不使用缓存
const cacheTime = parseInt(import.meta.env.VITE_WEATHER_CACHE_TIME || 0);

// 缓存键名和有效期
const WEATHER_CACHE_KEY = "weather_cache" + weatherProvider + mainKey;
const CACHE_DURATION = cacheTime * 60 * 1000; // 30分钟（毫秒）

// 黑名单（错误冷却）相关
const BLACKLIST_KEY = "weather_blacklist"; // 黑名单存储键
const COOLDOWN_DURATION = 10 * 60 * 1000; // 错误冷却时间：10 分钟

// 读取黑名单（{ 平台: 冷却到期时间戳 }）
const getBlacklist = () => {
  try {
    const data = localStorage.getItem(BLACKLIST_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    // 防止存储了 null 或非对象导致读取报错
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

// 判断平台是否在冷却中
const isCooldown = (provider) => {
  const blacklist = getBlacklist();
  const expire = blacklist[provider];
  return !!expire && Date.now() < expire;
};

// 将平台加入黑名单（设置冷却到期时间）
const addToBlacklist = (provider) => {
  const blacklist = getBlacklist();
  blacklist[provider] = Date.now() + COOLDOWN_DURATION;
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist));
};

// 轮询候选平台：VITE_WEATHER_PROVIDER + open-meteo + other（去重）
// VITE_WEATHER_KEY 不参与轮询
const getProviderPool = () => {
  return [...new Set([weatherProvider || "other", "open-meteo", "other"])];
};

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述（字符串或角度数字）
    windpower: null, // 风力级别
  },
});

// 加载状态（true-获取中，false-获取完成）
const loading = ref(true);

// 风向格式化（兼容字符串描述与角度数字，如 Open-Meteo 返回 0-360 度数）
const formatWindDirection = (dir) => {
  if (typeof dir === "number") {
    // 将角度转换为 8 方位中文
    const dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    return dirs[Math.round(dir / 45) % 8] + "风";
  }
  // 字符串：已有"风"后缀则原样返回，否则补"风"
  if (typeof dir === "string" && dir.endsWith("风")) return dir;
  return dir ? dir + "风" : "";
};

// 从本地存储获取缓存
const getCache = () => {
  try {
    const cache = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cache) return null;
    return JSON.parse(cache);
  } catch {
    return null;
  }
};

// 保存到本地存储
const setCache = (data) => {
  const cache = {
    timestamp: Date.now(),
    data: data,
  };
  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
};

// 检查缓存是否有效
const isCacheValid = (cache) => {
  if (!cache || !cache.timestamp) return false;
  return Date.now() - cache.timestamp < CACHE_DURATION;
};

// 使用缓存数据填充
const applyCacheData = (cache) => {
  if (cache && cache.data) {
    weatherData.adCode = cache.data.adCode;
    weatherData.weather = cache.data.weather;
  }
};

// 获取天气数据
const getWeatherData = (cacheTime = 0) => {
  // 不使用缓存开关：跳过缓存读取，直接请求
  if (!cacheTime) {
    fetchAndUpdateWeather(null);
    return;
  }

  // 先尝试读取缓存
  const cache = getCache();

  if (isCacheValid(cache)) {
    // 缓存有效，直接使用
    loading.value = false;
    applyCacheData(cache);
    console.log("使用本地缓存的天气数据");
    return;
  }

  // 缓存无效或不存在，重新请求
  fetchAndUpdateWeather(cache);
};

// 提取请求逻辑为独立函数
const fetchAndUpdateWeather = (oldCache) => {
  // 开始获取：显示"获取中"
  loading.value = true;

  // 更新响应式数据和缓存
  const updateWeather = (newData) => {
    loading.value = false;
    Object.assign(weatherData, newData);
    setCache(newData);
  };

  // 各平台请求函数，返回 Promise（成功 resolve，失败 reject）
  const fetchAmap = () =>
    getAdcode(mainKey).then((res) => {
      // 校验定位结果
      if (!res || res.status !== "1" || !res.adcode) {
        throw new TypeError("IP 定位失败或 Key 无效");
      }
      const adCodeData = { city: res.city, adcode: res.adcode };
      return getWeather(mainKey, adCodeData.adcode).then((weatherRes) => {
        // 校验天气数据
        if (
          !weatherRes ||
          weatherRes.status !== "1" ||
          !weatherRes.lives ||
          weatherRes.lives.length === 0
        ) {
          throw new TypeError("天气数据获取失败");
        }

        const lives = weatherRes.lives[0];
        updateWeather({
          adCode: adCodeData,
          weather: {
            weather: lives.weather,
            temperature: lives.temperature,
            winddirection: lives.winddirection,
            windpower: lives.windpower,
          },
        });
      });
    });

  const fetchOpenMeteo = () =>
    getOpenMeteoWeather().then((res) => {
      const current = res.current_weather;
      if (!current) {
        throw new TypeError("天气数据获取失败");
      }
      // WMO 天气编码映射为中文
      const weatherMap = {
        0: "晴",
        1: "晴间多云",
        2: "多云",
        3: "阴",
        45: "雾",
        48: "雾凇",
        51: "毛毛雨",
        53: "毛毛雨",
        55: "毛毛雨",
        56: "冻毛毛雨",
        57: "冻毛毛雨",
        61: "小雨",
        63: "中雨",
        65: "大雨",
        66: "冻雨",
        67: "冻雨",
        71: "小雪",
        73: "中雪",
        75: "大雪",
        77: "雪粒",
        80: "阵雨",
        81: "阵雨",
        82: "强阵雨",
        85: "阵雪",
        86: "强阵雪",
        95: "雷雨",
        96: "雷雨伴冰雹",
        99: "雷雨伴冰雹",
      };
      updateWeather({
        adCode: { city: res.timezone || "当前位置", adcode: null },
        weather: {
          weather: weatherMap[current.weathercode] || "未知",
          temperature: current.temperature,
          winddirection: current.winddirection,
          windpower: current.windspeed,
        },
      });
    });

  const fetchQWeather = () =>
    getQWeather(mainKey).then((res) => {
      const condition = res.condition;
      const temperature = res.temperature;
      if (!condition || !temperature) {
        throw new TypeError("天气数据获取失败");
      }
      const windDir = res.wind?.direction?.compass || res.wind?.direction?.degree || null;
      updateWeather({
        adCode: { city: res.city || "当前位置", adcode: null },
        weather: {
          weather: condition.text,
          temperature: temperature.value,
          winddirection: windDir,
          windpower: res.wind?.scale || null,
        },
      });
    });

  const fetchOther = () =>
    getOtherWeather().then((res) => {
      const data = res.result;
      updateWeather({
        adCode: { city: data.city.name, adcode: data.city.cityId },
        weather: {
          weather: data.condition.condition,
          temperature: data.condition.temp,
          winddirection: data.condition.windDir,
          windpower: data.condition.windLevel,
        },
      });
    });

  // 平台请求函数映射
  const providerFns = {
    amap: fetchAmap,
    "open-meteo": fetchOpenMeteo,
    qweather: fetchQWeather,
    other: fetchOther,
  };

  // 候选平台池（VITE_WEATHER_PROVIDER + open-meteo + other，去重）
  const pool = getProviderPool();

  // 递归尝试：失败立即轮询下一个；全部黑名单则停止返回错误
  const tryProvider = (index) => {
    // 已遍历完所有候选平台
    if (index >= pool.length) {
      loading.value = false;
      onError("天气数据获取失败");
      return;
    }
    const provider = pool[index];
    // 该平台在冷却中（黑名单），跳过尝试下一个
    if (isCooldown(provider)) {
      tryProvider(index + 1);
      return;
    }
    providerFns[provider]()
      .then(() => {
        // 成功，无需继续
      })
      .catch((err) => {
        console.error(`天气平台 ${provider} 获取失败:` + err);
        // 失败：加入黑名单（冷却 10 分钟），立即尝试下一个
        addToBlacklist(provider);
        tryProvider(index + 1);
      });
  };

  tryProvider(0);
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData(cacheTime);
});
</script>
