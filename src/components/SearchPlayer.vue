<template>
  <div class="search-player-root" v-if="playList[0]">
    <aplayer
      showLrc
      ref="player"
      :music="playList[playIndex]"
      :list="playList"
      :autoplay="autoplay"
      :theme="theme"
      :repeat="repeat"
      :shuffle="shuffle"
      :listMaxHeight="listMaxHeight"
      :listFolded="listFolded"
      :volume="volume"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUp"
      @onSelectSong="onSelectSong"
      @error="loadMusicError"
    />
    <div class="search-more-bar">
      <template v-if="searchServer === 'tencent'">
        <div
          v-if="!hasNoMore"
          class="more-btn"
          :class="{ disabled: moreLoading }"
          @click="loadMore"
        >
          <span>{{
            moreLoading ? "正在加载更多歌曲..." : "加载更多 (已载入 " + playList.length + " 首)"
          }}</span>
        </div>
        <div v-else class="no-more-tip">
          <span>已加载全部结果 (共 {{ playList.length }} 首)</span>
        </div>
      </template>
      <div v-else class="no-more-tip">
        <span>网易云渠道已展示前 {{ playList.length }} 首热门结果</span>
      </div>
    </div>
  </div>
  <div v-else-if="searchLoading" class="loading-placeholder">
    <span>搜索中...</span>
  </div>
  <div v-else-if="hasSearched && !playList[0]" class="empty-placeholder">
    <span>未找到相关音乐</span>
  </div>
</template>

<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList, searchQQMusic } from "@/api";
import { mainStore } from "@/store";
import { decodeHtml, parseLrcText } from "@/utils/lrc.js";
import aplayer from "vue3-aplayer";

const store = mainStore();

const player = ref(null);

const playList = ref([]);
const playIndex = ref(0);
const playListCount = ref(0);

const skipTimeout = ref(null);
const cachedLrcSource = ref("");

const searchLoading = ref(false);
const hasSearched = ref(false);

// 分页与加载更多状态
const currentKeyword = ref("");
const page = ref(1);
const moreLoading = ref(false);
const hasNoMore = ref(false);

let listObserver = null;

const props = defineProps({
  autoplay: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: "#efefef",
  },
  repeat: {
    type: String,
    default: "list",
  },
  shuffle: {
    type: Boolean,
    default: false,
  },
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  searchServer: {
    type: String,
    default: "netease",
  },
  searchKeyword: {
    type: String,
    default: "",
  },
  listFolded: {
    type: Boolean,
    default: false,
  },
  listMaxHeight: {
    type: String,
    default: "340px",
  },
});

// 刷新 VIP 歌曲 DOM 状态与点击拦截
const refreshVipListState = () => {
  nextTick(() => {
    const el = player.value?.$el;
    if (!el) return;
    const ol = el.querySelector(".aplayer-list ol");
    if (!ol) return;

    // 1. 给 VIP 歌曲项打上 vip-song-item class（灰暗样式与 VIP 标签）
    const lis = ol.querySelectorAll("li");
    lis.forEach((li, idx) => {
      const song = playList.value[idx];
      if (song?.isVip) {
        li.classList.add("vip-song-item");
      } else {
        li.classList.remove("vip-song-item");
      }
    });

    // 2. 挂载捕获阶段点击拦截器（阻止 VIP 歌曲被点击播放）
    if (!ol._vipInterceptAttached) {
      ol._vipInterceptAttached = true;
      ol.addEventListener(
        "click",
        (e) => {
          const li = e.target.closest("li");
          if (!li) return;
          const allLis = Array.from(ol.querySelectorAll("li"));
          const clickedIdx = allLis.indexOf(li);
          if (clickedIdx !== -1 && playList.value[clickedIdx]?.isVip) {
            e.stopPropagation();
            e.preventDefault();
            ElMessage({
              message: "该歌曲为 VIP 版权曲目，无法播放，已自动跳过",
              grouping: true,
              icon: h(PlayWrong, {
                theme: "filled",
                fill: "#efefef",
              }),
            });
          }
        },
        true, // 捕获阶段拦截
      );
    }

    // 3. 挂载 MutationObserver 防止 APlayer 内部更新 DOM 时丢失类名
    if (!listObserver) {
      listObserver = new MutationObserver(() => {
        const curLis = ol.querySelectorAll("li");
        curLis.forEach((li, idx) => {
          if (playList.value[idx]?.isVip && !li.classList.contains("vip-song-item")) {
            li.classList.add("vip-song-item");
          }
        });
      });
      listObserver.observe(ol, { childList: true, subtree: false });
    }
  });
};

