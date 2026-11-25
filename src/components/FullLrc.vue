<template>
  <Transition name="full-lrc-fade">
    <div class="full-lrc" v-if="store.fullLrcOpenState" :class="{ 'mobile-view': isMobile }">
      <!-- 高性能超轻量流光背景 (0% CPU 开销) -->
      <div class="ambient-background">
        <div
          class="cover-blur"
          :style="{
            backgroundImage: `url(${store.playerCover || defaultCover})`,
          }"
        ></div>
        <!-- 纯静态色彩径向渐变，零重绘，零抗锯齿压力 -->
        <div class="ambient-glow"></div>
        <div class="dark-overlay"></div>
      </div>

      <!-- 顶部控制与视图切换栏 -->
      <header class="top-header">
        <div class="header-left">
          <div class="quality-tag">
            <span class="dot"></span>
            <span class="text">Hi-Res 沉浸声</span>
          </div>
        </div>

        <!-- 视图切换胶囊 (唱片+歌词 / 频谱律动 / 纯歌词) -->
        <div class="view-switcher" role="tablist">
          <button
            class="switch-btn"
            :class="{ active: currentView === 'split' || (isMobile && currentView === 'disc') }"
            @click="switchView(isMobile ? 'disc' : 'split')"
            :title="isMobile ? '唱片模式' : '双栏模式'"
            role="tab"
            :aria-selected="currentView === 'split' || (isMobile && currentView === 'disc')"
          >
            <span class="btn-icon">
              <cd theme="filled" size="16" fill="currentColor" />
            </span>
            <span class="btn-text">{{ isMobile ? "唱片" : "双栏模式" }}</span>
          </button>
          <button
            class="switch-btn"
            :class="{ active: currentView === 'spectrum' }"
            @click="switchView('spectrum')"
            v-if="!isMobile"
            title="频谱律动"
            role="tab"
            :aria-selected="currentView === 'spectrum'"
          >
            <span class="btn-icon">
              <sound-wave theme="filled" size="16" fill="currentColor" />
            </span>
            <span class="btn-text">频谱律动</span>
          </button>
          <button
            class="switch-btn"
            :class="{ active: currentView === 'lyrics' }"
            @click="switchView('lyrics')"
            :title="isMobile ? '纯享歌词' : '纯享歌词'"
            role="tab"
            :aria-selected="currentView === 'lyrics'"
          >
            <span class="btn-icon">
              <align-text-center theme="outline" size="16" fill="currentColor" />
            </span>
            <span class="btn-text">{{ isMobile ? "歌词" : "纯享歌词" }}</span>
          </button>
        </div>

        <div class="header-right">
          <button
            class="icon-btn"
            :title="isFullscreen ? '退出全屏' : '全屏显示'"
            @click="toggleFullscreen"
          >
            <off-screen v-if="isFullscreen" theme="filled" size="20" fill="currentColor" />
            <full-screen v-else theme="filled" size="20" fill="currentColor" />
          </button>
          <button class="icon-btn close-btn" title="关闭 (Esc)" @click="closeFullLrc">
            <close theme="outline" size="20" fill="currentColor" />
          </button>
        </div>
      </header>

      <!-- 核心主体区 -->
      <main class="main-body" :class="[`view-${currentView}`]">
        <!-- 左侧：黑胶唱片机区域 -->
        <section
          class="vinyl-section"
          v-show="currentView === 'split' || currentView === 'disc' || currentView === 'spectrum'"
        >
          <div class="turntable-container">
            <!-- 唱臂停靠休止座 (Tonearm Rest) -->
            <div class="tonearm-rest">
              <span class="rest-notch"></span>
            </div>

            <!-- 拟真高保真金属弯管唱针臂 (Stylus) -->
            <div class="stylus" :class="{ playing: store.playerState }">
              <svg
                class="stylus-svg"
                viewBox="0 0 120 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- 唱臂基座后置配重块与调校螺母 (Counterweight) -->
                <path
                  d="M40 36 L58 18"
                  stroke="#38383a"
                  stroke-width="4.5"
                  stroke-linecap="round"
                />
                <rect
                  x="-6"
                  y="-10"
                  width="12"
                  height="20"
                  rx="3"
                  fill="url(#counterweight_gradient)"
                  transform="translate(54, 22) rotate(45)"
                  stroke="#1c1c1e"
                  stroke-width="1"
                />
                <line
                  x1="50"
                  y1="18"
                  x2="58"
                  y2="26"
                  stroke="#ffffff"
                  stroke-width="1.2"
                  opacity="0.6"
                />

                <!-- 唱臂金属基座万向轴承 (Gimbal Pivot Assembly) -->
                <circle cx="40" cy="36" r="22" fill="url(#pivot_outer)" />
                <circle cx="40" cy="36" r="16" fill="url(#pivot_inner)" />
                <circle cx="40" cy="36" r="9" fill="#18181a" />
                <circle cx="40" cy="36" r="4" fill="#f2f2f7" />

                <!-- 经典 S 型金属臂管 (S-Shaped Tonearm Wand) -->
                <path
                  d="M40 36 C42 62, 58 78, 54 98 C50 118, 40 134, 38 145"
                  stroke="url(#arm_gradient)"
                  stroke-width="5"
                  stroke-linecap="round"
                />
                <!-- 金属高光反光边 -->
                <path
                  d="M40 36 C42 62, 58 78, 54 98 C50 118, 40 134, 38 145"
                  stroke="#ffffff"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  opacity="0.8"
                />

                <!-- 专业黑胶唱头盒与红宝石针尖 (Cartridge & Headshell) -->
                <g transform="translate(38, 145) rotate(22)">
                  <!-- 唱头外壳 -->
                  <path
                    d="M-7 0 L7 0 L6 26 L-6 26 Z"
                    fill="#1c1c1f"
                    stroke="#48484a"
                    stroke-width="1.2"
                  />
                  <!-- 金属饰面 -->
                  <rect x="-4" y="2" width="8" height="12" rx="1.5" fill="url(#headshell_plate)" />
                  <!-- 提手握柄 -->
                  <path
                    d="M7 6 C13 6, 15 2, 16 -1"
                    stroke="#d1d1d6"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    fill="none"
                  />
                  <!-- 唱针指示与红宝石尖 -->
                  <polygon points="-3,26 3,26 0,31" fill="#ff4d4f" />
                  <circle cx="0" cy="28.5" r="1" fill="#ffffff" />
                </g>

                <defs>
                  <linearGradient
                    id="pivot_outer"
                    x1="18"
                    y1="14"
                    x2="62"
                    y2="58"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#8e8e93" />
                    <stop offset="0.4" stop-color="#48484a" />
                    <stop offset="1" stop-color="#1c1c1e" />
                  </linearGradient>
                  <linearGradient
                    id="pivot_inner"
                    x1="24"
                    y1="20"
                    x2="56"
                    y2="52"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#e5e5ea" />
                    <stop offset="0.5" stop-color="#aeaeb2" />
                    <stop offset="1" stop-color="#636366" />
                  </linearGradient>
                  <linearGradient
                    id="counterweight_gradient"
                    x1="0"
                    y1="0"
                    x2="12"
                    y2="20"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#d1d1d6" />
                    <stop offset="0.5" stop-color="#636366" />
                    <stop offset="1" stop-color="#2c2c2e" />
                  </linearGradient>
                  <linearGradient
                    id="arm_gradient"
                    x1="40"
                    y1="36"
                    x2="38"
                    y2="145"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#e5e5ea" />
                    <stop offset="0.3" stop-color="#aeaeb2" />
                    <stop offset="0.7" stop-color="#f2f2f7" />
                    <stop offset="1" stop-color="#636366" />
                  </linearGradient>
                  <linearGradient
                    id="headshell_plate"
                    x1="-4"
                    y1="2"
                    x2="4"
                    y2="14"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#3a3a3c" />
                    <stop offset="1" stop-color="#1c1c1e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <!-- 实时搓碟寻轨气泡提示 -->
            <Transition name="fade-bounce">
              <div class="scratch-hud" v-show="isScratching">
                <span class="scratch-dir">{{ scratchDelta > 0 ? "▶▶" : "◀◀" }}</span>
                <span class="scratch-time">{{ formatTime(scratchTargetTime) }}</span>
                <span class="scratch-hint">转动黑胶寻轨</span>
              </div>
            </Transition>

            <!-- 黑胶盘面 (支持手势拖拽搓碟 / 惯性旋转) -->
            <div
              class="vinyl-disc"
              ref="vinylDiscRef"
              :class="{ playing: store.playerState, 'is-scratching': isScratching }"
              :style="{ transform: `rotate(${discAngle}deg)` }"
              @pointerdown="handleDiscPointerDown"
              @pointermove="handleDiscPointerMove"
              @pointerup="handleDiscPointerUp"
              @pointercancel="handleDiscPointerUp"
              title="按住拖拽可搓碟寻轨，单击播放/暂停"
            >
              <!-- 拟真黑胶各向异性虹彩光泽 (Anisotropic Specular Luster) -->
              <div class="vinyl-shine"></div>

              <!-- 拟真纯 CSS 唱片同心音轨细纹 -->
              <div class="vinyl-grooves"></div>

              <!-- 中心封面贴纸 (标准LP约45%比例) -->
              <div class="vinyl-center">
                <img
                  :src="store.playerCover || defaultCover"
                  alt="cover"
                  class="center-cover-img"
                  @error="handleCoverError"
                />
                <!-- 复古同心圆金环刻纹 -->
                <div class="center-gold-ring"></div>
                <!-- 3D 凸起金属转轴 -->
                <div class="center-hole">
                  <span class="spindle-point"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 歌曲与艺人信息 -->
          <div class="song-meta">
            <h1 class="song-title" :title="store.playerTitle || '未知歌曲'">
              {{ store.playerTitle || "未知歌曲" }}
            </h1>
            <h2 class="song-artist" :title="store.playerArtist || '未知歌手'">
              {{ store.playerArtist || "未知歌手" }}
            </h2>

            <!-- 动感音浪频率条 (Equalizer Wave, 纯GPU ScaleY变换) -->
            <div class="equalizer-bars" :class="{ active: store.playerState }">
              <span
                v-for="i in 10"
                :key="i"
                class="bar"
                :style="{ animationDelay: `${(i * 0.1) % 0.8}s` }"
              ></span>
            </div>
          </div>
        </section>

        <!-- 右侧：Apple Music 风格动感歌词区域 -->
        <section
          class="lyrics-section"
          v-show="currentView === 'split' || currentView === 'lyrics'"
        >
          <!-- 纯歌词模式或移动端歌词顶部微型标题 -->
          <div class="lyrics-header-mini" v-if="currentView === 'lyrics' || isMobile">
            <div class="mini-title">{{ store.playerTitle || "未知歌曲" }}</div>
            <div class="mini-artist">{{ store.playerArtist || "未知歌手" }}</div>
          </div>

          <div class="lyrics-viewport-wrap">
            <div
              class="lyrics-scroll-container"
              ref="lrcContainer"
              @wheel="handleManualScroll"
              @touchstart="handleTouchStart"
              @touchmove="handleManualScroll"
              @scroll="handleLrcScroll"
            >
              <div class="lyrics-list" ref="lrcList">
                <div
                  v-for="(lrc, index) in store.playerFullLrc"
                  :key="index"
                  class="lyric-line"
                  :class="{
                    active: index === store.playerCurrentLrcIndex,
                    passed: index < store.playerCurrentLrcIndex,
                    'seek-target': isMobile && isManualScrolling && index === scrollTargetIndex,
                  }"
                  :ref="(el) => setLineRef(el, index)"
                  @click="handleLineClick(lrc.time)"
                >
                  <div class="line-content">
                    <div class="line-text-group">
                      <span class="line-text">{{ getBilingual(lrc.text).main }}</span>
                      <span v-if="getBilingual(lrc.text).trans" class="line-trans">
                        {{ getBilingual(lrc.text).trans }}
                      </span>
                    </div>
                    <!-- PC端悬浮点击时间戳 -->
                    <span
                      v-if="!isMobile && lrc.time !== undefined"
                      class="line-seek-tag"
                      title="跳转至此句"
                    >
                      ▶ {{ formatTime(lrc.time) }}
                    </span>
                  </div>
                </div>

                <!-- 空歌词占位 -->
                <div
                  v-if="!store.playerFullLrc || store.playerFullLrc.length === 0"
                  class="lyrics-empty"
                >
                  <sound-wave theme="filled" size="48" fill="#ffffff40" />
                  <span>暂无歌词，请静心享受旋律</span>
                </div>
              </div>
            </div>

            <!-- 移动端滑动选句定位条（网易云风格） -->
            <Transition name="fade-bounce">
              <div
                v-if="isMobile && isManualScrolling && seekTargetLrc"
                class="mobile-seek-guide"
              >
                <span class="guide-time">{{ formatTime(seekTargetLrc.time) }}</span>
                <button
                  class="guide-play-btn"
                  title="从此处播放"
                  @click.stop="seekTo(seekTargetLrc.time, true)"
                >
                  <play-one theme="filled" size="16" fill="currentColor" />
                </button>
              </div>
            </Transition>
          </div>

          <!-- PC端手动滚动后一键复位悬浮球 -->
          <Transition name="fade-bounce">
            <button
              v-if="isManualScrolling && !isMobile"
              class="back-to-current-btn"
              @click="resetToCurrentLrc"
            >
              <down theme="filled" size="14" fill="currentColor" />
              <span>回到当前歌词</span>
            </button>
          </Transition>
        </section>

        <!-- 实时对数音频频谱分析仪 (LIVE SPECTRUM VISUALIZER) -->
        <section class="spectrum-section" v-show="currentView === 'spectrum'">
          <div class="spectrum-canvas-wrapper" ref="spectrumWrap">
            <canvas ref="spectrumCanvas" class="spectrum-canvas"></canvas>
          </div>
          <div class="spectrum-footer">
            <span>40Hz</span>
            <span>120Hz</span>
            <span>250Hz</span>
            <span>500Hz</span>
            <span>1kHz</span>
            <span>2kHz</span>
            <span>4kHz</span>
            <span>8kHz</span>
            <span>16kHz</span>
          </div>
        </section>
      </main>

      <!-- 底部控制控制台 -->
      <footer class="footer-controls">
        <!-- 播放进度条 -->
        <div class="progress-bar-area">
          <span class="time-label">{{ formatTime(localProgress) }}</span>
          <div class="slider-wrapper">
            <el-slider
              v-model="localProgress"
              :max="store.playerDuration || 100"
              :show-tooltip="false"
              @input="handleProgressInput"
              @change="handleProgressChange"
            />
          </div>
          <span class="time-label">{{ formatTime(store.playerDuration) }}</span>
        </div>

        <!-- 功能按钮操作栏 -->
        <div class="control-actions">
          <!-- 左侧：音量调节 -->
          <div class="left-controls">
            <button class="icon-btn volume-btn" @click="toggleMute" title="静音切换">
              <volume-mute theme="filled" size="22" fill="currentColor" v-if="volumeNum == 0" />
              <volume-small
                theme="filled"
                size="22"
                fill="currentColor"
                v-else-if="volumeNum > 0 && volumeNum < 0.7"
              />
              <volume-notice theme="filled" size="22" fill="currentColor" v-else />
            </button>
            <div class="volume-slider-box">
              <el-slider v-model="volumeNum" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
            </div>
            <span class="volume-pct">{{ Math.round(volumeNum * 100) }}%</span>
          </div>

          <!-- 中间：核心播放控制 -->
          <div class="center-controls">
            <!-- 播放模式切换 (列表循环/单曲循环/随机播放) -->
            <button class="icon-btn mode-btn" @click="togglePlayMode" :title="playModeLabel">
              <play-cycle
                v-if="store.playerPlayMode === 'list'"
                theme="filled"
                size="24"
                fill="currentColor"
              />
              <play-once
                v-else-if="store.playerPlayMode === 'single'"
                theme="filled"
                size="24"
                fill="currentColor"
              />
              <shuffle-one v-else theme="filled" size="24" fill="currentColor" />
            </button>

            <!-- 上一首 -->
            <button class="icon-btn nav-btn" title="上一曲 (←)" @click="changeSong(0)">
              <go-start theme="filled" size="32" fill="currentColor" />
            </button>

            <!-- 主播放/暂停键 -->
            <button
              class="main-play-btn"
              :class="{ playing: store.playerState }"
              title="播放/暂停 (Space)"
              @click="togglePlay"
            >
              <play-one
                theme="filled"
                size="36"
                :fill="['#121212', '#121212']"
                v-show="!store.playerState"
              />
              <pause
                theme="filled"
                size="36"
                :fill="['#121212', '#121212']"
                v-show="store.playerState"
              />
            </button>

            <!-- 下一首 -->
            <button class="icon-btn nav-btn" title="下一曲 (→)" @click="changeSong(1)">
              <go-end theme="filled" size="32" fill="currentColor" />
            </button>

            <!-- 播放列表抽屉开关 -->
            <button
              class="icon-btn playlist-toggle-btn"
              :class="{ active: playlistDrawerOpen }"
              title="当前播放队列"
              @click="playlistDrawerOpen = !playlistDrawerOpen"
            >
              <music-list theme="filled" size="24" fill="currentColor" />
              <span class="list-count" v-if="store.playerList && store.playerList.length > 0">
                {{ store.playerList.length }}
              </span>
            </button>
          </div>

          <!-- 右侧：平衡占位（保持中间完全居中） -->
          <div class="right-controls"></div>
        </div>
      </footer>

      <!-- 抽屉式播放队列面板 (Playlist Drawer) -->
      <Transition name="drawer-slide">
        <aside class="playlist-drawer" v-if="playlistDrawerOpen">
          <div class="drawer-header">
            <div class="drawer-title">
              <span class="title-text">播放队列</span>
              <span class="count-tag">{{ store.playerList.length }} 首</span>
            </div>
            <button
              class="icon-btn close-drawer"
              title="关闭队列"
              @click="playlistDrawerOpen = false"
            >
              <close theme="outline" size="18" fill="currentColor" />
            </button>
          </div>

          <!-- 列表过滤搜索 -->
          <div class="drawer-search">
            <search theme="filled" size="16" fill="#ffffff80" class="search-icon" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="在当前列表中快速搜索..."
              class="search-input"
            />
          </div>

          <!-- 歌曲列表滚动区 -->
          <div class="drawer-list">
            <div
              v-for="(song, idx) in filteredPlaylist"
              :key="idx"
              class="playlist-item"
              :class="{ active: isCurrentPlaying(song, idx), 'vip-item': song.isVip }"
              @click="handleSelectSong(song.originalIndex)"
            >
              <div class="song-index">
                <span class="num" v-if="!isCurrentPlaying(song, idx)">
                  {{ String(song.originalIndex + 1).padStart(2, "0") }}
                </span>
                <!-- 播放中动态跳动小音浪 -->
                <div class="playing-indicator" v-else><span></span><span></span><span></span></div>
              </div>
              <div class="song-info">
                <div class="item-name">
                  <span class="title-text">{{ song.title }}</span>
                  <span class="vip-badge" v-if="song.isVip">VIP</span>
                </div>
                <div class="item-artist">{{ song.artist }}</div>
              </div>
            </div>

            <div v-if="filteredPlaylist.length === 0" class="empty-list">未找到匹配的歌曲</div>
          </div>
        </aside>
      </Transition>

      <!-- 抽屉暗色蒙层 (移动端点击直接关闭) -->
      <div
        class="drawer-backdrop"
        v-if="playlistDrawerOpen"
        @click="playlistDrawerOpen = false"
      ></div>
    </div>
  </Transition>
