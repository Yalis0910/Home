<template>
  <!-- 音乐控制面板 -->
  <div
    class="music"
    @mouseenter="volumeShow = true"
    @mouseleave="volumeShow = false"
    v-show="store.musicOpenState"
  >
    <div class="btns">
      <span @click="openMusicList()">音乐列表</span>
      <span @click="store.musicOpenState = false">回到一言</span>
    </div>
    <div class="control">
      <go-start theme="filled" size="30" fill="#efefef" @click="changeMusicIndex(0)" />
      <div class="state" @click="changePlayState">
        <play-one theme="filled" size="50" fill="#efefef" v-show="!store.playerState" />
        <pause theme="filled" size="50" fill="#efefef" v-show="store.playerState" />
      </div>
      <go-end theme="filled" size="30" fill="#efefef" @click="changeMusicIndex(1)" />
    </div>
    <div class="menu">
      <div class="name" v-show="!volumeShow">
        <span>{{
          store.getPlayerData.name
            ? store.getPlayerData.name + " - " + store.getPlayerData.artist
            : "未播放音乐"
        }}</span>
      </div>
      <div class="volume" v-show="volumeShow">
        <div class="icon">
          <volume-mute theme="filled" size="24" fill="#efefef" v-if="volumeNum == 0" />
          <volume-small
            theme="filled"
            size="24"
            fill="#efefef"
            v-else-if="volumeNum > 0 && volumeNum < 0.7"
          />
          <volume-notice theme="filled" size="24" fill="#efefef" v-else />
        </div>
        <el-slider v-model="volumeNum" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
      </div>
    </div>
  </div>
  <!-- 音乐列表弹窗 -->
  <Transition name="fade" mode="out-in">
    <div class="music-list" v-show="musicListShow" @click="musicListShow = false">
      <Transition name="zoom">
        <div class="list" v-show="musicListShow" @click.stop>
          <search
            class="search"
            theme="filled"
            size="28"
            fill="#ffffff60"
            @click="toggleSearchPanel"
          />
          <close-one
            class="close"
            theme="filled"
            size="28"
            fill="#ffffff60"
            @click="musicListShow = false"
          />
          <div class="content-wrapper">
            <div class="player-wrapper" :class="{ hidden: searchShow }">
              <Player
                :songServer="playerData.server"
                :songType="playerData.type"
                :songId="playerData.id"
                :volume="volumeNum"
                :shuffle="false"
                ref="playerRef"
              />
            </div>
            <div class="search-panel" :class="{ hidden: !searchShow }">
              <div class="search-form">
                <el-select v-model="searchServer" class="search-select">
                  <el-option label="网易云" value="netease" />
                  <el-option label="QQ音乐" value="tencent" />
                </el-select>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索音乐..."
                  class="search-input"
                  clearable
                  @keyup.enter="handleSearch"
                />
                <div class="search-btn" @click="handleSearch">
                  <search theme="filled" size="20" fill="#ffffff60" />
                </div>
              </div>
              <div class="search-result-wrapper">
                <SearchPlayer
                  :searchServer="searchServer"
                  :searchKeyword="executedKeyword"
                  :volume="volumeNum"
                  ref="searchPlayerRef"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  CloseOne,
  Search,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import Player from "@/components/Player.vue";
import SearchPlayer from "@/components/SearchPlayer.vue";
import { mainStore } from "@/store";
const store = mainStore();

// 音量条数据
const volumeShow = ref(false);
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);

// 搜索数据
const searchShow = ref(false);
const searchServer = ref(store.playerServer || import.meta.env.VITE_SONG_SERVER || "netease");
const searchKeyword = ref("");
const executedKeyword = ref("");
const searchPlayerRef = ref(null);

// 播放列表数据
const musicListShow = ref(false);
const playerRef = ref(null);
const playerData = reactive({
  server: store.playerServer || import.meta.env.VITE_SONG_SERVER,
  type: store.playerType || import.meta.env.VITE_SONG_TYPE,
  id: store.playerId || import.meta.env.VITE_SONG_ID,
});

// 监听播放器配置变化
watch(
  () => [store.playerServer, store.playerType, store.playerId],
  ([newServer, newType, newId]) => {
    playerData.server = newServer || import.meta.env.VITE_SONG_SERVER;
    playerData.type = newType || import.meta.env.VITE_SONG_TYPE;
    playerData.id = newId || import.meta.env.VITE_SONG_ID;
  },
);

// 开启播放列表
const openMusicList = () => {
  musicListShow.value = true;
};

// 切换搜索面板
const toggleSearchPanel = () => {
  searchShow.value = !searchShow.value;
};

// 搜索音乐
const handleSearch = () => {
  if (!searchKeyword.value || !searchKeyword.value.trim()) {
    ElMessage({
      message: "请输入搜索关键词",
      grouping: true,
    });
    return;
  }
  executedKeyword.value = searchKeyword.value;
  nextTick(() => {
    if (searchPlayerRef.value) {
      searchPlayerRef.value.performSearch(searchKeyword.value);
    }
  });
};

