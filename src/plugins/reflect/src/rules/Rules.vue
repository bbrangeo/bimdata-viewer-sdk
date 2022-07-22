<template>
  <div class="rule-tab">
    <BIMDataSearch
      width="100%"
      :placeholder="$t('ReflectPlugin.search')"
      class="bimdata-search-bar__radius bimdata-search-bar__primary"
      v-model="queryString"
      @enter="handleClick"
      @click="handleClick"
      :clear="true"
      autofocus
      @clear="clear"
    ></BIMDataSearch>
    <!--    <AddruleReflect-->
    <!--      v-show="activeAddrule"-->
    <!--      v-on:rule-method="updateParent"-->
    <!--      :access_token="access_token"-->
    <!--    />-->
    <BIMDataResponsiveGrid
      itemWidth="250px"
      rowGap="6px"
      columnGap="18px"
      v-show="!activeAddrule"
    >
      <div class="m-6" style="width: 150px; height: 150px" key="ruleAdd">
        <BIMDataButton
          width="100%"
          icon
          @click="initrule"
          class="bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
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
      <div
        class="m-6"
        style="width: 250px; height: 150px"
        v-for="rule of rules"
        :key="rule._id"
      >
        <BIMDataCard width="30%" :key="rule._id">
          <template #content>
            <h4>{{ rule.name }}</h4>
            <h5>{{ rule.description }}</h5>
            <BIMDataButton
              width="100%"
              icon
              @click="deleterule(rule._id)"
              class="bimdata-btn__fill bimdata-btn__fill--high bimdata-btn__radius"
            >
              <BIMDataIcon name="delete" fill color="default" size="xxs" />
            </BIMDataButton>
          </template>
        </BIMDataCard>
      </div>
    </BIMDataResponsiveGrid>
  </div>
</template>

<script>
import {
  BIMDataResponsiveGrid,
  BIMDataCard,
  BIMDataButton,
  BIMDataIcon,
  BIMDataSearch,
} from "@bimdata/design-system";
// import AddruleReflect from "@/plugins/reflect/src/rules/AddruleReflect";

export default {
  name: "Rules",
  components: {
    BIMDataCard,
    BIMDataResponsiveGrid,
    BIMDataButton,
    BIMDataIcon,
    BIMDataSearch,
  },
  props: {
    active_initialisation: { type: Boolean, required: true },
    access_token: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    rules: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      queryString: "",
      shareUrl: null,
      activeAddrule: null,
      loading: false,
      listAutoComplete: [
        { name: "Name", type: 1994 },
        { name: "BaseQuantities.*", type: 1972 },
        { name: "Pset_WallCommon.*", type: 1972 },
        { name: "Pset_WindowCommon.*", type: 1972 },
        { name: "Pset_DoorCommon.*", type: 1972 },
        { name: "Pset_SpaceCommon.*", type: 1972 },
        { name: "Pset_StairCommon.*", type: 1972 },
        { name: "Pset_SlabCommon.*", type: 1972 },
        { name: "Pset_MaterialCommon.*", type: 1972 },
      ],
    };
  },
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
  },
  created() {
    console.log("rulesTab created access_token", this.access_token);
    // this.rules = this.getrules();
    // console.log("rulesTab created getrules", this.getrules());

    this.loading = false;
  },
  mounted() {
    console.log("rulesTab mounted access_token", this.access_token);
  },
  onOpen() {
    // this.rules = this.getrules();
    // console.log("rulesTab onOpen getrules", this.getrules());
  },
  methods: {
    async clear() {
      this.queryString = "";
    },

    updateParent(rule_created) {
      this.activeAddrule = !rule_created;
    },

    headers() {
      return {
        Authorization: "Bearer " + this.access_token,
        "Content-Type": "application/json",
      };
    },

    initrule() {
      this.$emit("reflect-connected-method", "");
    },

    async fetchData(ruleType, queryStr) {
      let postData;

      if (ruleType === "nlp") {
        const queryBuilder = {
          query: queryStr,
          type_rule: ruleType,
          attributes: "",
        };
        postData = {
          project_id: this.projectId,
          queryBuilder,
        };
      }

      if (ruleType === "reflect") {
        const queryBuilder = {
          attributes: "BaseQuantities.*",
          query: queryStr,
          type_rule: ruleType,
        };
        postData = {
          project_id: this.projectId,
          queryBuilder,
        };
      }

      return postData;
    },

    handleClick(event) {
      console.log("handleClick", event);

      let rule_type;

      const regex = /^[.|@]/g;

      if (regex.test(this.queryString)) {
        rule_type = "reflect";
      } else {
        rule_type = "nlp";
      }

      if (rule_type) {
        this.fetchData(rule_type, this.queryString)
          .then(res => {
            const fetchRunRule = async queryBuilder => {
              console.log("handleClick fetchRunRule", queryBuilder);
              return await this.runQuery( queryBuilder);
            };

            fetchRunRule(res.queryBuilder).then(res => {
              console.log("handleClick fetchRunRule", res);
            });
          })
      }
    },
    async runQuery(queryBuilder) {
      console.log("=======RUN QUERY======", queryBuilder);

      const res = await fetch(`${this.reflect_url}/reflect/project/${this.projectId}/rule`, {
        headers: this.headers(),
        body: JSON.stringify(queryBuilder),
        method: "POST",
      }).then(result => console.log(result))
        .catch(error => console.log("error", error));
      const json = await res.json();
      return json;
    },
  },
};
</script>

<style lang="scss" scoped>
.rule-cards {
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  .rule-card {
    flex-basis: 48%;
    &:not(:first-child, :nth-child(2)) {
      margin-top: 12px;
    }
    cursor: pointer;
    h4 {
      margin: 12px 0;
      text-align: center;
      font-weight: normal;
      word-break: break-word;
      color: var(--color-granite-light);
      font-size: 14px;
      line-height: 15px;
    }
    .rule-card_logo {
      height: 20px;
      display: flex;
      align-items: flex-start;
      img {
        max-height: 15px;
        max-width: 80px;
      }
    }
    .rule-card_img {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 80%;
      }
    }
  }
}
.rule-list {
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: 6px 12px;
  position: absolute;
  z-index: 1;
  width: 100%;
  left: 0;
  top: calc(44px + 4px);
  li {
    margin: 6px 0;
    display: flex;
    color: var(--color-granite);
    font-size: 12px;
    line-height: 16px;
    position: relative;
    & > div {
      margin-right: 6px;
    }
    &.error {
      color: var(--color-high);
    }
    input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      margin: 0;
      cursor: pointer;
    }
  }
}
</style>
