<template>
  <div class="setting">
    <el-collapse class="collapse" v-model="activeName" accordion>
      <el-collapse-item title="个性壁纸" name="1">
        <div class="bg-set">
          <el-radio-group v-model="coverType" text-color="#ffffff" @change="radioChange">
            <el-radio label="0" value="0" size="large" border>默认壁纸</el-radio>
            <el-radio label="1" value="1" size="large" border>每日一图</el-radio>
            <el-radio label="2" value="2" size="large" border>随机风景</el-radio>
            <el-radio label="3" value="3" size="large" border>随机动漫</el-radio>
          </el-radio-group>
        </div>
      </el-collapse-item>
      <el-collapse-item title="个性化调整" name="2">
        <div class="item">
          <span class="text">建站日期显示</span>
          <el-switch
            v-model="siteStartShow"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">音乐点击是否打开面板</span>
          <el-switch
            v-model="musicClick"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">底栏歌词显示</span>
          <el-switch
            v-model="playerLrcShow"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">底栏背景模糊</span>
          <el-switch
            v-model="footerBlur"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="播放器配置" name="3">
        <div class="player-config">
          <div class="config-row">
            <div class="config-item">
              <span class="config-label">API 地址</span>
              <el-input
                v-model="playerApi"
                placeholder="请输入歌曲 API 地址"
                class="config-input"
              />
            </div>
            <div class="config-item">
              <span class="config-label">播放 ID</span>
              <el-input v-model="playerId" placeholder="请输入播放 ID" class="config-input" />
            </div>
          </div>
          <div class="config-row">
            <div class="config-item full-width">
              <span class="config-label">歌曲服务器</span>
              <el-radio-group v-model="playerServer">
                <el-radio label="netease" value="netease" size="large" border>网易云</el-radio>
                <el-radio label="tencent" value="tencent" size="large" border>QQ音乐</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="config-row">
            <div class="config-item full-width">
              <span class="config-label">播放类型</span>
              <el-radio-group v-model="playerType">
                <el-radio label="song" value="song" size="large" border>歌曲</el-radio>
                <el-radio label="playlist" value="playlist" size="large" border>播放列表</el-radio>
                <el-radio label="album" value="album" size="large" border>专辑</el-radio>
                <el-radio label="search" value="search" size="large" border>搜索</el-radio>
                <el-radio label="artist" value="artist" size="large" border>艺术家</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="其他设置" name="4">
        <div>设置内容待增加</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { CheckSmall, CloseSmall, SuccessPicture } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { storeToRefs } from "pinia";

const store = mainStore();
const {
  coverType,
  siteStartShow,
  musicClick,
  playerLrcShow,
  footerBlur,
  playerApi,
  playerServer,
  playerType,
  playerId,
} = storeToRefs(store);

// 默认选中项
const activeName = ref("1");

// 壁纸切换
const radioChange = () => {
  ElMessage({
    message: "壁纸设置成功，刷新后生效",
    icon: h(SuccessPicture, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};
</script>

<style lang="scss" scoped>
.setting {
  .collapse {
    border-radius: 8px;
    --el-collapse-content-bg-color: #ffffff10;
    border-color: transparent;
    overflow: hidden;

    :deep(.el-collapse-item__header) {
      background-color: #ffffff30;
      color: #fff;
      font-size: 15px;
      padding-left: 18px;
      border-color: transparent;
    }

    :deep(.el-collapse-item__wrap) {
      border-color: transparent;

      .el-collapse-item__content {
        padding: 20px;
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          &:first-child {
            padding-top: 0;
          }

          .el-switch__core {
            border-color: transparent;
            background-color: #ffffff30;
          }
        }
        .bg-set {
          .el-radio-group {
            justify-content: space-between;

            .el-radio {
              margin: 10px 16px;
              background: #ffffff26;
              border: 2px solid transparent;
              border-radius: 8px;

              .el-radio__label {
                color: #fff;
              }

              .el-radio__inner {
                background: #ffffff06 !important;
                border: 2px solid #eeeeee !important;
              }

              &.is-checked {
                background: #ffffff06 !important;
                border: 2px solid #eeeeee !important;
              }

              .is-checked {
                .el-radio__inner {
                  background-color: #ffffff30 !important;
                  border-color: #fff !important;
                }

                & + .el-radio__label {
                  color: #fff !important;
                }
              }
            }
          }
        }
        .player-config {
          display: flex;
          flex-direction: column;
          gap: 20px;

          .config-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;

            .config-item {
              flex: 1;
              min-width: 200px;
              display: flex;
              flex-direction: column;
              gap: 8px;

              &.full-width {
                flex: 1 1 100%;
              }

              .config-label {
                font-size: 14px;
                color: #fff;
                font-weight: 500;
              }

              .config-input {
                :deep(.el-input__wrapper) {
                  background-color: #ffffff20;
                  box-shadow: none;
                  border: 1px solid transparent;
                  border-radius: 8px;
                  padding: 4px 12px;

                  &.is-focus {
                    border-color: #ffffff50;
                  }

                  .el-input__inner {
                    color: #fff;

                    &::placeholder {
                      color: #ffffff60;
                    }
                  }
                }
              }

              .el-radio-group {
                justify-content: flex-start;

                .el-radio {
                  margin: 10px 16px;
                  background: #ffffff26;
                  border: 2px solid transparent;
                  border-radius: 8px;

                  .el-radio__label {
                    color: #fff;
                  }

                  .el-radio__inner {
                    background: #ffffff06 !important;
                    border: 2px solid #eeeeee !important;
                  }

                  &.is-checked {
                    background: #ffffff06 !important;
                    border: 2px solid #eeeeee !important;
                  }

                  .is-checked {
                    .el-radio__inner {
                      background-color: #ffffff30 !important;
                      border-color: #fff !important;
                    }

                    & + .el-radio__label {
                      color: #fff !important;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .collapse {
      :deep(.el-collapse-item__content) {
        padding: 14px 10px;
      }

      .bg-set {
        .el-radio-group {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;

          .el-radio {
            margin: 0 !important;
            width: 100% !important;
            justify-content: center !important;
            padding: 0 10px !important;
          }
        }
      }

      .player-config {
        gap: 14px;

        .config-row {
          flex-direction: column !important;
          gap: 12px !important;

          .config-item {
            min-width: 100% !important;
            width: 100% !important;

            .el-radio-group {
              display: grid !important;
              grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important;
              gap: 8px !important;
              width: 100% !important;

              .el-radio {
                margin: 0 !important;
                width: 100% !important;
                justify-content: center !important;
                padding: 0 8px !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>
