<template>
  <div class="viewer">
    <div :id="viewerId"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import makeBIMDataViewer from "@bimdata/viewer";

import backgroundColor from "@/plugins/backgroundColor/src/backgroundColor.plugin.js";
import BimObjectPlugin from "@/plugins/bimobject/src/bimobject.plugin.js";
import bsdd from "@/plugins/bsdd/src/bsdd.plugin.js";
import iframeShare from "@/plugins/iframeShare/src/iframeShare.plugin.js";
import ChristmasSleighPlugin from "@/plugins/christmasSleigh/src/christmasSleigh.plugin.js";
import excelExportPlugin from "@/plugins/excelExport/src/excelExport.plugin.js";
import GltfExtractorPlugin from "@/plugins/gltfExtractor/src/gltfExtractor.plugin.js";
import HolusionPlugin from "@/plugins/holusion/src/holusion.plugin.js";
import iotPlugin from "@/plugins/iot/src/iot.plugin.js";
import kroqiBcfService from "@/plugins/kroqiBcfService/src/kroqiBcfService.plugin.js";
import platformDemo from "@/plugins/platformDemo/src/platformDemo.plugin.js";
import SnowflakesPlugin from "@/plugins/snowflakes/src/snowflakes.plugin.js";
import SplitPlugin from "@/plugins/split/src/split.plugin.js";
import SvgExtractorPlugin from "@/plugins/svgExtractor/src/svgExtractor.plugin.js";
import ReflectPlugin from "@/plugins/reflect/src/reflect.plugin.js";

export default {
  data() {
    return {
      viewerId: "bimdataViewerId",
    };
  },
  computed: {
    ...mapGetters(["oidcAccessToken"]),
  },
  mounted() {
    const bimdataViewer = makeBIMDataViewer({
      locale: "fr",
      api: {
        cloudId: this.$route.query.cloudId,
        projectId: this.$route.query.projectId,
        ifcIds: [this.$route.query.ifcId],
        apiUrl: process.env.VUE_APP_BIMDATA_API_URL,
        accessToken: this.oidcAccessToken,
      },
      plugins: {
        bcfManager: true,
        bcfKroqiPremiumService: {
          kroqiDomain: "pfptnbdev.io",
          organization: "cstb",
          userIsAdmin: true,
          kroqiProjectId: "123456789",
          service: "BIMDATA",
        },
      },
    });

    // bimdataViewer.registerPlugin(backgroundColor);
    bimdataViewer.registerPlugin(BimObjectPlugin);
    bimdataViewer.registerPlugin(bsdd);
    // bimdataViewer.registerPlugin(ChristmasSleighPlugin);
    bimdataViewer.registerPlugin(excelExportPlugin);
    bimdataViewer.registerPlugin(iframeShare);

    // bimdataViewer.registerPlugin(GltfExtractorPlugin);
    // bimdataViewer.registerPlugin(HolusionPlugin);
    // bimdataViewer.registerPlugin(iotPlugin);
    // bimdataViewer.registerPlugin(kroqiBcfService);
    // bimdataViewer.registerPlugin(platformDemo);
    // bimdataViewer.registerPlugin(SnowflakesPlugin);
    // bimdataViewer.registerPlugin(SplitPlugin);
    // bimdataViewer.registerPlugin(SvgExtractorPlugin);
    bimdataViewer.registerPlugin(ReflectPlugin);

// Create and register windows
    const window1 = {
      name: "window1",
      plugins: ["ReflectPlugin"],
    };


    bimdataViewer.registerWindow(window1);

    // Mount custom layout
    const customLayout = {
      ratios: [40, 60],
      children: [
        "3d","window1"
      ],
    };

    bimdataViewer.mount(`#${this.viewerId}`, customLayout);

    this.$watch(
      () => this.oidcAccessToken,
      token => {
        bimdataViewer.setAccessToken(token);
      }
    );
  },
};
</script>

<style scoped>
.viewer {
  height: 100vh;
  width: 100vw;
}
</style>