</template>

<script setup>
import {
  Close,
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
  PlayCycle,
  PlayOnce,
  ShuffleOne,
  MusicList,
  SoundWave,
  FullScreen,
  OffScreen,
  Down,
  Search,
  Cd,
  Quote,
  PlayWrong,
  AlignTextCenter,
} from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { formatTime, splitBilingualLrc } from "@/utils/lrc.js";

const store = mainStore();

// 默认封面兜底图
const defaultCover = "/images/background1.jpg";

// 当前视图: 'split' (黑胶+歌词), 'spectrum' (黑胶+频谱), 'lyrics' (纯享歌词), 'disc' (移动端唱片单视)
const currentView = ref("split");
const isFullscreen = ref(false);
const playlistDrawerOpen = ref(false);
const searchKeyword = ref("");

const volumeNum = ref(store.musicVolume || 0.7);
const localProgress = ref(0);
const isDragging = ref(false);
const isManualScrolling = ref(false);
let manualScrollTimer = null;
let previousVolume = 0.7;

const lrcContainer = ref(null);
const lrcList = ref(null);
const currentLrcRef = ref(null);
const lyricLineRefs = ref([]);
const scrollTargetIndex = ref(0);

const setLineRef = (el, index) => {
  if (el) {
    lyricLineRefs.value[index] = el;
  }
  if (index === store.playerCurrentLrcIndex) {
    currentLrcRef.value = el;
  }
};