const performSearch = async (keyword) => {
  if (!keyword || !keyword.trim()) {
    return;
  }

  currentKeyword.value = keyword.trim();
  page.value = 1;
  hasNoMore.value = false;
  searchLoading.value = true;
  hasSearched.value = false;
  playList.value = [];
  playIndex.value = 0;
  playListCount.value = 0;

  try {
    const res = await getPlayerList(props.searchServer, "search", currentKeyword.value, 1, 20);

    hasSearched.value = true;

    if (res && res.length > 0) {
      res.forEach((v) => {
        playList.value.push({
          title: v.name || v.title,
          artist: v.artist || v.author,
          src: v.url || v.src,
          pic: v.pic,
          lrc: v.lrc,
          isVip: Boolean(v.isVip || (typeof v.title === "string" && v.title.includes("[VIP]"))),
        });
      });
      playListCount.value = playList.value.length;

      // 自动选出第一首非 VIP 歌曲
      const firstPlayable = playList.value.findIndex((s) => !s.isVip);
      const initIdx = firstPlayable !== -1 ? firstPlayable : 0;
      playIndex.value = initIdx;

      store.setPlayerList(playList.value);
      store.setPlayerIndex(playIndex.value);
      if (playList.value[initIdx]) {
        const first = playList.value[initIdx];
        store.setPlayerData(first.title, first.artist, first.pic);
        syncFullLrc(first);
      }
      refreshVipListState();
    }
  } catch (err) {
    console.error(err);
    hasSearched.value = true;
    ElMessage({
      message: "搜索失败，请重试",
      grouping: true,
      icon: h(PlayWrong, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  } finally {
    searchLoading.value = false;
  }
};

// 加载更多歌曲（目前针对 QQ 音乐渠道）
const loadMore = async () => {
  if (moreLoading.value || hasNoMore.value || !currentKeyword.value) return;
  moreLoading.value = true;
  try {
    const nextPage = page.value + 1;
    const res = await searchQQMusic(currentKeyword.value, nextPage, 20);
    if (!res || res.length === 0) {
      hasNoMore.value = true;
      ElMessage({
        message: "已加载全部相关歌曲",
        grouping: true,
      });
    } else {
      page.value = nextPage;
      res.forEach((v) => {
        playList.value.push({
          title: v.name || v.title,
          artist: v.artist || v.author,
          src: v.url || v.src,
          pic: v.pic,
          lrc: v.lrc,
          isVip: Boolean(v.isVip || (typeof v.title === "string" && v.title.includes("[VIP]"))),
        });
      });
      playListCount.value = playList.value.length;
      store.setPlayerList(playList.value);
      refreshVipListState();
      ElMessage({
        message: `已为您加载 ${res.length} 首更多歌曲`,
        grouping: true,
      });
    }
  } catch (err) {
    console.error(err);
    ElMessage({
      message: "加载更多失败，请重试",
      grouping: true,
      icon: h(PlayWrong, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  } finally {
    moreLoading.value = false;
  }
};

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
    console.warn("Failed to fetch search lrc:", err);
  }
};

const onPlay = () => {
  const curMusic = player.value?.currentMusic;
  // 若播放器内部自动切到了 VIP 歌曲，立即自动跳下一首非 VIP 歌曲
  if (curMusic?.isVip) {
    changeSong(1);
    return;
  }

  store.setPlayerState(player.value.audio.paused);
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

const onPause = () => {
  store.setPlayerState(player.value.audio.paused);
};

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

const playToggle = () => {
  player.value.toggle();
};

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

// 切换上/下一首，自动寻找并跳过 VIP 歌曲
const changeSong = (type) => {
  const total = playListCount.value;
  if (total <= 0) return;

  const hasPlayable = playList.value.some((s) => !s.isVip);
  if (!hasPlayable) {
    ElMessage({
      message: "列表中歌曲均为 VIP 版权曲目，无法播放",
      grouping: true,
    });
    return;
  }

  const step = type ? 1 : -1;
  let nextIdx = player.value?.playIndex ?? playIndex.value;
  for (let i = 0; i < total; i++) {
    nextIdx = (nextIdx + step + total) % total;
    if (!playList.value[nextIdx]?.isVip) {
      break;
    }
  }

  playIndex.value = nextIdx;
  store.setPlayerIndex(nextIdx);
  nextTick(() => {
    if (player.value) {
      player.value.playIndex = nextIdx;
      player.value.currentMusic = playList.value[nextIdx];
      player.value.play();
    }
  });
};

const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
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
  console.error("播放歌曲: " + player.value.currentMusic?.title + " 出现错误");
};

const selectSong = (index) => {
  if (index >= 0 && index < playListCount.value) {
    if (playList.value[index]?.isVip) {
      ElMessage({
        message: "该歌曲为 VIP 版权曲目，无法播放",
        grouping: true,
        icon: h(PlayWrong, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
      return;
    }
    playIndex.value = index;
    store.setPlayerIndex(index);
    nextTick(() => {
      player.value.play();
    });
  }
};

const getAudioElement = () => {
  return player.value?.audio || null;
};

defineExpose({
  playToggle,
  changeVolume,
  changeSong,
  selectSong,
  performSearch,
  getProgress,
  setProgress,
  getAudioElement,
  playList,
  playIndex,
});

onBeforeUnmount(() => {
  clearTimeout(skipTimeout.value);
  if (listObserver) {
    listObserver.disconnect();
    listObserver = null;
  }
});
</script>

<style lang="scss" scoped>
.search-player-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.search-more-bar {
  margin-top: 8px;
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;

  .more-btn {
    padding: 5px 20px;
    background: rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    color: #efefef;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid rgba(255, 255, 255, 0.25);
    user-select: none;

    &:hover {
      background: rgba(255, 255, 255, 0.28);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .no-more-tip {
    color: rgba(255, 255, 255, 0.55);
    font-size: 12px;
  }
}

.aplayer {
  width: 80%;
  background: transparent;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  max-height: 95%;
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

        &.vip-song-item {
          cursor: not-allowed !important;
          background: rgba(0, 0, 0, 0.06);

          &:hover {
            background: rgba(255, 77, 79, 0.08) !important;
          }

          .aplayer-list-index,
          .aplayer-list-author {
            color: #ffffff55 !important;
          }

          .aplayer-list-title {
            color: #ffffff73 !important;

            &::after {
              content: "VIP";
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              line-height: 1;
              padding: 2px 6px;
              margin-left: 8px;
              border-radius: 4px;
              background: #ff4d4f61 !important;
              color: #ffffff73 !important;
              vertical-align: middle;
              letter-spacing: 0.5px;
            }
          }
        }
      }
    }
  }
}

.loading-placeholder,
.empty-placeholder {
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #ffffff40;
  border-radius: 6px;
  color: #efefef;
  font-size: 16px;
}
</style>
