<template>
  <div class="reflect">
    <ConnectPlatformReflect
      v-show="!connected"
      v-on:reflect-connected-method="isConnected"
    />
    <div v-show="connected">
      <BIMDataDropdownMenu
        :disabled="false"
        width="25%"
        class="flex flex-row content-center"
        >>
        <template #header>
          <BIMDataIcon name="burgerMenu" size="xxs" />
          MENU
        </template>
        <template #element>
          <div class="flex flex-col items-start">
            <div
              v-show="modeAdmin"
              class="m-6"
              style="width: 150px; height: 150px"
              key="ruleAdd"
            >
              <BIMDataButton
                width="100%"
                icon
                @click="initrule"
                class="m-6 bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
              >
                <BIMDataIcon
                  name="plus"
                  fill
                  color="default"
                  size="xxs"
                  margin="0 12px 0 0"
                />
                <span>Create a package rule</span>
              </BIMDataButton>
              <BIMDataButton
                v-show="modeAdmin"
                width="100%"
                icon
                @click="initrule"
                class="m-6 bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
              >
                <BIMDataIcon
                  name="plus"
                  fill
                  color="default"
                  size="xxs"
                  margin="0 12px 0 0"
                />
                <span>Create a rule</span>
              </BIMDataButton>
            </div>
            <BIMDataButton
              v-show="modeAdmin"
              width="32px"
              @click="deleteAll"
              class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square"
            >
              <span>Delete all</span>
              <BIMDataIcon name="delete" fill color="default" size="xxs" />
            </BIMDataButton>
            <BIMDataButton
              v-show="modeAdmin"
              width="32px"
              @click="isConnected"
              class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square"
            >
              <span>Refresh</span>
              <BIMDataIcon name="refresh" fill color="default" size="xxs" />
            </BIMDataButton>
            <BIMDataButton
              width="32px"
              @click="logout"
              class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square"
            >
              <span class="m-6">Logout</span>
              <BIMDataIcon name="logout" fill color="default" size="xxs" />
            </BIMDataButton>
          </div>
        </template>
      </BIMDataDropdownMenu>
      <div class="reflect__body">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <Rules
              v-on:reflect-connected-method="isConnected"
              :rules="rules"
              :projectId="project_id"
              :active_initialisation="active_initialisation"
              :modeAdmin="modeAdmin"
            />
          </keep-alive>
        </transition>
      </div>
<!--      <div class="reflect__footer">-->
<!--        <a-->
<!--          class="reflect__footer__link"-->
<!--          href="https://smarty.plateforme-tipee.com/apidocs#/"-->
<!--        >-->
<!--          {{ $t("ReflectPlugin.ReflectTab.footerLinkAPIReflect") }}-->
<!--        </a>-->
<!--        <a-->
<!--          class="reflect__footer__link"-->
<!--          href="https://reflect.plateforme-tipee.com/help/Syntaxe_des_requete_IFC_REFLECT.pdf"-->
<!--        >-->
<!--          {{ $t("ReflectPlugin.ReflectTab.footerLinkHelpReflect") }}-->
<!--        </a>-->
<!--        <span class="reflect__footer__text">-->
<!--          {{ $t("ReflectPlugin.ReflectTab.footerText") }}-->
<!--        </span>-->
<!--      </div>-->
    </div>
    <div v-if="loading" class="loading">
      <BIMDataLoading message="Transfert des informations"/>
    </div>
  </div>
</template>

<script>
import state from "./state";

import ConnectPlatformReflect from "@/plugins/reflect/src/ConnectPlatformReflect";
import Rules from "@/plugins/reflect/src/rules/Rules";
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataLoading,
  BIMDataDropdownMenu,
} from "@bimdata/design-system";