const getBilingual = (text) => splitBilingualLrc(text);

const seekTargetLrc = computed(() => {
  const list = store.playerFullLrc;
  if (!list || list.length === 0) return null;
  return list[scrollTargetIndex.value] || null;
});

// 黑胶拖拽搓碟与手势物理系统
const vinylDiscRef = ref(null);
const discAngle = ref(0);
const isScratching = ref(false);
const scratchTargetTime = ref(0);
const scratchDelta = ref(0);
let wasPlayingBeforeScratch = false;
let lastPointerAngle = 0;
let lastPointerTime = 0;
let scratchVelocity = 0;
let totalPointerMovedAngle = 0;
let inertiaBoost = 0;

// Web Audio API 实时音频频谱
const spectrumCanvas = ref(null);
const spectrumWrap = ref(null);
const isAudioSourceLive = ref(false);
let audioCtx = null;
let analyserNode = null;
let freqData = null;
const BAR_COUNT = 48;
const barValues = new Float32Array(BAR_COUNT);

// 动画主循环 (驱动黑胶平滑旋转、惯性衰减与频谱 Canvas 渲染)
let animFrameId = null;
let lastAnimTime = performance.now();

// 移动端响应式检测
const isMobile = computed(() => {
  return (store.innerWidth || window.innerWidth) <= 768;
});

// 初始化视图模式
watch(
  () => isMobile.value,
  (val) => {
    if (val && (currentView.value === "split" || currentView.value === "spectrum")) {
      currentView.value = "disc";
    } else if (!val && currentView.value === "disc") {
      currentView.value = "split";
    }
  },
  { immediate: true },
);

// 视图切换
const switchView = (view) => {
  currentView.value = view;
  if (view === "lyrics") {
    nextTick(scrollToActiveLrc);
  } else if (view === "spectrum") {
    nextTick(() => {
      initAudioAnalyser();
    });
  }
};

