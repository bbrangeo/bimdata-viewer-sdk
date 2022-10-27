<template>
  <div class="rule-tab">
    <BIMDataSearchAutocomplete
      v-show="modeAdmin"
      placeholder="Search properties of type"
      :items="arrayTypesIfc"
      @item-click="onItemClick"
      @all-results-click="onAllResultsClick"
      :loading="isLoading"
      :autoclear="false"
      class="m-t-24 bimdata-search-autocomplete bimdata-search-autocomplete__input"
    >
      <template #logoPlaceholder>
        <BIMDataIcon name="doubleChevron" fill color="default" size="xxs" />
      </template>
    </BIMDataSearchAutocomplete>
    <BIMDataSelect
      v-show="modeAdmin"
      class="m-24"
      :multi="true"
      width="200px"
      label="Selector output properties"
      :options="arrayProperties"
      v-model="selectionProperties"
    />
    <!--    <BIMDataDropdownList-->
    <!--      :list="arrayProperties"-->
    <!--      :perPage="10"-->
    <!--      elementKey="dropdown"-->
    <!--      :disabled="false"-->
    <!--      :closeOnElementClick="false"-->
    <!--      @element-click="onPropertiesClick"-->
    <!--    >-->
    <!--      <template #header> Properties </template>-->
    <!--      <template #element="{ element, close }">-->
    <!--        <div class="flex items-center">-->
    <!--          <BIMDataCheckbox-->
    <!--            size="xxxs"-->
    <!--            class="fill-primary"-->
    <!--            margin="0 6px 0 0"-->
    <!--            :state="false"-->
    <!--            :modelValue="selectedItem === element"-->
    <!--            @update:modelValue="updateValue(element, $event)"-->
    <!--          />-->
    <!--          <span @click="close()">{{ element }}</span>-->
    <!--        </div>-->
    <!--      </template>-->
    <!--    </BIMDataDropdownList>-->
    <BIMDataSearch
      v-show="modeAdmin"
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
    <!--    <BIMDataModelPreview-->
    <!--      type="3d"-->
    <!--      :width="300"-->
    <!--      :height="300"-->
    <!--      backgroundColor="var(&#45;&#45;color-silver-light)"-->
    <!--    />-->
    <!--    <AddruleReflect-->
    <!--      v-show="activeAddRule"-->
    <!--      v-on:rule-method="updateParent"-->
    <!--      :access_token="access_token"-->
    <!--    />-->

    <BIMDataResponsiveGrid
      itemWidth="250px"
      rowGap="6px"
      columnGap="18px"
      v-show="!activeAddRule"
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

    <div class="button" id="my_centered_buttons" v-show="!modeAdmin">
      <BIMDataButton
        icon
        @click="handleClickPackage"
        color="secondary"
        outline
        size="xs"
        class="m-6 m-r-18"
        :disabled="loading"
      >
        <BIMDataIcon size="xs" name="chevron" margin="0 2px 0 0" />
        <span>Lancement cahier des charges</span>
      </BIMDataButton>
      <BIMDataButton
        icon
        @click="clearViewer"
        color="high"
        outline
        size="xs"
        class="m-6 m-r-18"
      >
        <BIMDataIcon name="reset" size="xs" margin="0 2px 0 0" />
        <span>Effacer</span>
      </BIMDataButton>
    </div>

    <BIMDataTable
      :columns="columnsValidationGenerale"
      :rows="rowsValidationGenerale"
      :rowHeight="20"
      :selectable="false"
      :paginated="true"
      :perPage="20"
      placeholder="Aucune règles"
      v-show="showing_table_ValidationGenerale && !loading"
      style="overflow: auto; font-size: 0.7rem"
      class="m-t-12 bimdata-table__container"
    >
      <template #cell-validation_finale="{ row }">
        <div class="cell_valid" v-if="row.validation_finale === '100.0%'">
          <span>{{ row.validation_finale }}</span>
        </div>
        <div class="cell_novalid" v-else>
          <span>{{ row.validation_finale }}</span>
        </div>
      </template>
      <!--      <template v-else #cell-globalid="{ row }">-->
      <!--        <ViewLinkCell :rule="rule" />-->
      <!--      </template>-->
    </BIMDataTable>
    <BIMDataTable
      :columns="columnsResultData"
      :rows="rowsResultData"
      :rowHeight="20"
      :selectable="true"
      @row-selected="onObjectSelected"
      @row-unselected="onObjectDeSelected"
      @all-selected="onObjectsSelected"
      @all-unselected="onObjectsDeSelected"
      :paginated="true"
      :perPage="20"
      placeholder="Aucune règles => (Veuillez appuyer sur le bouton Lancement cahier des charges)"
      v-show="!showing_table_ValidationGenerale && !loading"
      style="overflow: auto; font-size: 0.7rem"
      class="m-t-12 bimdata-table__container"
    >
    </BIMDataTable>

    <div v-show="showing_table_ValidationGenerale && !loading">
      <span>Exporter le tableau complet au format Excel :</span>
      <BIMDataButton
        v-show="showing_table_ValidationGenerale && !loading"
        icon
        @click="handleXLSDownload"
        color="primary"
        fill
        rounded
        size="xxs"
        class="m-t-6 bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      >
        <BIMDataIcon name="export" fill size="xxs" />
      </BIMDataButton>
      <span>Exporter le BCF au format xml:</span>
      <BIMDataButton
        v-show="showing_table_ValidationGenerale && !loading"
        icon
        @click="handleBCFDownload"
        color="primary"
        fill
        rounded
        size="xxs"
        class="m-t-6 bimdata-btn__fill bimdata-btn__fill--primary bimdata-btn__radius"
      >
        <BIMDataIcon name="bcf" fill size="xxs" />
      </BIMDataButton>
    </div>

    <!--    <div v-show="loading" class="loading">-->
    <!--      <BIMDataBigSpinner size="xs" message="Calculate ..." />-->
    <!--    </div>-->
    <div v-show="loading" class="loading">
      <BIMDataLoading
        subMessage="Transfert des informations de TIPEE vers BIMData"
        message="Calcul ..."
      >
        <template #toto>
          <BIMDataIcon name="doubleChevron" fill color="default" size="xxs" />
        </template>
      </BIMDataLoading>
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
  BIMDataLoading,
  // BIMDataDropdownList,
  // BIMDataCheckbox,
  BIMDataSelect,
  BIMDataSearch,
  // BIMDataModelPreview
} from "@bimdata/design-system";
import _ from "lodash";
import state from "../state";
import { get_parser, Token } from "@/plugins/reflect/src/my_parser.js";
import fileSaver from "file-saver";
import * as ExcelImport from "exceljs/dist/exceljs.min.js";
import autofitColumns from "@/plugins/reflect/src/functions_exceljs";
import iconTipee from "@/plugins/reflect/assets/tipee.png";
import iconReflect from "@/plugins/reflect/assets/reflect.png";
import iconRivp from "@/plugins/reflect/assets/rivp.png";

