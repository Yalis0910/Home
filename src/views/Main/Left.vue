<template>
  <div :class="leftClass">
    <Message />
    <SocialLinks />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { mainStore } from "@/store";
import Message from "@/components/Message.vue";
import SocialLinks from "@/components/SocialLinks.vue";

const store = mainStore();

const leftClass = computed(() => {
  const isMobileScreen = (store.innerWidth || (typeof window !== "undefined" ? window.innerWidth : 1200)) < 720;
  if (store.mobileOpenState) return "left hidden";
  if (isMobileScreen && store.boxOpenState) return "left hidden";
  return "left";
});
</script>

<style lang="scss" scoped>
.left {
  // flex: 1 0 0%;
  width: 50%;
  margin-right: 10px;
  transform: translateY(20px);
  &.hidden {
    display: none;
  }
  @media (max-width: 720px) {
    margin-right: 0;
    width: 100%;
  }
}
</style>
