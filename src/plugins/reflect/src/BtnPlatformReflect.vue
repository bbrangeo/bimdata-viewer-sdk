<template>
  <div></div>
</template>

<script>
import BtnConnectPlatformReflect from "./BtnConnectPlatformReflect.vue";

export default {
  name: "BtnPlatformReflect",
  onOpen() {
    this.$viewer.globalContext.modals.pushModal(BtnConnectPlatformReflect);
  },
};
</script>