// 播放模式提示文案
const playModeLabel = computed(() => {
  if (store.playerPlayMode === "single") return "单曲循环 (点击切换)";
  if (store.playerPlayMode === "random") return "随机播放 (点击切换)";
  return "列表循环 (点击切换)";
});

// 切换播放模式
const togglePlayMode = () => {
  const modes = ["list", "single", "random"];
  const currentIdx = modes.indexOf(store.playerPlayMode || "list");
  const nextMode = modes[(currentIdx + 1) % modes.length];
  store.setPlayerPlayMode(nextMode);

  const tips = {
    list: "已切换为：列表循环",
    single: "已切换为：单曲循环",
    random: "已切换为：随机播放",
  };
  ElMessage({
    message: tips[nextMode],
    grouping: true,
    duration: 1500,
  });
};

// 抽屉搜索过滤列表
const filteredPlaylist = computed(() => {
  const list = store.playerList || [];
  const keyword = searchKeyword.value.trim().toLowerCase();
  return list
    .map((item, idx) => ({ ...item, originalIndex: idx }))
    .filter((song) => {
      if (!keyword) return true;
      return (
        (song.title && song.title.toLowerCase().includes(keyword)) ||
        (song.artist && song.artist.toLowerCase().includes(keyword))
      );
    });
});

// 判断某项是否为当前歌曲
const isCurrentPlaying = (song, idx) => {
  return song.originalIndex === store.playerIndex;
};

// 抽屉点击切歌
const handleSelectSong = (originalIndex) => {
  const song = store.playerList?.[originalIndex];
  if (song?.isVip) {
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
  if (window.$playerRef && typeof window.$playerRef.selectSong === "function") {
    window.$playerRef.selectSong(originalIndex);
  } else if (window.$playerRef) {
    const diff = originalIndex - store.playerIndex;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) window.$playerRef.changeSong(1);
    } else if (diff < 0) {
      for (let i = 0; i < -diff; i++) window.$playerRef.changeSong(0);
    }
  }
  if (isMobile.value) {
    playlistDrawerOpen.value = false;
  }
};

// 封面加载失败兜底
const handleCoverError = (e) => {
  e.target.src = defaultCover;
};

// 关闭全屏
const closeFullLrc = () => {
  store.setFullLrcOpenState(false);
  playlistDrawerOpen.value = false;
};

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen()
      .then(() => {
        isFullscreen.value = true;
      })
      .catch(() => {});
  } else {
    document
      .exitFullscreen()
      .then(() => {
        isFullscreen.value = false;
      })
      .catch(() => {});
  }
};

// 播放/暂停
const togglePlay = () => {
  if (window.$playerRef) {
    window.$playerRef.playToggle();
  }
};

// 切歌
const changeSong = (type) => {
  if (window.$playerRef) {
    window.$playerRef.changeSong(type);
  }
};

// 静音切换
const toggleMute = () => {
  if (volumeNum.value > 0) {
    previousVolume = volumeNum.value;
    volumeNum.value = 0;
  } else {
    volumeNum.value = previousVolume || 0.7;
  }
};

// 进度条拖拽与跳转
const handleProgressInput = () => {
  isDragging.value = true;
};

const handleProgressChange = (value) => {
  if (window.$playerRef) {
    window.$playerRef.setProgress(value);
  }
  isDragging.value = false;
};

// 点击歌词行跳转播放进度（仅 PC 端直接点击跳转）
const handleLineClick = (seconds) => {
  if (!isMobile.value) {
    seekTo(seconds);
  }
};

const seekTo = (seconds, autoPlay = false) => {
  if (seconds !== undefined && !isNaN(seconds)) {
    if (window.$playerRef) {
      window.$playerRef.setProgress(seconds);
    }
    localProgress.value = seconds;
    isManualScrolling.value = false;
    clearTimeout(manualScrollTimer);
    if (autoPlay && !store.playerState) {
      togglePlay();
    }
  }
};

// 移动端触摸开始时初始化选句索引
const handleTouchStart = () => {
  if (!isMobile.value) return;
  if (!isManualScrolling.value) {
    scrollTargetIndex.value = store.playerCurrentLrcIndex >= 0 ? store.playerCurrentLrcIndex : 0;
  }
};

// 手动滚动检测与防误触锁定
const scheduleManualScrollReset = () => {
  clearTimeout(manualScrollTimer);
  manualScrollTimer = setTimeout(() => {
    isManualScrolling.value = false;
    nextTick(scrollToActiveLrc);
  }, isMobile.value ? 4000 : 6000);
};

const handleManualScroll = () => {
  isManualScrolling.value = true;
  scheduleManualScrollReset();
};

// 移动端滚动时实时定位最接近视口中心的歌词行
const handleLrcScroll = () => {
  if (!isMobile.value || !isManualScrolling.value || !lrcContainer.value) return;
  const containerRect = lrcContainer.value.getBoundingClientRect();
  const centerY = containerRect.top + containerRect.height / 2;
  let closestIdx = scrollTargetIndex.value;
  let minDist = Infinity;

  const list = store.playerFullLrc || [];
  for (let i = 0; i < list.length; i++) {
    const el = lyricLineRefs.value[i];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const lineCenterY = rect.top + rect.height / 2;
    const dist = Math.abs(lineCenterY - centerY);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  scrollTargetIndex.value = closestIdx;
  scheduleManualScrollReset();
};

// 点击一键回到当前歌词
const resetToCurrentLrc = () => {
  isManualScrolling.value = false;
  scrollToActiveLrc();
};

// 平滑居中滚动当前歌词
const scrollToActiveLrc = () => {
  if (currentLrcRef.value && lrcContainer.value) {
    const container = lrcContainer.value;
    const target = currentLrcRef.value;
    const containerHeight = container.clientHeight;
    const targetTop = target.offsetTop;
    const targetHeight = target.clientHeight;
    const scrollTop = targetTop - containerHeight / 2 + targetHeight / 2;
    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: "smooth",
    });
  }
};

// ================= 黑胶手势搓碟与惯性物理系统 =================
// 计算指针相对于黑胶圆心的角度
const getPointerAngle = (e, el) => {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
};

// 鼠标/触控按下黑胶
const handleDiscPointerDown = (e) => {
  if (e.button && e.button !== 0) return;
  const el = vinylDiscRef.value;
  if (!el) return;

  isScratching.value = true;
  wasPlayingBeforeScratch = store.playerState;
  lastPointerAngle = getPointerAngle(e, el);
  lastPointerTime = performance.now();
  totalPointerMovedAngle = 0;
  scratchVelocity = 0;
  inertiaBoost = 0;
  scratchTargetTime.value = localProgress.value;

  try {
    el.setPointerCapture(e.pointerId);
  } catch (_) {}
};

// 拖拽黑胶搓碟
const handleDiscPointerMove = (e) => {
  if (!isScratching.value) return;
  const el = vinylDiscRef.value;
  if (!el) return;

  const angle = getPointerAngle(e, el);
  let diff = angle - lastPointerAngle;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  lastPointerAngle = angle;
  if (Math.abs(diff) < 0.01) return;

  const now = performance.now();
  const dt = Math.max(0.008, (now - lastPointerTime) / 1000);
  lastPointerTime = now;
  scratchVelocity = scratchVelocity * 0.6 + (diff / dt) * 0.4;

  totalPointerMovedAngle += Math.abs(diff);
  discAngle.value += diff;
  scratchDelta.value = diff;

  // 搓碟手感换算：手转一圈 360° 对应音轨 6 秒
  const secDiff = (diff / 360) * 6;
  const newTime = Math.max(0, Math.min(store.playerDuration || 100, localProgress.value + secDiff));
  localProgress.value = newTime;
  scratchTargetTime.value = newTime;

  if (window.$playerRef) {
    window.$playerRef.setProgress(newTime);
  }
};

