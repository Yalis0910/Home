<template>
  <div class="box cards" @mouseenter="closeShow = true" @mouseleave="closeShow = false">
    <transition name="el-fade-in-linear">
      <close-one
        class="close"
        theme="filled"
        size="28"
        fill="#ffffff60"
        v-show="closeShow || isMobile"
        @click="store.boxOpenState = false"
      />
    </transition>
    <transition name="el-fade-in-linear">
      <setting-two
        class="setting"
        theme="filled"
        size="28"
        fill="#ffffff60"
        v-show="closeShow || isMobile"
        @click="store.setOpenState = true"
      />
    </transition>
    <div class="content">
      <TimeCapsule />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { CloseOne, SettingTwo } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import TimeCapsule from "@/components/TimeCapsule.vue";

const store = mainStore();
const closeShow = ref(false);

const isMobile = computed(() => {
  return (store.innerWidth || (typeof window !== "undefined" ? window.innerWidth : 1200)) < 720;
});
</script>

<style lang="scss" scoped>
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: 80%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    transition:
      transform 0.3s,
      opacity 0.3s;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .setting {
    right: 56px;
  }

  .content {
    padding: 30px;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 720px) {
    flex: none;
    width: 100%;
    max-width: 460px;
    margin-left: 0;
    height: auto;
    max-height: 80vh;
    overflow-y: auto;

    .close,
    .setting {
      opacity: 1 !important;
      display: block !important;
    }

    .content {
      padding: 24px 16px;
    }
  }
}
</style>
