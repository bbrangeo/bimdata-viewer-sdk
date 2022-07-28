<template>
  <div class="rule-tab">
    <BIMDataSearchAutocomplete
      v-show="modeAdmin"
      placeholder="Search properties of type"
      :items="arrayTypesIfc"
      @item-click="onItemClick"
      @all-results-click="onAllResultsClick"
      :loading="isLoading"
      class="m-t-24 bimdata-search-autocomplete bimdata-search-autocomplete__input"
    >
      <template #logoPlaceholder>
        <BIMDataIcon name="doubleChevron" fill color="default" size="xxs" />
      </template>
    </BIMDataSearchAutocomplete>
    <BIMDataSelect
      class="m-24"
      v-show="modeAdmin"
      :multi="true"
      width="200px"
      label="Selector output properties"
      :options="arrayProperties"
      v-model="selectionProperties"
    />
    <BIMDataDropdownList
      :list="arrayProperties"
      :perPage="10"
      elementKey="dropdown"
      :disabled="false"
      :closeOnElementClick="false"
      @element-click="onPropertiesClick"
    >
      <template #header> Properties </template>
      <template #element="{ element, close }">
        <div class="flex items-center">
          <BIMDataCheckbox
            size="xxxs"
            class="fill-primary"
            margin="0 6px 0 0"
            :state="false"
            :modelValue="selectedItem === element"
            @update:modelValue="updateValue(element, $event)"
          />
          <span @click="close()">{{ element }}</span>
        </div>
      </template>
    </BIMDataDropdownList>
    <BIMDataSearch
      width="100%"
      :placeholder="$t('ReflectPlugin.search')"
      class="bimdata-search-bar__radius bimdata-search-bar__secondary"
      v-model="queryString"
      @enter="handleClick"
      :clear="true"
      :autofocus="true"
      @clear="clear"
      @update:modelValue="testLark"
    ></BIMDataSearch>
    <!--    <AddruleReflect-->
    <!--      v-show="activeAddrule"-->
    <!--      v-on:rule-method="updateParent"-->
    <!--      :access_token="access_token"-->
    <!--    />-->
    <BIMDataButton
      icon
      @click="clearViewer"
      color="primary"
      fill
      rounded
      size="xxs"
      class="m-t-6 bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
    >
      <BIMDataIcon name="reset" size="xxs" />
    </BIMDataButton>
    <BIMDataResponsiveGrid
      itemWidth="250px"
      rowGap="6px"
      columnGap="18px"
      v-show="!activeAddrule"
    >
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
    <BIMDataTable
      @row-selected="onObjectSelected"
      @row-unselected="onObjectDeSelected"
      @all-selected="onObjectsSelected"
      @all-unselected="onObjectsDeSelected"
      :columns="columns"
      :rows="rows"
      :rowHeight="20"
      :tableWidth="100"
      :selectable="true"
      :paginated="true"
      :perPage="8"
      placeholder="Empty"
      v-show="showing_table && !loading"
      style="overflow: auto; font-size: 0.7rem"
      class="bimdata-table__container"
    >
      <!--    <template #cell-rule="{ row }">-->
      <!--      <ViewLinkCell :rule="row" />-->
      <!--    </template>-->
      <!--      <template v-else #cell-globalid="{ row }">-->
      <!--        <ViewLinkCell :rule="rule" />-->
      <!--      </template>-->
    </BIMDataTable>
    <div v-show="loading" class="loading">
      <BIMDataSpinner message="Calculate ..." />
    </div>
  </div>
</template>

<script>
import {
  BIMDataResponsiveGrid,
  BIMDataCard,
  BIMDataButton,
  BIMDataIcon,
  BIMDataSearchAutocomplete,
  BIMDataTable,
  BIMDataSpinner,
  BIMDataDropdownList,
  BIMDataCheckbox,
  BIMDataSelect,
  BIMDataSearch,
} from "@bimdata/design-system";
// import AddruleReflect from "@/plugins/reflect/src/rules/AddruleReflect";
// import ViewLinkCell from "@/plugins/reflect/src/rules/ViewLinkCell";
import _ from "lodash";
import state from "../state";
import { get_parser, Token } from "@/plugins/reflect/src/my_parser.js";