export default {
  name: "PlatformReflect",
  components: {
    BIMDataIcon,
    BIMDataButton,
    BIMDataLoading,
    BIMDataDropdownMenu,
    ConnectPlatformReflect,
    Rules,
  },
  data() {
    return {
      modeAdmin: false,
      projects: [],
      rules: [],
      loading: false,
      loadedModel: null,
      searchText: "",
      connected: false,
      access_token: null,
      active_initialisation: true,
      project_id: null,
      retrieving: null,
      status: null,
    };
  },
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
  },
  created() {
    console.log("=====CREATED=====", this.connected);
    this.apiBcfClient = new this.$viewer.api.apiClient.BcfApi();


  },
  mounted() {
    console.log("=====MOUNTED=====", this.connected);
    this.$viewer.globalContext.hub.once("3d-model-loaded", () => {
      console.log("=====MODEL LOADED=====");
      this.getProjectName();
    });
    this.$viewer.localContext.registerShortcut({
      name: "admin",
      key: "$",
      ctrlKey: true,
      shiftKey: false,
      execute: () => {
        this.activatedModeAdmin();
      },
    });
  },
  onOpen() {},
  beforeDestroy() {
    clearInterval(this.retrieving);
    this.$viewer.localContext.unregisterShortcut("admin");
  },
  methods: {
    initrule() {
      this.$emit("reflect-connected-method", "");
    },
    activatedModeAdmin() {
      console.log("======ADMIN=====");

      this.modeAdmin = !this.modeAdmin;
      state.admin = !this.modeAdmin;
    },
    isConnected(value) {
      // console.log("=======VIEWER GLOBAL======",  this.$viewer);
      // console.log("=======VIEWER GLOBAL CONTEXT======",  this.$viewer.globalContext);
      console.log("=====IS CONNECTED ?=====", this.connected);
      this.connected = value;
      this.getAccessToken();
      if (this.connected) {
        this.getProjects();
      }
    },
    async clearDataBCF() {
      // clear all bcf
      try {
        const topics = await this.apiBcfClient.getTopics(
          this.$viewer.api.projectId
        );

        if (topics) {
          topics.map(topic => {
            this.apiBcfClient.deleteTopic(
              topic.guid,
              this.$viewer.api.projectId
            );
          });
        }
      } catch (e) {
        console.log("erreur", e);
      }
    },
    getProjectName() {
      const loadedModels = this.$viewer.state.models;
      console.log("======GET PROJECT NAME=====", loadedModels);

      let name;
      if (loadedModels.length > 1) {
        this.$viewer.localContext.hub.emit("alert", {
          type: "error",
          message:
            "You can't split more than one model at once. Please load only one model",
        });
        this.$emit("set-inactive");
      } else if (loadedModels.length === 1) {
        this.loadedModel = loadedModels[0];
        const fileName = this.loadedModel.document.file_name;
        const parts = fileName.split(".");
        parts.pop(); // Remove extension
        name = parts.join("."); // rebuild name without extension
      }
      console.log("======GET PROJECT NAME=====", name);
      return name;
    },

    async initProject() {
      this.loading = true;
      const projectName = this.getProjectName();
      const projectDescription = "";

      const response = await fetch(`${this.reflect_url}/reflect/project`, {
        headers: this.headers(),
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
        method: "POST",
      })
        .then(response => response.json())
        .catch(error => console.log("====ERROR INIT PROJECT====", error));

      this.project_id = response.project_id;
      const info = this.getInfoIfcFile();
      const url = info.url;
      const filename = info.filename;

      const ifc_bimdata = await this.loadIfcBimData(url, filename);
      const formData = new FormData();
      formData.append("file", ifc_bimdata);
      this.addIfc(formData, this.project_id);
    },

    async getProjects() {
      console.log("=====GET PROJECTS=====");
      console.log("=====STATE=====", this.$viewer.state);

      this.loading = true;
      if (this.connected) {
        await fetch(`${this.reflect_url}/reflect/projects`, {
          headers: this.headers(),
        })
          .then(response => response.json())
          .then(async result => {
            this.projects = result;
            const project_current = this.projects.find(
              x => x.name === this.getProjectName()
            );
            console.log("project_current ", project_current);

            if (project_current == null || this.projects.length === 0) {
              console.log("=====INIT=====");
              await this.initProject();
              this.active_initialisation = true;
            } else {
              this.active_initialisation = false;
              console.log("=====NOT INIT=====");
              this.project_id = project_current._id;
              console.log("this.project_id ", this.project_id);
              console.log("=====PROJECTS=====", this.projects.length);

              this.loading = false;
              // await this.getRules();
            }
          })
          .catch(error => console.log("====ERROR INIT PROJECT====", error));
      }
      return this.projects;
    },

    async loadIfcBimData(url, filename) {
      let response = await fetch(url);
      let data = await response.text();
      console.log("=====LOAD IFC BIMDATA=====");
      let metadata = {
        type: "application/ifc",
      };
      let file = new File([data], filename, metadata);
      return file;
    },

    get_access_token() {
      return this.access_token;
    },

    getInfoIfcFile() {
      const models = this.$viewer.state.models;
      this.loadedIfc = models[0];
      return {
        url: this.loadedIfc.document.file,
        filename: this.loadedIfc.document.name,
      };
    },

    deleteAll() {
      console.log("=====DELETE ALL=====", this.projects.length);

      this.projects.map(project => {
        this.deleteProject(project._id);
      });
    },

    cancel() {
      this.projectCreated = true;
      this.$emit("project-method", this.projectCreated);
    },

    async getAccessToken() {
      const access_reflect = this.getWithExpiry("access_reflect");

      if (access_reflect) {
        this.access_token = access_reflect.access_token;
        this.connected = access_reflect.connected;

        state.accessToken = this.access_token;
        state.connected = this.connected;
      } else {
        this.logout();
      }
      console.log("=====ACCESS TOKEN=====", this.access_token);
    },

    headers() {
      return {
        Authorization: "Bearer " + this.access_token,
        "Content-Type": "application/json",
      };
    },
    async deleteProject(selected) {
      this.loading = true;

      await fetch(`${this.reflect_url}/reflect/project/${selected}`, {
        headers: this.headers(this.access_token),
        method: "DELETE",
      })
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log("error", error));
      this.loading = false;
    },

    async getRules() {
      console.log("rulesTab getRules selected", this.projects[0]._id);
      this.project_id = this.projects[0]._id;
      this.loading = true;

      const response = await fetch(
        `${this.reflect_url}/reflect/rules?` +
          new URLSearchParams({
            projectId: this.project_id,
          }),
        {
          headers: this.headers(),
        }
      )
        .then(response => response.json())
        .catch(error => console.log("====ERROR GET RULES====", error));
      this.rules = response.data;
      this.loading = false;
    },

    addIfc(fd, id_project) {
      console.log("=====ADD IFC=====");
      fetch(`${this.reflect_url}/reflect/project/${id_project}/add_ifc`, {
        headers: {
          // "Content-Length": response.length,
          Authorization: "Bearer " + this.access_token,
          // "Content-Type": "multipart/form-data",
        },
        body: fd,
        method: "POST",
      })
        .then(response => response.json())
        .then(result => {
          console.log(result);
          this.retrieveTaskStatus(id_project, result.status.tasks.task_id_ifc);
        })
        .catch(error => console.log("error", error));
    },

    retrieveTaskStatus(project_id, task_id) {
      this.retrieving = setInterval(async () => {
        this.status = await this.getTaskStatus(project_id, task_id);

        if (this.status === "SUCCESS") {
          console.log("=====SUCCESS=====", this.status);

          clearInterval(this.retrieving);
          this.projectCreated = true;
          this.$emit("project-method", this.projectCreated);
          this.$emit("reflect-connected-method", "");
          this.loading = false;
        }
      }, 3000);
    },

    async getTaskStatus(project_id, task_id) {
      const response = await fetch(
        `${this.reflect_url}/reflect/project/${project_id}/tasks/${task_id}`,
        {
          headers: this.headers(),
          method: "GET",
        }
      )
        .then(response => response.json())
        .catch(error => console.log("====ERROR GET TASK STATUS====", error));

      return response.task_status;
    },

    getWithExpiry(key) {
      const itemStr = localStorage.getItem(key);
      // if the item doesn't exist, return null
      if (!itemStr) {
        return null;
      }
      const item = JSON.parse(itemStr);
      const now = new Date();
      // compare the expiry time of the item with the current time
      if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key);
        return null;
      }
      return item;
    },
    logout() {
      // debugger;
      this.connected = false;
      state.connected = false;
      state.accessToken = null;
      localStorage.removeItem("access_reflect");
      console.log("deconnexion", this.connected);
      this.$emit("close");
      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: "DECONNEXION",
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "@bimdata/design-system/dist/css/design-system.css";
@import "@bimdata/design-system/dist/scss/_BIMDataTransitions.scss";
@import "@bimdata/design-system/dist/scss/BIMDataUtilities.scss";
@import "@bimdata/design-system/dist/scss/mixins/font-size.scss";

.reflect {
  display: block;
  width: 100%;
  padding: var(--spacing-unit);
  font-size: calculateEm(12px);

  &__body {
    display: block;
    height: 75vh;

    & > :first-child {
      height: 100%;
    }
  }

  &__footer {
    height: 10vh;
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--color-tertiary);

    &__link {
      width: 50%;
      color: var(--color-black);
      text-decoration: none;

      &.right {
        text-align: end;
      }

      &:hover {
        text-decoration: underline;
      }
    }

    &__text {
      width: 100%;
      color: var(--color-tertiary-dark);
    }
  }
}
</style>