// 松手释放黑胶
const handleDiscPointerUp = (e) => {
  if (!isScratching.value) return;
  const el = vinylDiscRef.value;
  isScratching.value = false;
  if (el) {
    try {
      el.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  // 若移动距离极小（< 3度），视为单击切换播放/暂停
  if (totalPointerMovedAngle < 3) {
    togglePlay();
  } else {
    // 注入角速度冲量惯性衰减
    inertiaBoost = Math.max(-1200, Math.min(1200, scratchVelocity * 0.55));
    if (wasPlayingBeforeScratch && !store.playerState) {
      togglePlay();
    }
  }
};

// ================= Web Audio API 实时音频频谱引擎 =================
const initAudioAnalyser = () => {
  try {
    const audioEl = window.$playerRef?.getAudioElement?.();
    if (!audioEl) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    if (!analyserNode) {
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 1024;
      analyserNode.smoothingTimeConstant = 0.76;
      const source = audioCtx.createMediaElementSource(audioEl);
      source.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
      freqData = new Uint8Array(analyserNode.frequencyBinCount);
      isAudioSourceLive.value = true;
    }
  } catch (err) {
    // 跨域或已接入时自动启用仿真智能波形，保证 0 报错不白板
    isAudioSourceLive.value = false;
  }
};

// 绘制对数频段频谱柱
const drawSpectrum = () => {
  const canvas = spectrumCanvas.value;
  const wrap = spectrumWrap.value;
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = wrap.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w <= 0 || h <= 0) return;

  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  ctx.clearRect(0, 0, w, h);

  const baseY = h * 0.78;
  const topPad = 12;
  const span = baseY - topPad;

  // 背景横向标线网格
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let k = 1; k <= 3; k++) {
    const y = Math.round(baseY - (span * k) / 3) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // 基线
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, baseY + 0.5);
  ctx.lineTo(w, baseY + 0.5);
  ctx.stroke();

  const isPlaying = store.playerState;
  let hasRealData = false;

  if (isPlaying && isAudioSourceLive.value && analyserNode && freqData) {
    try {
      analyserNode.getByteFrequencyData(freqData);
      let maxVal = 0;
      for (let i = 0; i < freqData.length; i++) {
        if (freqData[i] > maxVal) maxVal = freqData[i];
      }
      if (maxVal > 0) hasRealData = true;
    } catch (_) {
      hasRealData = false;
    }
  }

  const gap = Math.max(3, (w / BAR_COUNT) * 0.32);
  const bw = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;
  const now = performance.now() / 1000;

  for (let i = 0; i < BAR_COUNT; i++) {
    let target = 0;
    if (isPlaying) {
      if (hasRealData) {
        // 对数分频采样
        const binIdx = Math.min(
          freqData.length - 1,
          Math.floor(Math.pow(i / BAR_COUNT, 1.8) * freqData.length),
        );
        const raw = freqData[binIdx] / 255;
        target = Math.min(1, Math.tanh(raw * 1.5) * 0.96);
      } else {
        // 拟真有机波形响应
        const a = Math.abs(Math.sin(now * 2.1 + i * 0.65));
        const b = Math.abs(Math.sin(now * 1.1 + i * 0.22));
        const c = Math.abs(Math.sin(now * 3.4 + i * 1.2));
        const wave = 0.08 + (a * 0.55 + b * 0.3 + c * 0.15) * 0.85;
        const tilt = 1 - 0.35 * Math.pow(i / BAR_COUNT, 0.7);
        target = Math.min(1, wave * tilt);
      }
    }

    // 软衰减阻尼动力学
    const current = barValues[i];
    barValues[i] = current + (target - current) * (target > current ? 0.55 : 0.14);
    if (barValues[i] < 0.005) barValues[i] = 0;

    const bh = Math.max(2, barValues[i] * span);
    const x = i * (bw + gap);
    const y = baseY - bh;

    // 柔美暖光电平柱
    const grad = ctx.createLinearGradient(0, y, 0, baseY);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.5, "rgba(255, 215, 185, 0.85)");
    grad.addColorStop(1, "rgba(255, 140, 150, 0.6)");
    ctx.fillStyle = grad;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, bw, bh, [Math.min(bw / 2, 3), Math.min(bw / 2, 3), 0, 0]);
    } else {
      ctx.rect(x, y, bw, bh);
    }
    ctx.fill();

    // 倒影微光
    ctx.fillStyle = "rgba(255, 215, 185, 0.15)";
    ctx.fillRect(x, baseY + 2, bw, Math.min(bh * 0.25, h - baseY - 4));
  }
};

// ================= 统一动画物理循环 (GPU 零开销矩阵) =================
const tickPhysics = (timestamp) => {
  const dt = Math.max(0.001, Math.min(0.05, (timestamp - lastAnimTime) / 1000));
  lastAnimTime = timestamp;

  if (!isScratching.value) {
    if (store.playerState) {
      // 22 秒旋转一圈，角度单调累加避免 360 度倒转回弹
      discAngle.value += (360 / 22) * dt;
    }
    if (inertiaBoost !== 0) {
      discAngle.value += inertiaBoost * dt;
      inertiaBoost *= Math.pow(0.015, dt);
      if (Math.abs(inertiaBoost) < 2) {
        inertiaBoost = 0;
      }
    }
  }

  if (currentView.value === "spectrum" && store.fullLrcOpenState) {
    drawSpectrum();
  }

  if (store.fullLrcOpenState) {
    animFrameId = requestAnimationFrame(tickPhysics);
  }
};

// 键盘快捷键监听
const handleKeydown = (e) => {
  if (!store.fullLrcOpenState) return;

  // 避免在搜索输入框中触发快捷键
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    const target = Math.max(0, localProgress.value - 5);
    handleProgressChange(target);
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    const target = Math.min(store.playerDuration || 100, localProgress.value + 5);
    handleProgressChange(target);
  } else if (e.code === "ArrowUp") {
    e.preventDefault();
    volumeNum.value = Math.min(1, Number((volumeNum.value + 0.05).toFixed(2)));
  } else if (e.code === "ArrowDown") {
    e.preventDefault();
    volumeNum.value = Math.max(0, Number((volumeNum.value - 0.05).toFixed(2)));
  } else if (e.code === "Escape") {
    closeFullLrc();
  }
};

// 监听与生命周期
watch(
  () => volumeNum.value,
  (value) => {
    store.musicVolume = value;
    if (window.$playerRef) {
      window.$playerRef.changeVolume(value);
    }
  },
);

watch(
  () => store.playerCurrentTime,
  (newTime) => {
    if (!isDragging.value) {
      localProgress.value = newTime;
    }
  },
);

watch(
  () => store.playerCurrentLrcIndex,
  () => {
    if (!isManualScrolling.value) {
      nextTick(scrollToActiveLrc);
    }
  },
);

watch(
  () => store.fullLrcOpenState,
  (isOpen) => {
    if (isOpen) {
      localProgress.value = store.playerCurrentTime;
      volumeNum.value = store.musicVolume || 0.7;
      window.addEventListener("keydown", handleKeydown);

      // 启动 60/120 FPS 物理循环与频谱引擎
      lastAnimTime = performance.now();
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(tickPhysics);
      }
      initAudioAnalyser();

      nextTick(() => {
        scrollToActiveLrc();
      });
    } else {
      window.removeEventListener("keydown", handleKeydown);
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      isScratching.value = false;
    }
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  clearTimeout(manualScrollTimer);
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (_) {}
  }
});
</script>

