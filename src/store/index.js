import { defineStore } from "pinia";

// 从环境变量获取播放器默认配置
const defaultPlayerApi = import.meta.env.VITE_SONG_API || "";
const defaultPlayerServer = import.meta.env.VITE_SONG_SERVER || "netease";
const defaultPlayerType = import.meta.env.VITE_SONG_TYPE || "playlist";
const defaultPlayerId = import.meta.env.VITE_SONG_ID || "";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      imgLoadStatus: false, // 壁纸加载状态
      innerWidth: null, // 当前窗口宽度
      coverType: "0", // 壁纸种类
      siteStartShow: false, // 建站日期显示
      musicClick: false, // 音乐链接是否跳转
      musicIsOk: false, // 音乐是否加载完成
      musicVolume: 0, // 音乐音量;
      musicOpenState: false, // 音乐面板开启状态
      backgroundShow: false, // 壁纸展示状态
      boxOpenState: false, // 盒子开启状态
      mobileOpenState: false, // 移动端开启状态
      mobileFuncState: false, // 移动端功能区开启状态
      setOpenState: false, // 设置页面开启状态
      playerState: false, // 当前播放状态
      playerTitle: null, // 当前播放歌曲名
      playerArtist: null, // 当前播放歌手名
      playerCover: null, // 当前播放歌曲封面
      playerLrc: "歌词加载中", // 当前播放歌词
      playerLrcShow: true, // 是否显示底栏歌词
      footerBlur: true, // 底栏模糊
      fullLrcOpenState: false, // 全屏歌词开启状态
      playerCurrentTime: 0, // 当前播放时间
      playerDuration: 0, // 歌曲总时长
      playerFullLrc: [], // 完整歌词数组
      playerCurrentLrcIndex: 0, // 当前歌词索引
      playerList: [], // 当前播放列表
      playerIndex: 0, // 当前播放歌曲索引
      playerPlayMode: "list", // 播放模式: 'list' (列表循环) | 'single' (单曲循环) | 'random' (随机播放)
      playerApi: defaultPlayerApi, // 歌曲 API 地址
      playerServer: defaultPlayerServer, // 歌曲服务器
      playerType: defaultPlayerType, // 播放类型
      playerId: defaultPlayerId, // 播放 ID
    };
  },
  getters: {
    // 获取歌词
    getPlayerLrc(state) {
      return state.playerLrc;
    },
    // 获取歌曲信息
    getPlayerData(state) {
      return {
        name: state.playerTitle,
        artist: state.playerArtist,
        cover: state.playerCover,
      };
    },
    // 获取页面宽度
    getInnerWidth(state) {
      return state.innerWidth;
    },
    // 判断是否为移动端 / 竖屏设备
    isMobile(state) {
      if (typeof window === "undefined") return false;
      const width = state.innerWidth || window.innerWidth;
      return width <= 768 || window.innerHeight > width;
    },
    getIsMobile(state) {
      return this.isMobile;
    },
  },
  actions: {
    // 更改当前页面宽度
    setInnerWidth(value) {
      this.innerWidth = value;
      if (value >= 720) {
        this.mobileOpenState = false;
        this.mobileFuncState = false;
      }
    },
    // 更改播放状态
    setPlayerState(value) {
      if (value) {
        this.playerState = false;
      } else {
        this.playerState = true;
      }
    },
    // 更改歌词
    setPlayerLrc(value) {
      this.playerLrc = value;
    },
    // 更改歌曲数据
    setPlayerData(title, artist, cover = null) {
      this.playerTitle = title;
      this.playerArtist = artist;
      if (cover) {
        this.playerCover = cover;
      }
    },
    // 更改歌曲封面
    setPlayerCover(cover) {
      this.playerCover = cover;
    },
    // 更改播放列表
    setPlayerList(list) {
      this.playerList = list;
    },
    // 更改播放索引
    setPlayerIndex(index) {
      this.playerIndex = index;
    },
    // 更改播放模式
    setPlayerPlayMode(mode) {
      this.playerPlayMode = mode;
    },
    // 更改壁纸加载状态
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
    // 更改全屏歌词状态
    setFullLrcOpenState(value) {
      this.fullLrcOpenState = value;
    },
    // 更改播放进度
    setPlayerProgress(currentTime, duration) {
      this.playerCurrentTime = currentTime;
      this.playerDuration = duration;
    },
    // 更改完整歌词
    setPlayerFullLrc(lrcArray) {
      this.playerFullLrc = lrcArray;
    },
    // 更改当前歌词索引
    setPlayerCurrentLrcIndex(index) {
      this.playerCurrentLrcIndex = index;
    },
  },
  persist: {
    key: "data",
    storage: window.localStorage,
    paths: [
      "coverType",
      "musicVolume",
      "siteStartShow",
      "musicClick",
      "playerLrcShow",
      "playerPlayMode",
      "footerBlur",
      "playerApi",
      "playerServer",
      "playerType",
      "playerId",
    ],
  },
});
