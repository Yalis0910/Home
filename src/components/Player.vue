<template>
  <aplayer
    showLrc
    ref="player"
    v-if="playList[0]"
    :music="playList[playIndex]"
    :list="playList"
    :autoplay="autoplay"
    :theme="theme"
    :repeat="currentRepeat"
    :shuffle="currentShuffle"
    :listMaxHeight="listMaxHeight"
    :listFolded="listFolded"
    :volume="volume"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @onSelectSong="onSelectSong"
    @error="loadMusicError"
  />
</template>

<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import { decodeHtml, parseLrcText } from "@/utils/lrc.js";
import aplayer from "vue3-aplayer";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
const playList = ref([]);

// 歌曲播放项
const playIndex = ref(0);
const playListCount = ref(0);

const skipTimeout = ref(null);
const cachedLrcSource = ref("");

// 循环与随机播放状态
const currentRepeat = ref("list");
const currentShuffle = ref(false);

const updatePlayMode = (mode) => {
  if (mode === "single") {
    currentRepeat.value = "music";
    currentShuffle.value = false;
  } else if (mode === "random") {
    currentRepeat.value = "list";
    currentShuffle.value = true;
  } else {
    currentRepeat.value = "list";
    currentShuffle.value = false;
  }
};

watch(
  () => store.playerPlayMode,
  (newMode) => {
    updatePlayMode(newMode);
  },
  { immediate: true },
);

