<template>
  <div class="set" @mouseenter="closeShow = true" @mouseleave="closeShow = false" @click.stop>
    <transition name="el-fade-in-linear">
      <close-one
        class="close"
        theme="filled"
        size="28"
        fill="#ffffff60"
        v-show="closeShow || isMobile"
        @click="store.setOpenState = false"
      />
    </transition>
    <!-- 移动端 Tab 导航 -->
    <div class="mobile-tabs" v-if="isMobile">
      <div :class="['tab-item', { active: activeTab === 'set' }]" @click="activeTab = 'set'">
        <setting-two theme="filled" size="16" />
        <span>全局设置</span>
      </div>
      <div :class="['tab-item', { active: activeTab === 'about' }]" @click="activeTab = 'about'">
        <info theme="filled" size="16" />
        <span>关于与日志</span>
      </div>
    </div>
    <el-row :gutter="isMobile ? 0 : 40" class="set-row">
      <el-col :span="isMobile ? 24 : 12" class="left" v-show="!isMobile || activeTab === 'about'">
        <div class="logo text-hidden">
          <span class="bg">{{ siteUrl[0] }}</span>
          <span class="sm">.{{ siteUrl[1] }}</span>
        </div>
        <div class="version">
          <div class="num">v&nbsp;{{ config.version }}</div>
          <el-tooltip content="Github 源代码仓库" placement="right" :show-arrow="false">
            <github-one class="github" theme="outline" size="24" @click="jumpTo(config.github)" />
          </el-tooltip>
        </div>
        <el-card class="update">
          <template #header>
            <div class="card-header">
              <span>更新日志</span>
            </div>
          </template>
          <div class="upnote">
            <div v-for="item in upData.new" :key="item" class="uptext">
              <add-one theme="outline" size="22" />
              {{ item }}
            </div>
            <div v-for="item in upData.fix" :key="item" class="uptext">
              <bug theme="outline" size="22" />
              {{ item }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="isMobile ? 24 : 12" class="right" v-show="!isMobile || activeTab === 'set'">
        <div class="title">
          <setting-two theme="filled" size="28" fill="#ffffff60" />
          <span class="name">全局设置</span>
        </div>
        <Set />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { CloseOne, SettingTwo, GithubOne, AddOne, Bug, Info } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import Set from "@/components/Set.vue";
import config from "@/../package.json";

const store = mainStore();
const closeShow = ref(false);
const activeTab = ref("set");

const isMobile = computed(() => {
  return (store.innerWidth || (typeof window !== "undefined" ? window.innerWidth : 1200)) < 768;
});

// 站点链接
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "imsyy.top".split(".");
  // 判断协议前缀
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat.split(".");
  }
  return url.split(".");
});

// 更新日志
const upData = reactive({
  new: [
    "全屏歌词显示功能",
    "歌曲搜索功能",
    "播放器配置功能",
    "采用 Vue 进行重构",
    "音乐歌单支持快速自定义",
    "壁纸支持个性化设置",
    "音乐播放器支持音量控制",
  ],
  fix: ["修复天气 API", "时光胶囊显示错误", "移动端动画及细节", "图标更换为 IconPark"],
});

// 跳转源代码仓库
const jumpTo = (url) => {
  window.open(url);
};
</script>

<style lang="scss" scoped>
.set {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: rgb(255 255 255 / 40%);
  border-radius: 6px;
  padding: 40px;

  .close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .mobile-tabs {
    display: none;
  }

  .el-row {
    height: 100%;
    flex-wrap: nowrap;

    .left {
      height: 100%;
      padding-left: 40px !important;
      padding-bottom: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .logo {
        transform: translateY(-8%);
        font-family: "Pacifico-Regular";
        padding-left: 22px;
        width: 100%;
        height: 260px;

        .bg {
          font-size: 5rem;
        }

        .sm {
          margin-left: 6px;
          font-size: 2rem;
        }
      }

      .version {
        display: flex;
        flex-direction: row;
        align-items: center;

        .num {
          font-size: 2rem;
          font-family: "Pacifico-Regular";
        }

        .github {
          width: 24px;
          height: 24px;
          margin-left: 12px;
          margin-top: 6px;
          cursor: pointer;

          &:hover {
            transform: scale(1.2);
          }
        }
      }

      .update {
        margin-top: 30px;
        height: 100%;

        :deep(.el-card__body) {
          height: 100%;

          .upnote {
            padding: 20px;
            height: calc(100% - 56px);
            overflow-y: auto;

            .uptext {
              display: flex;
              flex-direction: row;
              align-items: center;
              padding-bottom: 16px;

              &:nth-last-of-type(1) {
                padding: 0;
              }

              .i-icon {
                width: 22px;
                height: 22px;
                margin-right: 8px;
              }
            }
          }
        }
      }
    }

    .right {
      height: 100%;
      padding-right: 40px !important;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .title {
        display: flex;
        align-items: center;
        flex-direction: row;
        font-size: 18px;
        margin-bottom: 16px;

        .i-icon {
          width: 28px;
          height: 28px;
          margin-right: 6px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    width: 92%;
    height: 88%;
    max-height: 90vh;
    padding: 20px 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;

    .close {
      top: 14px;
      right: 14px;
      z-index: 10;
      opacity: 1 !important;
      display: block !important;
    }

    .mobile-tabs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      width: 100%;

      .tab-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        color: #ddd;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background: rgba(255, 255, 255, 0.3);
          color: #fff;
          font-weight: 600;
        }
      }
    }

    .el-row {
      flex: 1;
      height: calc(100% - 48px);
      flex-wrap: wrap;
      overflow: hidden;

      .left {
        padding-left: 0 !important;
        padding-bottom: 10px;
        height: 100%;
        justify-content: flex-start;

        .logo {
          transform: none;
          height: auto;
          padding-left: 0;
          margin-bottom: 8px;

          .bg {
            font-size: 2.8rem;
          }

          .sm {
            font-size: 1.4rem;
          }
        }

        .version {
          margin-bottom: 12px;
          .num {
            font-size: 1.4rem;
          }
        }

        .update {
          margin-top: 0;
          flex: 1;
          height: auto;
          max-height: calc(100% - 80px);

          :deep(.el-card__body) {
            .upnote {
              padding: 14px;
              max-height: calc(88vh - 250px);
            }
          }
        }
      }

      .right {
        padding-right: 0 !important;
        height: 100%;
        justify-content: flex-start;
        overflow-y: auto;

        .title {
          display: none;
        }
      }
    }
  }
}
</style>