export default {
  name: "Rules",
  components: {
    BIMDataCard,
    BIMDataResponsiveGrid,
    BIMDataButton,
    BIMDataIcon,
    BIMDataSearchAutocomplete,
    BIMDataSearch,
    BIMDataTable,
    BIMDataSelect,
    BIMDataSpinner,
    BIMDataDropdownList,
    BIMDataCheckbox,
  },
  props: {
    active_initialisation: { type: Boolean, required: true },
    // access_token: {
    //   type: String,
    //   required: true,
    // },
    projectId: {
      type: String,
      required: true,
    },
    rules: {
      type: Array,
      required: true,
    },
    modeAdmin: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      uuids: [],
      showing_table: false,
      reflectElementUuids: null,
      result_run_rule: null,
      color_white: "#FFFFFF",
      color_black: "#000000",
      color_tipee: "#A4C407",
      viewer3dPlugin: null,
      viewer2dPlugin: null,
      queryString: '.IfcSpace[Name *= "CH1"]',
      shareUrl: null,
      activeAddrule: null,
      isLoading: false,
      loading: false,
      selectedItem: null,
      rows: [],
      columns: [],
      properties: [],
      selectionProperties: ["BaseQuantities.*"],
      arrayProperties: [],
      arrayTypesIfc: [],
    };
  },
  computed: {
    reflect_url() {
      return "https://smarty.plateforme-tipee.com";
    },
  },
  watch: {},
  created() {
    // this.loading = true;
    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    // const viewer2dPlugin = this.$viewer.localContext.getPlugin("viewer2d");
  },
  mounted() {
    console.log("=======RULES MOUNTED======");
    this.arrayTypesIfc = this.getTypeOfUuids();
    console.log("=======RULES MOUNTED======");

  },
  onOpen() {
    // this.rules = this.getrules();
    // console.log("rulesTab onOpen getrules", this.getrules());
  },
  methods: {
    testLark(item) {
      let transformer = {
        number: ([n])  => parseFloat(n.value),
        string: ([s])  => s.value.slice(1, -1),
        array:  Array.from,
        pair:   Array.from,
        object: Object.fromEntries,

        null: () => null,
        true: () => true,
        false: () => false,
      }

      const parser = get_parser({transformer});
      function ignore_errors(e) {
        // This function gets called whenever there is a parse error

        if (e.token.type === "COMMA") {
          // Ignore a misplaced comma
          return true;
        } else if (e.token.type === "SIGNED_NUMBER") {
          // Unexpected number. Try to feed a comma and retry the number
          e.interactive_parser.feed_token(new Token("COMMA", ","));
          e.interactive_parser.feed_token(e.token);
          return true;
        }

        // Unhandled error. Will stop parse and raise exception
        return false;
      }
      console.log(parser.parse(item, null, ignore_errors));
    },
    getTypeOfUuids() {
      const arrayTypes = _.uniq(
        this.$viewer.state.objects.map(object => this.toIfcType(object.type))
      );
      return arrayTypes.map((element, index) => {
        const obj3 = {};
        obj3["id"] = index;
        obj3["title"] = element;
        // obj3["text"] = element;

        return obj3;
      });
    },
    onItemClick($event) {
      console.log($event);
      this.selectionProperties = [];
      this.handleProperties($event.title);
    },
    async handleProperties(title) {
      this.loading = true;
      this.arrayProperties = await this.getProperties(title);
      if (this.arrayProperties.length > 0) {
        this.properties = this.arrayProperties.map((element, index) => {
          const obj3 = {};
          obj3["id"] = index;
          obj3["title"] = element;
          // obj3["text"] = element;
          return obj3;
        });
      }
      console.log("=======GET PROPERTIES======", this.properties);
      this.loading = false;
    },
    async getProperties(title) {
      console.log("=======GET PROPERTIES======");
      let paramsString = "";
      paramsString = "?" + new URLSearchParams({ ifc_type: title });

      return await fetch(
        `${this.reflect_url}/reflect/project/${this.projectId}/properties` +
          paramsString,
        {
          headers: this.headers(),
          method: "GET",
        }
      )
        .then(response => response.json())
        .then(result => result[0].pset_qto)
        .catch(error => console.log("====ERROR GET PROPERTIES====", error));
    },
    onAllResultsClick($event) {
      console.log($event);
    },
    isLoadingChecked() {
      if (this.isLoading) {
        return ":loading='true'";
      }
    },

    updateValue(element, value) {
      console.log("=======updateValue======", element, value);
      this.selectedItem = element;
    },
    onPropertiesClick($event) {
      console.log("=======onPropertiesClick======", $event);
    },
    getUuids() {
      // return this.$viewer.state.models[0].objectsUuids;
      return [...this.$viewer.state.models[0].uuids.keys()];
    },
    difference() {
      return _.difference(this.getUuids(), this.reflectElementUuids);
    },
    intersection() {
      return _.intersection(this.getUuids(), this.reflectElementUuids);
    },

    async clear() {
      this.queryString = "";
    },
    clearData() {
      this.result_run_rule = [];
      this.rows = [];
      this.columns = [];
    },
    async clearViewer() {
      if (this.difference()) {
        this.$viewer.state.showObjectsByUuids(this.difference());
      }
      if (this.reflectElementUuids) {
        this.$viewer.state.deselectObjectsByUuids(this.reflectElementUuids);
        this.$viewer.state.colorizeObjectsByUuids(
          this.reflectElementUuids,
          null
        );
      }
      this.viewer3dPlugin.fitViewObjects(this.getUuids());
    },

    updateParent(rule_created) {
      this.activeAddrule = !rule_created;
    },

    toIfcType(s) {
      s = "Ifc_" + s;
      return s.replace(/([-_][a-z])/gi, $1 => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
      });
    },

    headers() {
      console.log("======HEADERS======", state);
      return {
        Authorization: "Bearer " + state.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    },

    onObjectsSelected(objects) {
      console.log("Do something: ", objects);
      this.$viewer.gobalContext.hub.on(
        "row-selected",
        ({ objects }) => {
          console.log("Do all-selected\t: ", objects);
        },
        {
          getLastEvent: true, // immediately trigger the callback with the last loaded ifcs if they exists.
        }
      );

      // const objects_uuid = objects.map(element => element.GlobalId);
      // this.$viewer.state.highlightObjectsByUuids(objects_uuid);
      // this.$viewer.state.selectObjectsByUuids(objects_uuid);
    },

    onObjectsDeSelected(objects) {
      const objects_uuid = objects.map(element => element.GlobalId);
      this.$viewer.state.unhighlightObjectsByUuids(objects_uuid);
      this.$viewer.state.deselectObjectsByUuids(objects_uuid);
    },

    onObjectSelected(object) {
      console.log("Do something: ", object.GlobalId);
      this.$viewer.state.highlightObjectsByUuids([object.GlobalId]);
      this.$viewer.state.selectObjectsByUuids([object.GlobalId]);
    },

    onObjectDeSelected(object) {
      console.log("Do something: ", object.GlobalId);

      this.$viewer.state.unhighlightObjectsByUuids([object.GlobalId]);
      this.$viewer.state.deselectObjectsByUuids([object.GlobalId]);
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
          // attributes: ["BaseQuantities.*", "Autre.*"],
          attributes: _.uniq(this.selectionProperties),
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

    initTableResults(options) {
      if (options.reset) {
        this.rows = [];
        this.columns = [];
      }

      this.rows = this.result_run_rule
        .map(rule => {
          const name_rule = rule.rule.name || "Query";
          return rule.result.map(elem => {
            return { Rule: name_rule, ...elem };
          });
        })
        .reduce(function (accumulateur, valeurCourante) {
          return accumulateur.concat(valeurCourante);
        });

      function remove_duplicates_es6(arr) {
        let s = new Set(arr);
        let it = s.values();
        return Array.from(it);
      }

      let keys = [];

      if (this.rows.length !== 0) {
        this.rows.map(elem => {
          return Object.keys(elem).forEach(item => {
            keys.push(item);
            return item;
          });
        });

        const uniqueKeys = remove_duplicates_es6(keys);

        uniqueKeys.forEach(item => {
          const innerObj = {
            id: item,
            label: item,
            // width: "20px",
            align: "center",
          };
          this.columns.push(innerObj);
        });
      }

      this.showing_table = true;
    },

    handleClick() {
      this.loading = true;

      this.$emit("reflect-connected-method", state.connected);

      if (state.connected) {
        this.clearViewer();
        this.clearData();
        let rule_type;

        const regex = /^[.|@]/g;

        if (regex.test(this.queryString)) {
          rule_type = "reflect";
        } else {
          rule_type = "nlp";
        }

        if (rule_type) {
          this.fetchData(rule_type, this.queryString).then(async res => {
            this.result_run_rule = await this.runQuery(res.queryBuilder);
            if (this.result_run_rule.length > 0) {
              console.log(
                "=======RUN QUERY RESULT RUN======",
                this.result_run_rule
              );
              // console.log("=======RUN UUIDS======", this.getUuids());
              // console.log("=======RUN DIFF======", this.difference());
              this.reflectElementUuids = [];
              this.result_run_rule.map(elem => {
                // search guid in object
                let filtered_keys = function (obj, filter) {
                  let keys = [];
                  for (let [key, value] of Object.entries(obj)) {
                    if (obj.hasOwnProperty(key) && filter.test(key)) {
                      keys.push(value);
                    }
                  }
                  return keys;
                };

                elem.result.map(result => {
                  this.reflectElementUuids.push(
                    filtered_keys(result, /guid|GlobalId|guids/)[0]
                  );
                });
              });

              console.log("=======RUN QUERY======", this.reflectElementUuids);

              this.initTableResults({ reset: false });

              this.viewer3dPlugin.fitViewObjects(this.reflectElementUuids);
              this.$viewer.state.hideObjectsByUuids(this.difference());

              // this.$viewer.state.highlightObjectsByUuids(
              //   this.reflectElementUuids
              // );
              // this.$viewer.state.highlightObjectsByUuids(
              //   this.difference()
              // );
              this.$viewer.state.colorizeObjectsByUuids(
                this.reflectElementUuids,
                this.color_tipee
              );
              // this.$viewer.state.selectObjectsByUuids(this.reflectElementUuids);
              // this.$viewer.state.hub.on(
              //   "objects-hidden",
              //   ({ objects }) => {
              //     console.log("Do something: ", objects);
              //   },
              //   {
              //     getLastEvent: true, // immediately trigger the callback with the last loaded ifcs if they exists.
              //   }
              // );
              this.loading = false;
            }
          });
        }
      }
    },

    async runQuery(queryBuilder) {
      console.log("=======RUN QUERY======", queryBuilder);
      return await fetch(
        `${this.reflect_url}/reflect/project/${this.projectId}/rule`,
        {
          headers: this.headers(),
          body: JSON.stringify(queryBuilder),
          method: "POST",
        }
      )
        .then(response => response.json())
        // .then(result => JSON.parse(result.replace(/\bNaN\b/g, "null")))
        .catch(error => console.log("====ERROR RUN QUERY====", error));
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
