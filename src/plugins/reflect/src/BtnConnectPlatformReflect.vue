<template>
  <div class="">
    <div class="platform-demo__header flex items-center justify-center">
      <h4 class="m-x-12">
        {{ title }}
      </h4>
      <img src="../assets/favicon-32x32.png" alt="" class="square-3d" />
    </div>
    <div class="platform-demo__content">
      <div class="flex">
        <div class="p-x-12">
          <div class="project-modal__content__input" v-if="connected === false">
            <BIMDataInput v-model="username" placeholder="Username" />
            <BIMDataInput v-model="password" placeholder="Password" />
          </div>
          <BIMDataButton
            width="100%"
            @click="connexion"
            class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
          >
            Connexion
          </BIMDataButton>
          <Reflect
            v-if="connected === true"
            :oauth="oauth"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Reflect from "./Reflect.vue";
import BIMDataButton from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataButton";
import BIMDataInput from "@bimdata/design-system/dist/js/BIMDataComponents/BIMDataInput";

export default {
  name: "BtnConnectPlatformReflect",
  components: {
    BIMDataButton,
    BIMDataInput,
    Reflect,
  },
  data() {
    return {
      title: "CONNEXION",
      connected: false,
      password: "test_plugin",
      username: "test_plugin"
    };
  },
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
    headers() {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      return myHeaders;
    },
  },
  created() {},
  methods: {
    async connexion() {
      this.loading = true;
      let formdata = new FormData();
      formdata.append("client_id", "2mz6oZxT0uI9zcURpA0TthLwGc4gxmFi2CKBDiO0");
      formdata.append("grant_type", "password");
      formdata.append("username", "test_plugin");
      formdata.append("password", "test_plugin");
      formdata.append("scopes", "notifications");

      console.log("formdata", formdata);
      const plainFormData = Object.fromEntries(formdata.entries());
      const formDataJsonString = JSON.stringify(plainFormData);
      console.log("formDataJsonString", formDataJsonString);

      const res = await fetch(`${this.reflect_url}/oauth/token`, {
        method: "POST",
        headers: this.headers,
        body: formDataJsonString,
      });
      const json = await res.json();

      if (json.error) {
        this.connected = false;
      } else {
        this.connected = true;
      }
      this.oauth = json.data;
      console.log("connexion", json);
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.platform-demo {
  &__header {
    padding: 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background-color: var(--color-primary);
      clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
    }
    img {
      position: relative;
    }
    .square-blur {
      position: absolute;
      left: 15%;
      bottom: 10%;
    }
    .square-3d {
      position: absolute;
      right: 15%;
      top: 20%;
    }
  }
  &__content {
    padding: 40px;
    &__card {
      max-width: 210px;
      h5 {
        min-height: 46px;
        font-size: 18px;
        position: relative;
        line-height: 23px;
        text-align: center;
        &::before {
          width: 20px;
          height: 3px;
          content: "";
          position: absolute;
          background-color: var(--color-secondary);
          top: -20px;
          left: calc(50% - 10px);
        }
      }
    }
    .bimdata-btn {
      padding: 0 12px;
      height: 32px;
      text-decoration: none;
    }
  }
}
</style>
