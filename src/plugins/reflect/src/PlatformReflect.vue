<template>
  <div class="reflect">
    <ConnectPlatformReflect
      v-show="!connected"
      v-on:reflect-connected-method="isConnected"
    />

    <div v-show="connected">
      <BIMDataButton
        width="32px"
        @click="deleteAll"
        class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square m-r-12"
      >
        <BIMDataIcon name="delete" fill color="default" size="xs" />
      </BIMDataButton>
      <BIMDataButton
        width="32px"
        @click="logout"
        class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square m-r-12"
      >
        <BIMDataIcon name="logout" fill color="default" size="xs" />
      </BIMDataButton>
      <BIMDataButton
        width="32px"
        @click="isConnected"
        class="bimdata-btn__ghost bimdata-btn__ghost--default bimdata-btn__square m-r-12"
      >
        <BIMDataIcon name="refresh" fill color="default" size="xs" />
      </BIMDataButton>
      <div class="reflect__body">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <Rules
              v-on:reflect-connected-method="isConnected"
              :access_token="access_token"
              :rules="rules"
              :projectId="project_id"
              :active_initialisation="active_initialisation"
            />
          </keep-alive>
        </transition>
      </div>
      <div class="reflect__footer">
        <a class="reflect__footer__link" href="">
          {{ $t("ReflectPlugin.ReflectTab.footerLinkAPIReflect") }}
        </a>
        <span class="reflect__footer__text">
          {{ $t("ReflectPlugin.ReflectTab.footerText") }}
        </span>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <BIMDataLoading />
    </div>
  </div>
</template>

<script>
// import state from './state';
import ConnectPlatformReflect from "@/plugins/reflect/src/ConnectPlatformReflect";
import Rules from "@/plugins/reflect/src/rules/Rules";
import {
  BIMDataButton,
  BIMDataIcon,
  BIMDataLoading,
  BIMDataSearch
} from "@bimdata/design-system";

export default {
  name: "PlatformReflect",
  components: {
    BIMDataIcon,
    BIMDataButton,
    BIMDataLoading,
    Rules,
    ConnectPlatformReflect,
  },
  data() {
    return {
      projects: [],
      rules: [],
      loading: false,
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
    this.isConnected();
  },
  mounted() {
    console.log("=====MOUNTED=====", this.connected);
  },
  onOpen() {},
  beforeDestroy() {
    clearInterval(this.retrieving);
  },
  methods: {
    isConnected(value) {
      console.log("=====IS CONNECTED ?=====", this.connected);
      this.connected = value;
      this.getAccessToken();
      if (this.connected) {
        this.getProjects();
      }
    },

    getProjectName(){
      // Set default fileName
      const parts = this.$viewer.state.models[0].document.file_name.split(".");
      parts.pop(); // Remove extension
      return parts.join("."); // rebuild name without extension
    },
    async initProject() {
      this.loading = true;
      const projectName =this.getProjectName();
      const projectDescription = "";

      const res = await fetch(`${this.reflect_url}/reflect/project`, {
        headers: this.headers(),
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
        method: "POST",
      });
      const json = await res.json();
      this.project_id = json.project_id;

      const info = this.getInfoIfcFile();
      const url = info.url;
      const filename = info.filename;

      // async function createFile2(url,access_token, fn) {
      //   let request = new XMLHttpRequest();
      //   let file1;
      //   request.open("GET", url, true);
      //   request.responseType = 'text';
      //   request.onload = function () {
      //     file1 = new File([request.response], "filename.ifc", {
      //       type: "application/ifc",
      //     });
      //     fn({file:file1, access_token:access_token});
      //   };
      //   request.send();
      // }
      // const rere = await createFile2(url,this.access_token, function (data) {
      //   const formData = new FormData();
      //   formData.append("file", data.file);
      //   func.addIfc(formData, id_current_project,data.access_token);
      //   return "fde";
      // }).then(res => {
      //   console.log("res:", res);
      // });

      const ifc_bimdata = await this.loadIfcBimData(url, filename);
      const formData = new FormData();
      formData.append("file", ifc_bimdata);
      this.addIfc(formData, this.project_id);
    },

    async getProjects() {
      console.log("=====GET PROJECTS=====");
      console.log("=====STATE=====", this.$viewer.state);

      this.loading = true;
      const res = await fetch(`${this.reflect_url}/reflect/projects`, {
        headers: this.headers(),
      });

      this.projects  = await res.json();
      const project_current  = this.projects.find((x) => x.name === this.getProjectName());
      this.project_id  = project_current._id;
      console.log('this.project_id ', this.project_id);

      console.log("=====PROJECTS=====", this.projects.length);

      if (this.connected && this.projects.length === 0) {
        console.log("=====INIT=====");
        await this.initProject();
        this.active_initialisation = true;
      } else {
        this.active_initialisation = false;
        console.log("=====NOT INIT=====");
        this.loading = false;
        // await this.getRules();
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
      } else {
        this.connected = false;
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

      const res = await fetch(
        `${this.reflect_url}/reflect/rules?` +
          new URLSearchParams({
            projectId: this.project_id,
          }),
        {
          headers: this.headers(),
        }
      );
      const json = await res.json();
      this.rules = json.data;
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
      const res = await fetch(
        `${this.reflect_url}/reflect/project/${project_id}/tasks/${task_id}`,
        {
          headers: this.headers(),
          method: "GET",
        }
      );
      const json = await res.json();

      return json.task_status;
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
@import "~@bimdata/design-system/dist/css/design-system.css";
@import "~@bimdata/design-system/dist/scss/_BIMDataTransitions.scss";
@import "~@bimdata/design-system/dist/scss/BIMDataUtilities.scss";
.reflect {
  display: block;
  width: 100%;
  padding: var(--spacing-unit);

  &__body {
    display: block;
    height: 70vh;

    & > :first-child {
      height: 100%;
    }
  }

  &__footer {
    height: 5vh;
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