<style lang="scss" scoped>
.full-lrc {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  color: #efefef;
  font-family:
    -apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS_Regular", "Segoe UI", sans-serif;

  /* 高性能极简流光背景 (0% CPU 占用) */
  .ambient-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
    background-color: #0c0c0d;

    /* 纯静态模糊封面 (浏览器单次离屏缓存，零持续GPU开销) */
    .cover-blur {
      position: absolute;
      inset: -30px;
      background-size: cover;
      background-position: center;
      filter: blur(28px) brightness(0.38) saturate(180%);
      transform: scale(1.08);
      opacity: 0.85;
      transition: opacity 0.4s ease;
    }

    /* 纯静态 CSS 径向渐变光晕网格 (零模糊滤镜运算，零重绘，零CPU占用) */
    .ambient-glow {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 18% 22%, rgba(255, 110, 150, 0.22) 0%, transparent 48%),
        radial-gradient(circle at 82% 78%, rgba(64, 150, 255, 0.22) 0%, transparent 48%),
        radial-gradient(circle at 50% 50%, rgba(180, 120, 255, 0.14) 0%, transparent 55%);
      pointer-events: none;
    }

    /* 纯暗色径向渐变遮罩 (彻底移除了消耗CPU的 backdrop-filter 全屏重采样) */
    .dark-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        ellipse at center,
        rgba(0, 0, 0, 0.45) 0%,
        rgba(0, 0, 0, 0.86) 100%
      );
    }
  }

  /* 顶部工具栏 */
  .top-header {
    position: relative;
    z-index: 10;
    height: 70px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .quality-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.5px;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #52c41a;
          box-shadow: 0 0 6px #52c41a;
        }
      }
    }

    .view-switcher {
      display: inline-flex;
      align-items: center;
      background: rgba(18, 18, 22, 0.55);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      padding: 3px;
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow:
        0 4px 18px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.15);
      gap: 3px;

      .switch-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        min-width: 32px;
        padding: 0 8px;
        border: none;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;

        /* iOS 水滴/果冻流体弹性过渡曲线 (Spring Fluid Timing) */
        transition:
          background 0.35s cubic-bezier(0.25, 1, 0.5, 1),
          color 0.25s ease,
          padding 0.42s cubic-bezier(0.34, 1.45, 0.64, 1),
          transform 0.2s cubic-bezier(0.34, 1.45, 0.64, 1),
          box-shadow 0.35s ease;

        .btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.35s cubic-bezier(0.34, 1.45, 0.64, 1);
        }

        .btn-text {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          max-width: 0;
          opacity: 0;
          transform: scale(0.85) translateX(-4px);
          transform-origin: left center;
          transition:
            max-width 0.42s cubic-bezier(0.34, 1.4, 0.64, 1),
            opacity 0.28s ease,
            transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1),
            margin 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
          margin-left: 0;
          pointer-events: none;
        }

        &:hover:not(.active) {
          color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.08);

          .btn-icon {
            transform: scale(1.1);
          }
        }

        &:active {
          transform: scale(0.92);
        }

        /* 选中态：类 iOS 水滴充盈展开 */
        &.active {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.24) 0%,
            rgba(255, 255, 255, 0.14) 100%
          );
          color: #ffffff;
          padding: 0 14px 0 11px;
          box-shadow:
            0 2px 10px rgba(0, 0, 0, 0.25),
            inset 0 1px 1.5px rgba(255, 255, 255, 0.4),
            inset 0 -1px 1px rgba(0, 0, 0, 0.15);

          .btn-icon {
            transform: scale(1.05);
          }

          .btn-text {
            max-width: 80px;
            opacity: 1;
            transform: scale(1) translateX(0);
            margin-left: 6px;
            pointer-events: auto;
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  /* 通用图标按钮 */
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    border-radius: 50%;
    padding: 8px;
    transition: all 0.2s ease;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
      transform: scale(1.08);
    }

    &:active {
      transform: scale(0.92);
    }

    &.close-btn {
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
      }
    }
  }

  /* 主体展示区 */
  .main-body {
    position: relative;
    z-index: 5;
    flex: 1;
    width: 100%;
    max-width: 1360px;
    margin: 0 auto;
    padding: 10px 40px 20px;
    display: flex;
    gap: 60px;
    overflow: hidden;

    &.view-lyrics {
      justify-content: center;
      .lyrics-section {
        max-width: 820px;
      }
    }

    /* 左侧黑胶唱机区 */
    .vinyl-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 0;

      .turntable-container {
        position: relative;
        width: 340px;
        height: 340px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;

        // 唱机底座金属托盘
        &::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(30, 30, 35, 0.45) 0%,
            rgba(15, 15, 18, 0.8) 100%
          );
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(255, 255, 255, 0.06);
          z-index: 1;
        }

        // 唱臂停靠休止座
        .tonearm-rest {
          position: absolute;
          top: 62px;
          right: 20px;
          width: 12px;
          height: 26px;
          background: #28282b;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
          z-index: 5;
          pointer-events: none;

          .rest-notch {
            position: absolute;
            top: 5px;
            left: 2px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            border: 2px solid #8e8e93;
            border-bottom-color: transparent;
          }
        }

        /* 唱针臂 */
        .stylus {
          position: absolute;
          top: -26px;
          right: 6px;
          width: 110px;
          height: 165px;
          z-index: 15;
          transform-origin: 37px 33px;
          transform: rotate(24deg);
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.25, 1);
          pointer-events: none;

          &.playing {
            transform: rotate(0deg);
          }

          .stylus-svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.7));
          }
        }

        // 实时搓碟寻轨气泡提示
        .scratch-hud {
          position: absolute;
          top: -44px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(22, 22, 26, 0.94);
          border: 1px solid rgba(255, 77, 79, 0.45);
          border-radius: 20px;
          box-shadow:
            0 6px 20px rgba(0, 0, 0, 0.6),
            0 0 14px rgba(255, 77, 79, 0.35);
          z-index: 30;
          pointer-events: none;

          .scratch-dir {
            font-size: 11px;
            font-weight: 700;
            color: #ff7875;
            animation: pulse 0.5s infinite alternate;
          }
          .scratch-time {
            font-family: monospace;
            font-size: 13.5px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
          }
          .scratch-hint {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.55);
          }
        }

        /* 黑胶唱片 (JS 物理手势与惯性动力学驱动，0% 重绘开销) */
        .vinyl-disc {
          position: relative;
          z-index: 2;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle at center, #242427 0%, #151518 42%, #09090b 100%);
          box-shadow:
            0 16px 45px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 0 0 2px rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          touch-action: none;
          will-change: transform;
          user-select: none;
          transition: box-shadow 0.25s ease;

          &:hover {
            box-shadow:
              0 18px 50px rgba(0, 0, 0, 0.85),
              0 0 0 1px rgba(255, 255, 255, 0.12),
              inset 0 0 0 2px rgba(0, 0, 0, 0.9);
          }

          &:active,
          &.is-scratching {
            cursor: grabbing;
            box-shadow:
              0 18px 50px rgba(0, 0, 0, 0.85),
              0 0 0 2px rgba(255, 77, 79, 0.5),
              inset 0 0 0 2px rgba(0, 0, 0, 0.9),
              0 0 24px rgba(255, 77, 79, 0.25);
          }

          /* 拟真黑胶各向异性虹彩光泽 (随盘面旋转) */
          .vinyl-shine {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: conic-gradient(
              from 0deg,
              rgba(255, 255, 255, 0.07) 0deg,
              transparent 45deg,
              rgba(255, 255, 255, 0.12) 90deg,
              transparent 135deg,
              rgba(255, 255, 255, 0.07) 180deg,
              transparent 225deg,
              rgba(255, 255, 255, 0.12) 270deg,
              transparent 315deg,
              rgba(255, 255, 255, 0.07) 360deg
            );
            pointer-events: none;
            mix-blend-mode: screen;
          }

          /* 纯 CSS 阴影生成的同心细音轨 */
          .vinyl-grooves {
            position: absolute;
            inset: 10px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.04);
            box-shadow:
              inset 0 0 0 8px #141416,
              inset 0 0 0 9px rgba(255, 255, 255, 0.035),
              inset 0 0 0 22px #101012,
              inset 0 0 0 23px rgba(255, 255, 255, 0.03),
              inset 0 0 0 38px #141416,
              inset 0 0 0 39px rgba(255, 255, 255, 0.035),
              inset 0 0 0 54px #101012,
              inset 0 0 0 55px rgba(255, 255, 255, 0.03),
              inset 0 0 0 70px #141416,
              inset 0 0 0 71px rgba(255, 255, 255, 0.035);
            pointer-events: none;
          }

          /* 中心封面区域 (标准 LP 唱片约 45% 比例) */
          .vinyl-center {
            position: relative;
            width: 144px;
            height: 144px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid #161618;
            box-shadow:
              0 0 16px rgba(0, 0, 0, 0.85),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1a1a1c;

            .center-cover-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              pointer-events: none;
            }

            .center-gold-ring {
              position: absolute;
              inset: 12px;
              border-radius: 50%;
              border: 1px dashed rgba(255, 215, 185, 0.35);
              pointer-events: none;
            }

            .center-hole {
              position: absolute;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: radial-gradient(circle at 35% 35%, #7a706b 0%, #201b1a 65%, #050505 100%);
              border: 2px solid rgba(255, 235, 215, 0.7);
              box-shadow:
                0 0 8px rgba(0, 0, 0, 0.9),
                0 1px 3px rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;

              .spindle-point {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #ffffff;
                opacity: 0.85;
                box-shadow: 0 0 4px #fff;
              }
            }
          }
        }
      }

      /* 歌曲元数据 */
      .song-meta {
        text-align: center;
        max-width: 90%;

        .song-title {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .song-artist {
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        /* 动感音浪柱 (仅做 GPU scaleY 变换，无高度重绘) */
        .equalizer-bars {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          height: 22px;

          .bar {
            width: 3px;
            height: 20px;
            background: rgba(255, 255, 255, 0.65);
            border-radius: 2px;
            transform: scaleY(0.18);
            transform-origin: bottom;
            will-change: transform;
          }

          &.active .bar {
            animation: bar-dance 1.2s ease-in-out infinite alternate;
          }
        }
      }
    }

    /* 右侧动感歌词区 */
    .lyrics-section {
      flex: 1.2;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .lyrics-header-mini {
        padding: 10px 0 20px;
        text-align: center;
        .mini-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }
        .mini-artist {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 4px;
        }
      }

      .lyrics-viewport-wrap {
        flex: 1;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .mobile-seek-guide {
        position: absolute;
        top: 50%;
        left: 12px;
        right: 12px;
        transform: translateY(-50%);
        min-height: 46px;
        padding: 8px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
        z-index: 5;

        .guide-time {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.78);
          font-variant-numeric: tabular-nums;
        }

        .guide-play-btn {
          pointer-events: auto;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;

          &:active {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.28);
          }
        }
      }

      .lyrics-scroll-container {
        flex: 1;
        width: 100%;
        overflow-y: auto;
        padding: 40px 24px;
        contain: content;
        // 纯 CSS 文本蒙版渐变，彻底移除导致背景分层黑块的实体渐变图层
        mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(0, 0, 0, 1) 12%,
          rgba(0, 0, 0, 1) 88%,
          transparent 100%
        );
        -webkit-mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          rgba(0, 0, 0, 1) 12%,
          rgba(0, 0, 0, 1) 88%,
          transparent 100%
        );

        &::-webkit-scrollbar {
          display: none;
        }

        .lyrics-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-height: 100%;
          padding: 120px 0;

          .lyric-line {
            width: 100%;
            padding: 12px 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.25s ease;

            .line-content {
              display: inline-flex;
              align-items: center;
              gap: 16px;
            }

            .line-text-group {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }

            .line-text {
              font-size: 20px;
              line-height: 1.5;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.4);
              word-break: break-word;
              transition: all 0.25s ease;
            }

            .line-trans {
              font-size: 14px;
              line-height: 1.45;
              font-weight: 400;
              color: rgba(255, 255, 255, 0.35);
              word-break: break-word;
              transition: all 0.25s ease;
            }

            .line-seek-tag {
              display: none;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.85);
              background: rgba(255, 255, 255, 0.18);
              padding: 2px 10px;
              border-radius: 12px;
              transition: all 0.2s;
            }

            &:hover {
              background: rgba(255, 255, 255, 0.08);

              .line-text {
                color: rgba(255, 255, 255, 0.85);
              }

              .line-seek-tag {
                display: inline-block;
              }
            }

            &.active {
              background: transparent;

              .line-content {
                position: relative;
                &::before {
                  content: "";
                  position: absolute;
                  left: -18px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #ff4d4f;
                  box-shadow: 0 0 10px 2px rgba(255, 77, 79, 0.9);
                }
              }

              .line-text {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                text-shadow:
                  0 0 16px rgba(255, 255, 255, 0.45),
                  0 2px 6px rgba(0, 0, 0, 0.4);
                transform: scale(1.04);
                transform-origin: left center;
              }

              .line-trans {
                font-size: 16px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.72);
                margin-top: 2px;
              }
            }

            &.passed {
              .line-text {
                color: rgba(255, 255, 255, 0.3);
              }
              .line-trans {
                color: rgba(255, 255, 255, 0.25);
              }
            }

            &.seek-target {
              .line-text {
                color: rgba(255, 255, 255, 0.95);
              }
              .line-trans {
                color: rgba(255, 255, 255, 0.65);
              }
            }
          }

          .lyrics-empty {
            margin: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 16px;
          }
        }
      }

      /* 回到当前歌词复位胶囊 */
      .back-to-current-btn {
        position: absolute;
        bottom: 24px;
        right: 32px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        background: rgba(35, 35, 38, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 20px;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        transition: all 0.2s ease;
        z-index: 20;

        &:hover {
          background: rgba(50, 50, 55, 0.95);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    /* 实时对数音频频谱分析仪 (LIVE SPECTRUM VISUALIZER) */
    .spectrum-section {
      flex: 1.2;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px 20px 20px;
      overflow: hidden;

      .spectrum-canvas-wrapper {
        flex: 1;
        width: 100%;
        min-height: 180px;
        position: relative;
        margin: 0 0 10px;

        .spectrum-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      .spectrum-footer {
        display: flex;
        justify-content: space-between;
        font-family: monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.35);
        padding: 6px 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    }
  }

  /* 底部控制中枢 */
  .footer-controls {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 10px 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;

    .progress-bar-area {
      display: flex;
      align-items: center;
      gap: 16px;

      .time-label {
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        min-width: 44px;
        font-variant-numeric: tabular-nums;
      }

      .slider-wrapper {
        flex: 1;

        :deep(.el-slider) {
          --el-slider-main-bg-color: #ffffff;
          --el-slider-runway-bg-color: rgba(255, 255, 255, 0.25);
          --el-slider-stop-bg-color: #ffffff;
          --el-slider-button-size: 14px;

          .el-slider__button {
            border: 2px solid #fff;
            background-color: #1f1f1f;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            transition: transform 0.2s;
            &:hover {
              transform: scale(1.3);
            }
          }
        }
      }
    }

    .control-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 220px;

        .volume-slider-box {
          width: 90px;

          :deep(.el-slider) {
            --el-slider-main-bg-color: #ffffff;
            --el-slider-runway-bg-color: rgba(255, 255, 255, 0.25);
            --el-slider-button-size: 12px;
          }
        }

        .volume-pct {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          min-width: 32px;
          font-variant-numeric: tabular-nums;
        }
      }

      .center-controls {
        display: flex;
        align-items: center;
        gap: 22px;

        .nav-btn {
          padding: 8px;
          &:hover {
            transform: scale(1.15);
          }
        }

        .main-play-btn {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          border: none;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.35);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

          // 核心修复：强制穿透全局 `*, a, p { color: #fff }` 样式，保证播放/暂停图标绝对为深黑
          :deep(.i-icon),
          :deep(svg) {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #121212 !important;
            fill: #121212 !important;

            path {
              fill: #121212 !important;
              stroke: #121212 !important;
            }
          }

          :deep(.i-icon-play-one) {
            margin-left: 3px;
          }

          &:hover {
            transform: scale(1.08);
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.5);
          }

          &:active {
            transform: scale(0.94);
          }
        }

        .mode-btn {
          padding: 8px;
        }

        .playlist-toggle-btn {
          position: relative;
          padding: 8px;

          .list-count {
            position: absolute;
            top: 2px;
            right: 0px;
            background: rgba(255, 255, 255, 0.9);
            color: #111;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 10px;
          }

          &.active {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
          }
        }
      }

      .right-controls {
        width: 220px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  /* 抽屉式播放队列面板 */
  .playlist-drawer {
    position: absolute;
    top: 0;
    right: 0;
    width: 380px;
    height: 100%;
    z-index: 100;
    background: rgba(24, 24, 26, 0.97);
    border-left: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    padding: 24px 20px;

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .drawer-title {
        display: flex;
        align-items: center;
        gap: 10px;

        .title-text {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .count-tag {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
        }
      }

      .close-drawer {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;

        &:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.35);
          transform: scale(1.08);
        }
      }
    }

    .drawer-search {
      position: relative;
      margin-bottom: 16px;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 12px;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 8px 12px 8px 36px;
        color: #fff;
        font-size: 13px;
        outline: none;
        transition: border 0.2s;

        &:focus {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }

    .drawer-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }

      .playlist-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          background: rgba(255, 255, 255, 0.18);

          .item-name {
            color: #ffffff;
            font-weight: 600;
          }
        }

        &.vip-item {
          cursor: not-allowed;

          &:hover {
            background: rgba(255, 77, 79, 0.08);
          }

          .song-index {
            color: #ffffff35 !important;
          }

          .song-info {
            .item-name {
              color: #ffffff73 !important;

              .title-text {
                color: #ffffff73 !important;
              }
            }
            .item-artist {
              color: #ffffff50 !important;
            }
          }
        }

        .song-index {
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          font-variant-numeric: tabular-nums;

          .playing-indicator {
            display: flex;
            align-items: flex-end;
            gap: 2px;
            height: 14px;

            span {
              width: 2px;
              height: 100%;
              background: #fff;
              border-radius: 1px;
              animation: wave-bar 0.8s ease-in-out infinite alternate;

              &:nth-child(1) {
                animation-delay: 0.1s;
              }
              &:nth-child(2) {
                animation-delay: 0.3s;
              }
              &:nth-child(3) {
                animation-delay: 0.2s;
              }
            }
          }
        }

        .song-info {
          flex: 1;
          overflow: hidden;

          .item-name {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            white-space: nowrap;
            overflow: hidden;

            .title-text {
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .vip-badge {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              line-height: 1;
              padding: 2px 6px;
              margin-left: 8px;
              border-radius: 4px;
              background: #ff4d4f61 !important;
              color: #ffffff73 !important;
              flex-shrink: 0;
              letter-spacing: 0.5px;
            }
          }

          .item-artist {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .empty-list {
        text-align: center;
        padding: 40px 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  .drawer-backdrop {
    position: absolute;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.4);
  }
}

/* 动效 Keyframes (仅GPU Matrix变换，零回流重绘) */
@keyframes vinyl-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  from {
    opacity: 0.55;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes bar-dance {
  0% {
    transform: scaleY(0.18);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes wave-bar {
  0% {
    height: 3px;
  }
  100% {
    height: 14px;
  }
}

/* 过渡动画 */
.full-lrc-fade-enter-active,
.full-lrc-fade-leave-active {
  transition: opacity 0.3s ease;
}
.full-lrc-fade-enter-from,
.full-lrc-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

.fade-bounce-enter-active,
.fade-bounce-leave-active {
  transition: all 0.25s ease;
}
.fade-bounce-enter-from,
.fade-bounce-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* 移动端媒体查询与适配 */
@media (max-width: 768px) {
  .full-lrc {
    .top-header {
      height: 56px;
      padding: 0 16px;

      .header-left {
        .quality-tag {
          display: none;
        }
      }

      .view-switcher {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .main-body {
      padding: 10px 16px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex: 1;
      width: 100%;
      height: 100%;

      .vinyl-section {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: auto 0;

        .turntable-container {
          width: 270px;
          height: 270px;
          margin: 0 auto 24px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          .scratch-hud {
            top: -38px;
            padding: 4px 10px;
            .scratch-time {
              font-size: 12px;
            }
          }

          .tonearm-rest {
            top: 48px;
            right: 16px;
            width: 10px;
            height: 22px;
          }

          .stylus {
            top: -20px;
            right: 6px;
            width: 85px;
            height: 128px;
            transform-origin: 28px 25px;
            transform: rotate(24deg);

            &.playing {
              transform: rotate(0deg);
            }
          }

          .vinyl-disc {
            width: 250px;
            height: 250px;

            .vinyl-center {
              width: 112px;
              height: 112px;

              .center-hole {
                width: 12px;
                height: 12px;
              }
            }
          }
        }

        .song-meta {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;

          .song-title {
            width: 100%;
            font-size: 20px;
            line-height: 1.35;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            word-break: break-word;
          }
          .song-artist {
            font-size: 14px;
            margin-bottom: 12px;
          }
        }
      }

      .lyrics-section {
        .lyrics-header-mini {
          padding: 10px 16px 16px;
          .mini-title {
            font-size: 20px;
            line-height: 1.35;
            word-break: break-word;
          }
        }

        .lyrics-scroll-container {
          padding: 20px 8px;

          .lyrics-list {
            align-items: center;
            text-align: center;
            padding: 22vh 0;

            .lyric-line {
              text-align: center;
              padding: 12px 52px;

              &:hover {
                background: transparent;
              }

              .line-content {
                justify-content: center;
              }
              .line-text {
                font-size: 16px;
              }
              .line-trans {
                font-size: 13px;
              }
              .line-seek-tag {
                display: none !important;
              }
              &.active {
                .line-text {
                  font-size: 18px;
                  transform: scale(1.03);
                  transform-origin: center center;
                }
                .line-trans {
                  font-size: 15px;
                }
              }
            }
          }
        }

        .back-to-current-btn {
          right: 20px;
          bottom: 16px;
        }
      }
    }

    .footer-controls {
      padding: 8px 16px 20px;

      .control-actions {
        .left-controls {
          width: auto;
          .volume-slider-box,
          .volume-pct {
            display: none;
          }
        }

        .center-controls {
          gap: 16px;

          .main-play-btn {
            width: 56px;
            height: 56px;
          }

          .nav-btn :deep(span) {
            font-size: 26px !important;
          }
        }

        .right-controls {
          width: auto;
        }
      }
    }

    /* 移动端播放列表抽屉变为上滑底部卡片 */
    .playlist-drawer {
      top: auto;
      bottom: 0;
      width: 100%;
      height: 65vh;
      border-left: none;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px 20px 0 0;
    }

    .drawer-slide-enter-from,
    .drawer-slide-leave-to {
      transform: translateY(100%);
    }
  }
}
</style>