let ExcelJS;
if (ExcelImport.default) {
  ExcelJS = ExcelImport.default;
} else {
  ExcelJS = ExcelImport;
}

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
    BIMDataLoading,
    // BIMDataModelPreview
    // BIMDataDropdownList,
    // BIMDataCheckbox,
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
      showing_table_ValidationGenerale: false,
      showing_table_Result: false,
      reflectElementUuids: null,
      reflectElementUuidsNotValid: null,
      result_run_rule: null,
      color_white: "#FFFFFF",
      color_black: "#000000",
      color_tipee: "#A4C407",
      color_not_valid: "#C40707FF",
      viewer3dPlugin: null,
      viewer2dPlugin: null,
      viewerBCFPlugin: null,
      apiBcfClient: null,
      queryString: '.IfcSpace[Name *= "CH1"]',
      shareUrl: null,
      activeAddRule: null,
      isLoading: false,
      loading: false,
      selectedItem: null,
      rowsResultData: [],
      columnsResultData: [],
      rowsValidationGenerale: [],
      columnsValidationGenerale: [],
      properties: [],
      selectionProperties: ["BaseQuantities.*"],
      arrayProperties: [],
      arrayTypesIfc: [],
      fileNameExport: "Results_",
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
    // const viewer2dPlugin = this.$viewer.localContext.getPlugin("viewer2d");    this.viewer3dPlugin = this.$viewer.globalContext.getPlugins("viewer3d")[0];
    this.viewerBCFPlugin =
      this.$viewer.globalContext.getPlugins("bcfManager")[0];
    this.apiBcfClient = new this.$viewer.api.apiClient.BcfApi();
  },
  mounted() {
    console.log("=======RULES MOUNTED======");
    this.arrayTypesIfc = this.getTypeOfUuids();
    // console.log("=======RULES IFC TYPES======", this.arrayTypesIfc);

    console.log("=======RULES MOUNTED======");
  },
  onOpen() {
    // this.rules = this.getrules();
    // console.log("rulesTab onOpen getrules", this.getrules());
  },
  methods: {
    testLark(item) {
      let transformer = {
        number: ([n]) => parseFloat(n.value),
        string: ([s]) => s.value.slice(1, -1),
        array: Array.from,
        pair: Array.from,
        object: Object.fromEntries,

        null: () => null,
        true: () => true,
        false: () => false,
      };
      const parser = get_parser({ transformer });
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
      // console.log(parser.parse(item, null, ignore_errors));
      try {
        const lark_object = parser.parse(item, null, ignore_errors);
        const class_selector = this.recurse_lark(lark_object);
      } catch (error) {
        console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }
    },
    recurse_lark(lark_object) {
      // give me leboncoin a renaut car

      console.log(lark_object);
      let class_selector;
      if (lark_object.data === "class_selector") {
        class_selector = lark_object.children[0].value;
        this.handleProperties(class_selector);

        return class_selector;
      }
      if (lark_object.children) {
        return this.recurse_lark(lark_object.children[0]);
      }
    },
    getTypeOfUuids() {
      const arrayTypes = _.uniq(
        this.$viewer.state.objects.map(object => this.toIfcType(object.type))
      );
      // console.log("=======RULES IFC TYPES====== ", this.$viewer.state.objects);
      // console.log("=======RULES IFC TYPES====== ", arrayTypes);

      return arrayTypes.map((element, index) => {
        const obj3 = {};
        obj3["id"] = index;
        obj3["title"] = element;
        // obj3["text"] = element;

        return obj3;
      });
    },
    toIfcType(s) {
      s = "Ifc_" + s;
      return s.replace(/([-_][a-z])/gi, $1 => {
        return $1.toUpperCase().replace("-", "").replace("_", "");
      });
    },
    onItemClick($event) {
      this.selectionProperties = [];
      this.handleProperties($event.title);
    },
    async downloadBlobAs(name, blob) {
      const { URL } = window;
      const link = document.createElement("a");
      link.rel = "noopener";
      link.download = name;
      // Create object url from blob
      link.href = URL.createObjectURL(blob);

      // Trigger "Save As" dialog
      setTimeout(() => link.click(), 0);
      // Revoke object url after 40 seconds
      setTimeout(() => URL.revokeObjectURL(link.href), 4e4);
    },
    async handleBCFDownload() {
      this.loading = true;
      const response = await this.apiBcfClient.downloadBcfExport(
        this.$viewer.api.projectId
      );

      if (response) {
        // await this.downloadBlobAs("BCF.bcfzip", response);
        const fileName =
          this.fileNameExport +
          new Date().getHours() +
          ":" +
          new Date().getMinutes() +
          ":" +
          new Date().getSeconds() +
          ".bcfzip";
        fileSaver.saveAs(response, "BCF_" +fileName );
      }

      this.loading = false;
    },
    async handleXLSDownload() {
      this.loading = true;
      const sizeColumns = this.columnsResultData.length;
      let workbook = new ExcelJS.Workbook();
      workbook.creator = "Reflect";
      workbook.lastModifiedBy = "Reflect";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();
      workbook.calcProperties.fullCalcOnLoad = true;

      const uniqueRule = [
        ...new Set(this.rowsResultData.map(item => item.code_regle)),
      ];

      let ws = workbook.addWorksheet("REFLECT", {
        headerFooter: { firstHeader: "REFLECT", firstFooter: "REFLECT EXPORT" },
        properties: { tabColor: { argb: "FF63BE7B" } },
        // pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 36.67 },
      });

      const getData = async url => {
        // const res = await axios.get(window.location.origin + url, { responseType: 'arraybuffer' });
        const res = await fetch(window.location.origin + url).then(response =>
          response.arrayBuffer()
        );
        return res;
      };

      // add image to workbook by buffer
      const imageTipee = workbook.addImage({
        buffer: getData(iconTipee),
        // filename: iconTipee,
        extension: "png",
      });

      const imageReflect = workbook.addImage({
        buffer: getData(iconReflect),
        extension: "png",
      });

      const imageRivp = workbook.addImage({
        buffer: getData(iconRivp),
        extension: "png",
      });

      // insert an image over A1:D6
      ws.addImage(imageRivp, "A1:B2");
      // ws.addImage(imageTipee, "M1:Q6");
      ws.addImage(imageReflect, "I1:K2");

      ws.mergeCells("C2:G2");
      const C2 = ws.getCell("C2");
      C2.value =
        "CONTRÔLE DES MAQUETTES NUMERIQUES SUR LA BASE DU CAHIER DE PRECONISATIONS";
      C2.style.font = {
        bold: true,
        color: { argb: "000000" },
        family: 2,
        size: 18,
        name: "Calibri Light (En-têtes)",
      };
      C2.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
        // shrinkToFit: true,
      };

      // ws.addConditionalFormatting({
      //   ref: "C18:O35",
      //   rules: [
      //     {
      //       type: "expression",
      //       formulae: ["MOD(ROW()+COLUMN(),1)=0"],
      //       style: {
      //         fill: {
      //           type: "pattern",
      //           pattern: "solid",
      //           bgColor: { argb: "FFD9D9D9" },
      //         },
      //         border: {
      //           bottom: { style: "medium", color: { argb: "FFD9D9D9" } },
      //         },
      //         font: { bold: true },
      //       },
      //     },
      //   ],
      // });

      // add a table to a sheet
      ws.addTable({
        name: "MyTable",
        ref: "C18",
        headerRow: true,
        totalsRow: true,
        style: {
          theme: "TableStyleLight1",
          showRowStripes: true,
          font: {
            bold: true,
            color: { argb: "000000" },
            family: 2,
            size: 28,
            name: "Calibri Light (En-têtes)",
          },
          // alignment: {
          //   // wrapText: true
          //   shrinkToFit: true,
          // },
        },
        columns: [
          { name: "numero_chapitre", filterButton: false, width: 40 },
          { name: "titre", filterButton: false, width: 40 },
          { name: "code_regle", filterButton: false, width: 40 },
          {
            name: "validation_finale",
            filterButton: false,
            width: 40,
          },
        ],
        rows: this.rowsValidationGenerale.map(item => {
          return Object.values(item);
        }),
      });

      const uniqueWs = uniqueRule.map(item => {
        const name_ws = item;
        // Create worksheets with headers and footers
        let ws = workbook.addWorksheet(name_ws, {
          headerFooter: {
            firstHeader: `${name_ws}`,
            firstFooter: `${name_ws} EXPORT`,
          },
        });

        // adjust properties afterwards (not supported by worksheet-writer)
        ws.properties.outlineLevelCol = 2;
        ws.properties.defaultRowHeight = 15;

        // Set the left footer to 18px and italicize. Result: "Page 2 of 16"
        ws.headerFooter.oddFooter = "&LPage &P of &N";

        // Set the left, center, and right text of the footer. Result: “Exceljs” in the footer left. “demo.xlsx” in the footer center. “Page 2” in the footer right
        ws.headerFooter.oddFooter = "&LREFLECT&C&F&RPage &P";

        // ws.autoFilter = `A2:B${sizeColumns}`;

        // Set an auto filter from D3 to the
        // cell in row 7 and column 5
        ws.autoFilter = {
          from: "A1",
          to: {
            row: 1,
            column: sizeColumns,
          },
        };

        // add a checkerboard pattern to A1:E7 based on row + col being even or odd
        ws.addConditionalFormatting({
          ref: "A2:BP1016",
          rules: [
            // {
            //      type: 'expression',
            //      formulae: ['MOD(ROW()+COLUMN(),1)=0'],
            //      style: {
            //           fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFD9D9D9' } },
            //           border: { bottom: { style: 'medium', color: { argb: 'FFD9D9D9' } } },
            //           font: { bold: true , },
            //      },
            // },
            // {
            //      type: 'expression',
            //      formulae: ['MOD(ROW()+COLUMN(),1)=0'],
            //      style: {
            //           fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFD9D9D9' } },
            //           border: { bottom: { style: 'medium', color: { argb: 'FFD9D9D9' } } },
            //           font: { bold: true , },
            //      },
            // },
            // {
            //      type: 'colorScale',
            //      cfvo: ['true','false'],
            //      style: {fill: {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FF00FF00'}}},
            // },
            // {
            //   type: "iconSet",
            //   iconSet: "3TrafficLights",
            //   cfvo: [
            //     { type: "percent", value: 0 },
            //     { type: "num", value: "COLUMN()" },
            //     // { type: 'num', value: 'ROW()' },
            //   ],
            // },
            // {
            //      type: 'iconSet',
            //      iconSet: '5Arrows',
            //      cfvo: [
            //           { type: 'percent', value: 0 },
            //           { type: 'percent', value: 20 },
            //           { type: 'percent', value: 40 },
            //           { type: 'percent', value: 60 },
            //           { type: 'percent', value: 80 },
            //      ],
            // },
            {
              type: "colorScale",
              cfvo: [{ type: "min" }, { type: "max" }],
              color: [{ argb: "FFF8696B" }, { argb: "FF63BE7B" }],
            },
            // {
            //      type: 'containsText',
            //      operator: 'containsBlanks',
            //      style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: '0000FF' }, fgColor: { argb: 'FFFFFF' } } },
            // },
            {
              type: "containsText",
              operator: "containsText",
              text: "true",
              style: {
                fill: {
                  type: "pattern",
                  pattern: "solid",
                  bgColor: { argb: "FF63BE7B" },
                  fgColor: { argb: "FFFFFF" },
                },
              },
            },
            {
              type: "containsText",
              operator: "containsText",
              text: "false",
              style: {
                fill: {
                  type: "pattern",
                  pattern: "solid",
                  bgColor: { argb: "FFF8696B" },
                  fgColor: { argb: "FFFFFF" },
                },
              },
            },
          ],
        });

        return { name: item, ws: ws };
      });

      const columnsFormat = [];
      const toDownload = this.columnsResultData.map(r => {
        const exelCol = {
          header: r.label,
          width: Math.max(20, r.label.length + 2),
        };
        if (r.downloadFormatter !== null) {
          columnsFormat.push(exelCol);
        }
        return {
          formatter: r.downloadFormatter,
          name: r.label,
          exelCol: exelCol,
        };
      });

      const rows = [];
      // Sanitize data that is impossible to serialize
      this.rowsResultData.forEach((r, index) => {
        const row = [];
        // row["id"]=index;

        for (const [k, v] of Object.entries(r)) {
          // const cData = toDownload[i];
          // if (cData.formatter === null) {
          //   return;
          // }

          let formatter = function (d) {
            // if (typeof d === "object") {
            //   return "";
            // }
            if (typeof d == "boolean") {
              return d === true ? "true" : "false";
            }
            return d;
          };
          const formatted = formatter(v);
          // cData.exelCol.width = Math.max(
          //   cData.exelCol.width,
          //   formatted.toString().length + 2
          // );
          row.push(formatted);
          // row[k]=formatted;
        }
        rows.push(row);
      });

      // Remove the first Element from an Array
      // columnsFormat.shift();

      uniqueWs.forEach(unique_worksheet => {
        autofitColumns(unique_worksheet.ws);

        unique_worksheet.ws.columns = columnsFormat;

        unique_worksheet.ws.eachRow(r =>
          r.eachCell(cell => {
            // const numFmtStr = '0,00';
            // cell.numFmt = numFmtStr;
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            cell.font = {
              bold: false,
              name: "Calibri Light (Corps)",
              color: { argb: "000000" },
              family: 2,
              size: 12,
            };
          })
        );
        // Apply styles to the header row
        unique_worksheet.ws.getRow(1).eachCell(cell => {
          cell.fill = {
            type: "pattern",
            pattern: "lightGrid",
            fgColor: { argb: "d3d3d3" },
            bgColor: { argb: "ffffff" },
          };
          cell.font = {
            bold: true,
            name: "Calibri Light (Corps)",
            color: { argb: "000000" },
            family: 2,
            size: 14,
          };
        });
      });

      rows.forEach((row, index) => {
        const ws_current = uniqueWs.find(x => x.name === row[2]);
        // const ws_current = uniqueWs.find(x => x.name === row["code_regle"]);
        // // Remove the first Element from an Array
        // row.shift();
        // console.log("remove_fist_elem", row )
        ws_current.ws.addRow(row);
      });

      // workbook.xlsx.writeBuffer().then((b) => FileSaver.saveAs(new Blob([b], { type: 'application/octet-stream' }), 'Report.xlsx'));
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fileSaver.saveAs(
        blob,
        this.fileNameExport +
          new Date().getHours() +
          ":" +
          new Date().getMinutes() +
          ":" +
          new Date().getSeconds() +
          ".xlsx"
      );
      this.loading = false;
    },
    async handleProperties(title) {
      this.loading = true;
      this.arrayProperties = await this.getProperties(title);
      if (this.arrayProperties && this.arrayProperties.length > 0) {
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
    async getProperties(type) {
      console.log("=======GET PROPERTIES======");
      let paramsString = "";
      paramsString = "?" + new URLSearchParams({ ifc_type: type });

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
    async clearData() {
      console.log("clearData", this.$viewer.api.projectId);
      this.result_run_rule = [];
      this.rowsResultData = [];
      this.columnsResultData = [];
      this.rowsValidationGenerale = [];
      this.columnsValidationGenerale = [];
      // clear all bcf
      try {
        const topics = await this.apiBcfClient.getTopics(
          this.$viewer.api.projectId
        );
        // const fullTopics = await this.apiBcfClient.getFullTopics(
        //   this.$viewer.api.projectId
        // );
        console.log("COCUCO");

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
    async clearViewer() {
      await this.clearData();

      if (this.difference()) {
        this.$viewer.state.showObjectsByUuids(this.difference());
      }
      if (this.reflectElementUuids) {
        this.$viewer.state.deselectObjectsByUuids(
          this.reflectElementUuidsNotValid
        );
        this.$viewer.state.colorizeObjectsByUuids(
          this.reflectElementUuidsNotValid,
          null
        );
      }
      this.viewer3dPlugin.fitViewObjects(this.getUuids());
    },

    updateParent(rule_created) {
      this.activeAddRule = !rule_created;
    },

    headers() {
      // console.log("======HEADERS======", state);
      return {
        Authorization: "Bearer " + state.accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    },

    onObjectsSelected(objects) {
      console.log("Do something all-selected: ", objects);
      this.$viewer.globalContext.hub.on(
        "all-selected",
        ({ objects }) => {
          console.log("Do all-selected\ all-selected: ", objects);
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
      console.log("Do something onObjectsDeSelected : ", objects);
      if (objects) {
        const objects_uuid = objects.map(element => element.guid);
        this.$viewer.state.unhighlightObjectsByUuids(objects_uuid);
        this.$viewer.state.deselectObjectsByUuids(objects_uuid);
      }
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
        this.rowsResultData = [];
        this.rowsValidationGenerale = [];
        this.columnsValidationGenerale = [];
        this.columnsResultData = [];
      }
      console.log(this.result_run_rule);

      this.rowsResultData = this.result_run_rule
        .map(rule => {
          // const name_rule = rule.rule.name || "Query";
          return rule.result.map(elem => {
            return { ...elem };
          });
        })
        .reduce(function (accumulateur, valeurCourante) {
          return accumulateur.concat(valeurCourante);
        });

      this.rowsValidationGenerale = this.result_run_rule
        .map(rule => {
          return rule.validation_generale.map(elem => {
            return { ...elem };
          });
        })
        .reduce(function (accumulateur, valeurCourante) {
          return accumulateur.concat(valeurCourante);
        });

      // console.log("rowsValidationGenerale", this.rowsValidationGenerale);

      function remove_duplicates_es6(arr) {
        let s = new Set(arr);
        let it = s.values();
        return Array.from(it);
      }

      let keysResultData = [];
      let keysValidationGenerale = [];

      if (this.rowsResultData.length !== 0) {
        this.rowsResultData.map(elem => {
          return Object.keys(elem).forEach(item => {
            keysResultData.push(item);
            return item;
          });
        });

        const uniqueKeysResultData = remove_duplicates_es6(keysResultData);

        uniqueKeysResultData.forEach(item => {
          const innerObj = {
            id: item,
            label: item,
            // width: "20px",
            align: "center",
          };
          this.columnsResultData.push(innerObj);
        });
        this.showing_table_Result = true;
      }

      if (this.rowsValidationGenerale.length !== 0) {
        this.rowsValidationGenerale.map(elem => {
          return Object.keys(elem).forEach(item => {
            keysValidationGenerale.push(item);
            return item;
          });
        });

        const uniqueKeysValidationGenerale = remove_duplicates_es6(
          keysValidationGenerale
        );

        uniqueKeysValidationGenerale.forEach(item => {
          const innerObj = {
            id: item,
            label: item,
            // width: "20px",
            align: "center",
          };
          this.columnsValidationGenerale.push(innerObj);
        });
        this.showing_table_ValidationGenerale = true;
      }
    },

    async createBCF(row) {
      const title = `${row.code_regle} `;
      let description = `Please validate ${row.title} ${row.code_regle}`;
      const type = `Reflect RIVP`;
      const data = {
        title,
        description,
        topic_type: type,
        topic_status: "Opened",
        labels: ["Reflect"],
        priority: "10",
        assigned_to: "RIVP",
        viewpoints: [
          {
            components: {
              coloring: [
                {
                  color: "#193f9e",
                  components: [
                    {
                      ifc_guid: row.guid,
                      originating_system: "ReflectPlugin",
                    },
                  ],
                },
              ],
              visibility: {
                default_visibility: true,
                exceptions: [
                  {
                    ifc_guid: row.guid,
                    originating_system: "ReflectPlugin",
                  },
                ],
                view_setup_hints: {
                  spaces_visible: false,
                  space_boundaries_visible: false,
                  openings_visible: false,
                },
              },
              selection: [
                {
                  ifc_guid: row.guid,
                  originating_system: "ReflectPlugin",
                },
              ],
            },
          },
        ],
      };

      await this.apiBcfClient.createFullTopic(this.$viewer.api.projectId, data);

      this.$viewer.localContext.hub.emit("alert", {
        type: "success",
        message: "BCF created",
      });
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
              // console.log(
              //   "=======RUN QUERY RESULT RUN======",
              //   this.result_run_rule
              // );
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

              // console.log("=======RUN QUERY======", this.reflectElementUuids);

              this.initTableResults({ reset: false });

              this.viewer3dPlugin.fitViewObjects(this.reflectElementUuids);
              this.$viewer.state.hideObjectsByUuids(this.difference());

              // this.$viewer.state.highlightObjectsByUuids(
              //   this.reflectElementUuids
              // );
              // this.$viewer.state.highlightObjectsByUuids(
              //   this.difference()
              // );
              // this.$viewer.state.colorizeObjectsByUuids(
              //   this.reflectElementUuids,
              //   this.color_tipee
              // );
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
    async handleClickPackage() {
      this.loading = true;

      if (state.connected) {
        await this.clearViewer();
      }

      this.result_run_rule = await this.runPackage();
      if (this.result_run_rule.length > 0) {
        // console.log("=======RUN QUERY RESULT RUN======", this.result_run_rule);
        // console.log("=======RUN UUIDS======", this.getUuids());
        // console.log("=======RUN DIFF======", this.difference());
        this.reflectElementUuids = [];
        this.reflectElementUuidsNotValid = [];
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
            if (result.guid && result.validation_finale === false) {
              this.createBCF(result);
              this.reflectElementUuidsNotValid.push(
                filtered_keys(result, /guid|GlobalId|guids/)[0]
              );
            }

            this.reflectElementUuids.push(
              filtered_keys(result, /guid|GlobalId|guids/)[0]
            );
          });
        });

        // console.log("=======RUN QUERY======", this.reflectElementUuids);

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
          this.reflectElementUuidsNotValid,
          this.color_not_valid
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
      this.loading = false;
    },
    async runPackage() {
      return await fetch(
        `${this.reflect_url}/reflect/project/${this.projectId}/package`,
        {
          headers: this.headers(),
          body: JSON.stringify({ content: "toto" }),
          method: "POST",
        }
      )
        .then(response => response.json())
        .catch(error => console.log("====ERROR RUN QUERY====", error));
    },
    async runQuery(queryBuilder) {
      // console.log("=======RUN QUERY======", queryBuilder);
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
#my_centered_buttons {
  position: relative;
  text-align: center;
  display: flex;
  justify-content: center;
}
.loading {
  display: flex;
  justify-content: center;
}
.cell_valid {
  background-color: #42b983;
  color: var(--color-white);
}
.cell_novalid {
  background-color: #db0f0fff;
  color: var(--color-white);
}
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