// 配置项
const props = defineProps({
  // 音频自动播放
  autoplay: {
    type: Boolean,
    default: false,
  },
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 音频循环播放
  repeat: {
    type: String,
    default: "list", //'list' | 'music' | 'none'
  },
  // 随机播放
  shuffle: {
    type: Boolean,
    default: false,
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // id
  songId: {
    type: String,
    default: "7452421335",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: String,
    default: "420px",
  },
});

// 初始化播放器
onMounted(() => {
  nextTick(() => {
    try {
      getPlayerList(props.songServer, props.songType, props.songId).then((res) => {
        // console.log(res);
        // 生成歌单信息
        playIndex.value = Math.floor(Math.random() * res.length);
        playListCount.value = res.length;
        // 更改播放器加载状态
        store.musicIsOk = true;
        // 生成歌单
        res.forEach((v) => {
          playList.value.push({
            title: v.name || v.title,
            artist: v.artist || v.author,
            src: v.url || v.src,
            pic: v.pic,
            lrc: v.lrc,
          });
        });
        store.setPlayerList(playList.value);
        store.setPlayerIndex(playIndex.value);
        if (playList.value[playIndex.value]) {
          const initialSong = playList.value[playIndex.value];
          store.setPlayerData(initialSong.title, initialSong.artist, initialSong.pic);
          syncFullLrc(initialSong);
        }
      });
    } catch (err) {
      console.error(err);
      store.musicIsOk = false;
      ElMessage({
        message: "播放器加载失败",
        grouping: true,
        icon: h(PlayWrong, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
    }
  });
});

// 异步解析并同步精准歌词
const syncFullLrc = async (music) => {
  if (!music || !music.lrc) return;
  if (cachedLrcSource.value === music.lrc) return;
  cachedLrcSource.value = music.lrc;
  try {
    let lrcRaw = music.lrc;
    if (
      typeof music.lrc === "string" &&
      (music.lrc.startsWith("http://") || music.lrc.startsWith("https://"))
    ) {
      lrcRaw = await fetch(music.lrc).then((res) => res.text());
    }
    const parsed = parseLrcText(lrcRaw);
    if (parsed && parsed.length > 0) {
      store.setPlayerFullLrc(parsed.map((item, idx) => ({ ...item, index: idx })));
    }
  } catch (err) {
    console.warn("Failed to fetch detailed lrc:", err);
  }
};

// 播放
const onPlay = () => {
  // 播放状态
  store.setPlayerState(player.value.audio.paused);
  // 储存播放器信息
  const curMusic = player.value.currentMusic;
  store.setPlayerData(curMusic.title, curMusic.artist, curMusic.pic);
  store.setPlayerIndex(player.value.playIndex ?? playIndex.value);
  syncFullLrc(curMusic);

  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audio.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  if (!player.value || !player.value.audio) return;
  const currentTime = player.value.audio.currentTime;
  const duration = player.value.audio.duration || 0;
  store.setPlayerProgress(currentTime, duration);

  const fullLrc = store.playerFullLrc;
  if (fullLrc && fullLrc.length > 0 && typeof fullLrc[0].time === "number") {
    let activeIdx = 0;
    for (let i = 0; i < fullLrc.length; i++) {
      if (currentTime >= fullLrc[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    store.setPlayerCurrentLrcIndex(activeIdx);
    store.setPlayerLrc(fullLrc[activeIdx]?.text || "");
  } else {
    let playerRef = player.value.$.vnode.el;
    if (playerRef) {
      const currentLrcElement = playerRef.querySelector(".aplayer-lrc-current");
      const previousLrcElement = currentLrcElement?.previousElementSibling;
      const lrcContent =
        currentLrcElement?.innerHTML || previousLrcElement?.innerHTML || "这句没有歌词";
      store.setPlayerLrc(decodeHtml(lrcContent));

      // 获取完整歌词
      const lrcElements = playerRef.querySelectorAll(".aplayer-lrc p");
      if (lrcElements.length > 0) {
        const domLrc = Array.from(lrcElements).map((p, index) => ({
          text: decodeHtml(p.innerHTML),
          index: index,
        }));
        store.setPlayerFullLrc(domLrc);

        const currentIndex = Array.from(lrcElements).findIndex((p) =>
          p.classList.contains("aplayer-lrc-current"),
        );
        if (currentIndex !== -1) {
          store.setPlayerCurrentLrcIndex(currentIndex);
        }
      }
    }
  }
};

// 切换播放暂停事件
const playToggle = () => {
  player.value.toggle();
};

// 切换音量事件
const changeVolume = (value) => {
  player.value.audio.volume = value;
};

// 获取播放进度
const getProgress = () => {
  if (player.value && player.value.audio) {
    return {
      currentTime: player.value.audio.currentTime,
      duration: player.value.audio.duration || 0,
    };
  }
  return { currentTime: 0, duration: 0 };
};

// 设置播放进度
const setProgress = (time) => {
  if (player.value && player.value.audio) {
    player.value.audio.currentTime = time;
  }
};

const onSelectSong = (val) => {
  console.log(val);
};

// 切换上下曲
const changeSong = (type) => {
  playIndex.value = player.value.playIndex;
  playIndex.value += type ? 1 : -1;
  // 判断是否处于最后/第一首
  if (playIndex.value < 0) {
    playIndex.value = playListCount.value - 1;
  } else if (playIndex.value >= playListCount.value) {
    playIndex.value = 0;
  }
  // console.log(playIndex.value, playList.value[playIndex.value]);
  nextTick(() => {
    player.value.play();
  });
};

// 加载音频错误
const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
    // 播放下一首
    skipTimeout.value = setTimeout(() => {
      changeSong(1);
      if (!player.value.audio.paused) {
        onPlay();
      }
    }, 2000);
  } else {
    notice = "播放歌曲出现错误";
  }
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
      duration: 2000,
    }),
  });
  console.error("播放歌曲: " + player.value.currentMusic.title + " 出现错误");
};

// 直接选择歌曲播放
const selectSong = (index) => {
  if (index >= 0 && index < playListCount.value) {
    playIndex.value = index;
    store.setPlayerIndex(index);
    nextTick(() => {
      player.value.play();
    });
  }
};

// 获取底层 HTMLAudioElement 用于 Web Audio 频谱等分析
const getAudioElement = () => {
  return player.value?.audio || null;
};

// 暴露子组件方法
defineExpose({
  playToggle,
  changeVolume,
  changeSong,
  selectSong,
  getProgress,
  setProgress,
  getAudioElement,
  playList,
  playIndex,
});

onBeforeUnmount(() => {
  clearTimeout(skipTimeout.value);
});
</script>

<style lang="scss" scoped>
.aplayer {
  width: 80%;
  background: transparent;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 4px 0 6px 6px;
        height: 100%;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
