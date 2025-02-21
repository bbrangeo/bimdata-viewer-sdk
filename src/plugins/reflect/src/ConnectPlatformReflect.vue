<template>
  <div class="reflect-connexion">
    <div class="reflect-connexion__header flex items-center justify-center">
      <img src="../assets/favicon-32x32.png" alt="" class="square-3d" />
    </div>

    <div class="reflect-connexion__content">
      <div class="justify-center justify-around">
        <h2 class="p-2 color-primary">REFLECT</h2>
        <h3 class="p-2 color-primary">
          C’est un service de vérification de la qualité des maquettes numérique
          IFC. Ce service permet de superviser une maquette numérique en
          vérifiant sa conformité vis à vis d’un protocole préalablement défini
          (cahier des charges). L’assistant vérifie la présence et l’emplacement
          d’informations attendues dans la maquette à partir de règles.
        </h3>
        <h2 class="p-2 color-secondary">
          {{ title }}
        </h2>
        <div class="m-48 p-30">
          <BIMDataInput v-model="username" placeholder="Nom utilisateur Reflect" />
          <BIMDataInput v-model="password" placeholder="Mot de passe Reflect" />
          <BIMDataButton
            width="100%"
            @click="connexion"
            class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
          >
            Connexion
          </BIMDataButton>
        </div>
        <BIMDataResponsiveGrid itemWidth="300px" rowGap="6px" columnGap="18px">
          <div v-for="i of publicity" :key="i">
            <img
              v-bind:style="{'width':i.width,'height':i.height}"
              v-bind:src="i.img_src"
              alt=""
              class="square-3d"
            />
          </div>
        </BIMDataResponsiveGrid>

        <div class="flex items-center justify-center">
          <img src="../assets/favicon-32x32.png" alt="" class="square-3d" />
          <span class="">Tipee 2022 </span>
        </div>
        <div class="flex items-center justify-center">
          <span class="">
            <a href="https://www.plateforme-tipee.com/"
              >https://www.plateforme-tipee.com/</a
            >
          </span>
        </div>
        <div class="flex items-center justify-center">
          <span class="">
            <a href="https://reflect.plateforme-tipee.com/"
              >https://reflect.plateforme-tipee.com/</a
            >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BIMDataButton,
  BIMDataInput,
  BIMDataResponsiveGrid,
} from "@bimdata/design-system";
import state from "./state";

export default {
  name: "ConnectPlatformReflect",
  components: {
    BIMDataButton,
    BIMDataInput,
    BIMDataResponsiveGrid,
  },
  data() {
    return {
      title: "CONNEXION",
      connected: false,
      access_token: this.oauth,
      password: "test_plugin",
      username: "test_plugin",
      publicity: [
        {
          img_src: require("../assets/reflect.png"),
          width: "150px",
          height: "50px",
        },

        {
          img_src: require("../assets/tipee.png"),
          width: "150px",
          height: "50px",

        }
      ],
    };
  },
  emits: ["share-token"],
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
  },
  mounted() {
    console.log("ConnectPlatformReflect mounted", this.connected);
  },
  created() {
    console.log("ConnectPlatformReflect created", this.connected);
  },

  onOpen() {
    console.log("ConnectPlatformReflect onOpen", this.connected);
  },
  methods: {
    setWithExpiry(key, value, ttl) {
      const now = new Date();
      // `item` is an object which contains the original value
      // as well as the time when it's supposed to expire
      const item = {
        ...value,
        expiry: now.getTime() + ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    },

    async connexion() {
      this.loading = true;

      const res = await fetch(`${this.reflect_url}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({
          client_id: "2mz6oZxT0uI9zcURpA0TthLwGc4gxmFi2CKBDiO0",
          grant_type: "password",
          username: this.username,
          password: this.password,
          scopes: "notifications",
        }),
        redirect: "follow",
      });
      const json = await res.json();

      this.oauth = json.data;
      console.log("connexion access_token", json.access_token);
      this.loading = false;

      if (json.error) {
        this.connected = false;
      } else {
        this.connected = true;
      }
      state.accessToken = this.access_token;
      state.connected = this.connected;

      localStorage.setItem("connected", this.connected);
      this.setWithExpiry(
        "access_reflect",
        { access_token: json.access_token, connected: this.connected },
        1000000
      );
      this.$emit("reflect-connected-method", this.connected);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@bimdata/design-system/dist/scss/BIMData.scss";
@import "~@bimdata/design-system/dist/scss/utilities/spacing.scss";
@import "~@bimdata/design-system/dist/css/design-system.css";
@import "~@bimdata/design-system/dist/scss/_BIMDataTransitions.scss";
@import "~@bimdata/design-system/dist/scss/BIMDataUtilities.scss";
.reflect-connexion {
  &__header {
    padding: 40px;
    position: relative;
    width: 100%;
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
    padding: 1px;
    width: 100%;

    .bimdata-btn {
      padding: 0 12px;
      height: 32px;
      text-decoration: none;
    }
  }
}
</style>