// 切换搜索渠道自动重新搜索
watch(
  () => searchServer.value,
  () => {
    if (searchKeyword.value && searchKeyword.value.trim() && searchShow.value) {
      handleSearch();
    }
  },
);

// 音乐播放暂停
const changePlayState = () => {
  playerRef.value.playToggle();
};

// 音乐上下曲
const changeMusicIndex = (type) => {
  playerRef.value.changeSong(type);
};

onMounted(() => {
  // 空格键事件
  window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
      changePlayState();
    }
  });
  // 挂载方法至 window
  window.$openList = openMusicList;
});

// 监听 playerRef 变化，挂载到 window
watch(
  () => playerRef.value,
  (newRef) => {
    if (newRef && !searchShow.value) {
      window.$playerRef = newRef;
    }
  },
  { immediate: true },
);

// 监听 searchPlayerRef 变化，挂载到 window
watch(
  () => searchPlayerRef.value,
  (newRef) => {
    if (newRef && searchShow.value) {
      window.$playerRef = newRef;
    }
  },
  { immediate: true },
);

// 监听 searchShow 变化，切换 $playerRef 引用
watch(
  () => searchShow.value,
  (isSearch) => {
    if (isSearch && searchPlayerRef.value) {
      window.$playerRef = searchPlayerRef.value;
    } else if (!isSearch && playerRef.value) {
      window.$playerRef = playerRef.value;
    }
  },
);

// 监听音量变化
watch(
  () => volumeNum.value,
  (value) => {
    store.musicVolume = value;
    playerRef.value.changeVolume(store.musicVolume);
  },
);
</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100%;
  background: #00000040;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  animation: fade 0.5s;
  .btns {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    span {
      background: #ffffff26;
      padding: 2px 8px;
      border-radius: 6px;
      margin: 0px 6px;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      &:hover {
        background: #ffffff4d;
      }
    }
  }
  .control {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    .state {
      .i-icon {
        width: 50px;
        height: 50px;
        display: block;
      }
    }
    .i-icon {
      width: 36px;
      height: 36px;
      display: flex;
      border-radius: 6px;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transform: scale(1);
      &:hover {
        background: #ffffff33;
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .menu {
    height: 26px;
    width: 100%;
    line-height: 26px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .name {
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      animation: fade 0.3s;
    }
    .volume {
      width: 100%;
      padding: 0 12px;
      display: flex;
      align-items: center;
      flex-direction: row;
      animation: fade 0.3s;
      .icon {
        margin-right: 12px;
        span {
          width: 24px;
          height: 24px;
          display: block;
        }
      }
      :deep(*) {
        transition: none;
      }
      :deep(.el-slider__button) {
        transition: 0.3s;
      }
      .el-slider {
        margin-right: 12px;
        --el-slider-main-bg-color: #efefef;
        --el-slider-runway-bg-color: #ffffff40;
        --el-slider-button-size: 16px;
      }
    }
  }
}
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  backdrop-filter: blur(20px);
  z-index: 1;
  .list {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: calc(50% - 300px);
    left: calc(50% - 320px);
    width: 640px;
    height: 600px;
    background-color: #ffffff66;
    border-radius: 6px;
    z-index: 999;
    @media (max-width: 720px) {
      left: 5%;
      width: 90%;
    }
    .close,
    .search {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: block;
      z-index: 10;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: scale(0.95);
      }
    }
    .close {
      right: 12px;
    }
    .search {
      left: 12px;
    }
    .content-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      .player-wrapper,
      .search-panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
        visibility: visible;
        transition:
          opacity 0.3s ease,
          visibility 0.3s ease;
        &.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
      }
      .search-panel {
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 60px;
        .search-form {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 80%;
          max-width: 500px;
          margin-bottom: 20px;
          .search-select {
            width: 120px;
            flex-shrink: 0;
            :deep(.el-select__wrapper) {
              height: 40px;
              background: #ffffff26;
              box-shadow: none;
              border-radius: 6px;
              &:hover {
                background: #ffffff4d;
              }
            }
            :deep(.el-select__placeholder) {
              color: #efefef;
            }
            :deep(.el-select__caret) {
              color: #efefef;
            }
            :deep(.el-select__selected-item) {
              color: #efefef;
            }
          }
          .search-input {
            flex: 1;
            :deep(.el-input__wrapper) {
              height: 40px;
              background: #ffffff26;
              box-shadow: none;
              border-radius: 6px;
              &:hover {
                background: #ffffff4d;
              }
            }
            :deep(.el-input__inner) {
              color: #efefef;
              &::placeholder {
                color: #ffffff80;
              }
            }
          }
          .search-btn {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff26;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s;
            &:hover {
              background: #ffffff4d;
            }
            &:active {
              transform: scale(0.95);
            }
          }
        }
        .search-result-wrapper {
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          max-height: 80%;
        }
      }
    }
  }
}


:deep(.el-input__wrapper) {
  /* Element Plus 使用的是 el-input__wrapper */
  color: rgba(0, 0, 0, 0.7);
}

// 弹窗动画
.zoom-enter-active {
  animation: zoom 0.4s ease-in-out;
}
.zoom-leave-active {
  animation: zoom 0.3s ease-in-out reverse;
}
@keyframes zoom {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-600px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
