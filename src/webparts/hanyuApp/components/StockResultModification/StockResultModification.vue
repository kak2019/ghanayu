<template>
  <el-row class="background-layer main">
    <div class="background-layer"></div>
    <div class="background-layer">
      <my-select
        v-model="form.selectedFunction"
        label="修正領域"
        :options="tableFunctions"
      ></my-select>
    </div>
    <div class="background-layer">
      <my-select
        label="工程区分"
        v-model="form.selectedProcess"
        :options="tableRrocess"
      ></my-select>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.num" label="MLN部品番号" />
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="修正数" />
    </div>
    <!---- <div class="background-layer">
      <my-select label="修正者" v-model="form.ModifiedBy" :options="tableUsers"></my-select>
    </div>-->
    <div class="background-layer">
      <my-select
        label="修正理由"
        v-model="form.modifiedReason"
        :options="tableModifiedReason"
      ></my-select>
    </div>
    <div class="background-layer">
      <Input
        v-model="form.note"
        label="Despatch note"
        labelColor="#92cddc"
      ></Input>
    </div>
    <div class="background-layer">
      <InputRemoteData
        v-model="form.comment"
        label="コメント"
        labelColor="#92cddc"
      ></InputRemoteData>
    </div>

    <el-button
      plain size="large"
      type="primary"
      style="width: 100px;"
      @click="submitForm"
      v-loading.fullscreen.lock="fullscreenLoading"
    >
      登録
    </el-button>
    <el-button
      plain size="large"
      style="width: 100px;"
      @click="resetForm"
      >キャンセル
    </el-button>
    <el-button
      plain size="large"
      style="width: 100px;"
      @click="downloadExcel"
    >
      ダウンロード
    </el-button>
  </el-row>

  <TableShipping :tableData="tableData" :loading="loading"></TableShipping>
</template>

<script>
import "./App.css";
import { computed } from "vue";
import DatePickerWithLabel from "./labelPlusDateSelecter.vue";
import TableShipping from "./TableShipping.vue";
import MySelect from "./MySelect.vue";
import InputRemoteData from "./inputRemoteData.vue";
import Input from "./input.vue";
import { useStockResultModificationStore } from "../../../../stores/stockresultmodification";
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus"; // 更新为你的实际路径
import { usePartMasterStore } from "../../../../stores/part";
import { useModifiedReasonMasterStore } from "../../../../stores/modifiedreason";
import { useFunctionsMasterStore } from "../../../../stores/function";
import { useUserStore } from "../../../../stores/user";
import { useProcessMasterStore } from "../../../../stores/process";
import { useBillOfMaterialsStore } from "../../../../stores/billofmaterials";
import { useStockHistoryStore } from "../../../../stores/stockhistory";
import { useFileName } from '../../../../stores/usefilename';
// 获取 Pinia store 实例
const stockResultModificationStore = useStockResultModificationStore();
const modifiedReasonMasterStore = useModifiedReasonMasterStore();
const functionsMasterStore = useFunctionsMasterStore();
const processMasterStore = useProcessMasterStore();
const userStore = useUserStore();

let curentDate = new Date();
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    InputRemoteData,
    Input,
    MySelect,
  },
  data() {
    return {
      fullscreenLoading: false,
      tableData: [],
      tableRrocess: [],
      tableFunctions: [],
      tableModifiedReason: [],
      tableUsers: [],
      loading: true,
      form: {
        selectedFunction: "05",
        selectedProcess: "Z",
        num: "",
        count: "",
        //ModifiedBy: userStore.hanyutype1s[0],
        modifiedReason: "01",
        note: "",
        comment: "",
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        if (!this.form.num) {
          this.$message.error("MLNPartNo不能为空");
          return;
        }

        // 校验 MLNPartNo 的格式（10 位，由数字和英文组成）
        const mlnPartNoPattern = /^[a-zA-Z0-9]{10}$/;
        if (!mlnPartNoPattern.test(this.form.num)) {
          this.$message.error("请输入有效的MLNPartNo");
          return;
        }

        /*const modifiedQtyPattern = /^(-?[1-9]\\d*)$/
        const modifiedQty = this.form.count;

        if (isNaN(modifiedQty) || !modifiedQtyPattern.test(modifiedQty)) {          
          this.$message.error('请输入有效的修正数');
          return;
        }*/



       if(this.form.selectedProcess === "CH" && Number(modifiedQty) <= 0){
          this.$message.error('0は不可としマイナス数値は可とする.');
          return;
       }

        //Add new record to stock modification page
        //const regularUser = computed(() => userStore.hanyutype1s);
        const newItem = {
          FunctionID: this.form.selectedFunction, // need to get from dropdownlist
          ProcessType: this.form.selectedProcess,
          MLNPartNo: this.form.num,
          ModifiedQty: this.form.count,
          //People: this.form.modifiedUser,
          ModifiedReason: this.form.modifiedReason,
          Despatchnote: this.form.note,
          Comment: this.form.comment,
          //ModifiedBy: JSON.stringify(userStore.hanyutype1s[0]),
        };
        const partMasterStore = usePartMasterStore();
        const billOfMaterialsStore = useBillOfMaterialsStore();
        //The BOM table is searched using the entered MLN part number + process category as a key.If a corresponding record exists, it is registered in the ProcessCompletionResult table.
        let partRecords;
        if (newItem.ProcessType !== "Z" && newItem.ProcessType !== "CH") {
          const curPartCount =
            await partMasterStore.getItemCountByMLNPartNoProcessType(
              newItem.MLNPartNo,
              newItem.ProcessType
            ); // Need to change to bom table
          partRecords =
            await billOfMaterialsStore.getItemsByMLNPartNoProcessType(
              newItem.MLNPartNo,
              newItem.ProcessType
            );
          if (curPartCount <= 0 || partRecords.length <= 0) {
            this.$message.error("部品表なしエラー.");
            return;
          }
        }

        //Current process. - Validate If the entered correction amount is a negative value, or if the entered correction amount x -1 > the stock amount for this process (if the stock amount becomes negative), an error message will be displayed and the data will be added to the Inventory & Results Correction Table.
        const stockHistoryStore = useStockHistoryStore();
        let latestStockQty = 0;
        if (newItem.ProcessType !== "CH") {
          latestStockQty =
            await stockHistoryStore.getListItemsByRegisteredDate(
              newItem.MLNPartNo,
              newItem.ProcessType
            );
        }
        else {
            latestStockQty =
            await stockHistoryStore.getListItemsByRegisteredDate(
              newItem.MLNPartNo,
              "C"
            );
        }
        if (
          Number(newItem.ModifiedQty) < 0 &&
          Number(newItem.ModifiedQty) * -1 > Number(latestStockQty)
        ) {
          this.$message.error(
            "修正数が当工程または前工程の在庫数より多くなっています."
          );
          return;
        }
        this.fullscreenLoading = true;
        // if all the validation has been passed, need to add several mandatory fields to newItem, then do some caculation for stock history
        //Get UD part number in the part master table that corresponds to the entered MLN part number
        const udPartNo = await partMasterStore.getListItemByMLNPartNo(
          newItem.MLNPartNo
        );
        newItem.UDPartNo = udPartNo;

        //Child process. - Validate modified qty is greater than the stock of the child qty
        let structureQty = 0;
        let childPartNo = "";
        let childProcessType = "";
        let childProcessStockQty = 0;
        let childProcessNItemToStock = [];
        if (newItem.ProcessType !== "Z" && newItem.ProcessType !== "CH") {
          let minimumCount = Infinity;
          for (const record of partRecords) { 
            const { ChildPartNo, ChildProcessType, StructureQty} = record;
            const stockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(ChildPartNo, ChildProcessType);
            let newChildItem = [];
            newChildItem.ChildPartNo = ChildPartNo;
            newChildItem.ChildProcessType = ChildProcessType;
            newChildItem.StockQty = stockQty;
            newChildItem.StructureQty = StructureQty;
            const udPartNo = await partMasterStore.getListItemByMLNPartNo(
              newChildItem.ChildPartNo
            );
            newChildItem.UdPartNo = udPartNo;
            childProcessNItemToStock.push(newChildItem);
            
            if (stockQty < minimumCount) {
                minimumCount = stockQty;
            }
          }
          if (
            newItem.FunctionID !== "05" &&
            Number(newItem.ModifiedQty > 0) &&
            Number(newItem.ModifiedQty) > Number(minimumCount)
          ) {
            this.$message.error(
              "修正数が当工程または前工程の在庫数より多くなっています."
            );
            return;
          }
        }else if(newItem.ProcessType === "CH"){
          let newChildItem = [];
          newChildItem.ChildPartNo = newItem.MLNPartNo;
          newChildItem.ChildProcessType = "C";
          newChildItem.StockQty = latestStockQty;
          newChildItem.StructureQty = 1;
          newChildItem.UdPartNo = udPartNo;
          childProcessNItemToStock.push(newChildItem);
        }

        //Add record to good receive table
        let message = await stockResultModificationStore.addListItem(newItem, latestStockQty,childProcessNItemToStock);

        this.$message.success(message);
        await this.fetchTableData();
        this.fullscreenLoading = false;
        this.resetForm(); // 调用 reset 方法重置表单
      } catch (error) {
        this.$message.error("登録に失敗しました: " + error.message);
      }
    },
    async fetchTableData() {
      try {
        await stockResultModificationStore
          .getListItems()
          .then(() => {
            this.loading = false;
            this.tableData =
              stockResultModificationStore.stockResultModifications;
            const filteredTable =
              stockResultModificationStore.stockResultModifications.filter(
                (element) => {
                  const condition = true;
                  element.ProcessName = this.getProcessNameByType(
                    element.ProcessType
                  );
                  element.FunctionName = this.getFunctionNameById(
                    element.FunctionID
                  );
                  element.ModifiedReasonName = this.getModifiedReasonNameById(
                    element.ModifiedReason
                  );
                  //element.EditorName = this.getEditorNameById(element.EditorId);
                  return condition;
                }
              );
            this.tableData = filteredTable;
          })
          .catch((error) => {
            this.loading = false;
            ElMessage.error(error.message);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    getProcessNameByType(ProcessType) {
      if (ProcessType === "Z") {
        return "支給";
      } else if (ProcessType === "CH") {
        return "出荷";
      } else {
        const tableData = computed(() => processMasterStore.processMasterItems);
        const newTableData = tableData.value;
        const tableProcessName = newTableData.filter((item) => {
          if (item.ProcessType === ProcessType) {
            return true;
          } else {
            return false;
          }
        });
        if (tableProcessName.length > 0) {
          return tableProcessName[0].ProcessName;
        } else {
          return "";
        }
      }
    },
    getFunctionNameById(FunctionID) {
      const tableData = computed(
        () => functionsMasterStore.functionsMasterItems
      );
      const newTableData = tableData.value;
      const tableFunctionName = newTableData.filter((item) => {
        if (item.FunctionID === FunctionID) {
          return true;
        } else {
          return false;
        }
      });
      if (tableFunctionName.length > 0) {
        return tableFunctionName[0].FunctionName;
      } else {
        return "";
      }
    },
    getModifiedReasonNameById(ModifiedReasonID) {
      const tableData = computed(
        () => modifiedReasonMasterStore.modifiedReasonMasterItems
      );
      const newTableData = tableData.value;
      const tableModifiedReasonName = newTableData.filter((item) => {
        if (item.ModifiedReasonID === ModifiedReasonID) {
          return true;
        } else {
          return false;
        }
      });
      if (tableModifiedReasonName.length > 0) {
        return tableModifiedReasonName[0].ModifiedReasonName;
      } else {
        return "";
      }
    },
    getEditorNameById(Editor) {
      //     const regularUser = computed(() => userStore.hanyutype1s);
      //     const managerUser = computed(() => userStore.inventorymanagers);

      //     let tempTableUserInfo = [];
      //     regularUser.value.forEach(item => {
      //       tempTableUserInfo.push({ Title: item.Title, Id: item.Id})
      //     });

      //     managerUser.value.forEach(item => {
      //       tempTableUserInfo.push({ label: item.Title, value: item.Id})
      //     });

      const tableEditorName = tempTableUserInfo.filter((item) => {
        if (item.value === Editor) {
          return true;
        } else {
          return false;
        }
      });
      if (tableEditorName.length > 0) {
        return tableEditorName[0].label;
      } else {
        return "";
      }
    },
    resetForm() {
      this.form = {
        selectedFunction: "05",
        selectedProcess: "Z",
        num: "",
        count: "",
        //ModifiedBy: userStore.hanyutype1s[0], //remove because customer agreen to use current user as it.
        modifiedReason: "01",
        note: "",
        comment: "",
      };
      this.refreshFunctionName();
      /*const processMasterItems = computed(() => processMasterStore.processMasterItems);
      this.refreshProcessName(processMasterItems, this.form.selectedFunction);*/

      const processMasterItems = computed(
        () => processMasterStore.processMasterItems
      );
      let tempTableRrocess = [];
      tempTableRrocess.push({ label: "支給", value: "Z" });

      processMasterItems.value.forEach((item) => {
        tempTableRrocess.push({
          label: item.ProcessName,
          value: item.ProcessType,
        });
      });
      //tempTableRrocess.push({ label: "出荷", value: "CH"})

      tempTableRrocess = tempTableRrocess.filter((item) => {
        let condition = true;
        condition = condition && item.value !== "F";
        return condition;
      });

      this.tableRrocess = tempTableRrocess;
    },

    downloadExcel() {
      const data = this.tableData.map((item) => ({
        修正年月日: this.formatDate(
          { Registered: item.Registered },
          { property: "Registered" }
        ),
        修正領域: item.ModifiedReasonName,
        工程区分: item.ProcessName,
        MLN部品番号: item.MLNPartNo,
        UD部品番号: item.UDPartNo,
        修正数: item.ModifiedQty,
        修正者: item.Editor,
        修正理由: item.ModifiedReasonName,
        "Despatch note": item.Despatchnote,
        コメント: item.Comment,
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "stock result modification"
      );

      const { fileName, generateFileName } = useFileName();
      generateFileName('在庫&実績修正');

      XLSX.writeFile(workbook, fileName.value);
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },

    addOneDay(date) {
      let result = new Date(date);
      result.setDate(result.getDate() + 1);
      return result;
    },
    refreshFunctionName() {
      //修正領域
      const functionsMasterItems = computed(
        () => functionsMasterStore.functionsMasterItems
      );
      let tempTableFunctions = [];
      functionsMasterItems.value.forEach((item) => {
        tempTableFunctions.push({
          label: item.FunctionName,
          value: item.FunctionID,
        });
      });
      tempTableFunctions = tempTableFunctions.filter((item) => {
        let condition = true;
        condition =
          condition &&
          (item.value === "05" || item.value === "06" || item.value === "07");
        return condition;
      });
      this.tableFunctions = tempTableFunctions;
    },
    refreshProcessName(refreshedProcessMasterItems, functionId) {
      //工程区分
      const processMasterItems = refreshedProcessMasterItems;
      let tempTableRrocess = [];
      if (functionId !== "07") {
        tempTableRrocess.push({ label: "支給", value: "Z" });
      }
      processMasterItems.value.forEach((item) => {
        tempTableRrocess.push({
          label: item.ProcessName,
          value: item.ProcessType,
        });
      });
      if (functionId === "06") {
        tempTableRrocess.push({ label: "出荷", value: "CH" });
      }
      tempTableRrocess = tempTableRrocess.filter((item) => {
        let condition = true;
        condition = condition && item.value !== "F";
        return condition;
      });
      this.form.selectedProcess = tempTableRrocess[0].value;
      this.tableRrocess = tempTableRrocess;
    },
  },
  watch: {
    "form.selectedFunction": {
      handler: function (newVal, oldVal) {
        const processMasterItems = computed(
          () => processMasterStore.processMasterItems
        );
        this.refreshProcessName(processMasterItems, newVal);
      },
      deep: true, // Open the deep monitoring
    },
  },
  async mounted() {
    this.refreshFunctionName();

    const processMasterItems = computed(
      () => processMasterStore.processMasterItems
    );
    let tempTableRrocess = [];
    tempTableRrocess.push({ label: "支給", value: "Z" });

    processMasterItems.value.forEach((item) => {
      tempTableRrocess.push({
        label: item.ProcessName,
        value: item.ProcessType,
      });
    });
    //tempTableRrocess.push({ label: "出荷", value: "CH"})

    tempTableRrocess = tempTableRrocess.filter((item) => {
      let condition = true;
      condition = condition && item.value !== "F";
      return condition;
    });

    this.tableRrocess = tempTableRrocess;

    //修正理由
    const modifiedReasonMasterItems = computed(
      () => modifiedReasonMasterStore.modifiedReasonMasterItems
    );
    let tempTableModifiedReason = [];
    modifiedReasonMasterItems.value.forEach((item) => {
      tempTableModifiedReason.push({
        label: item.ModifiedReasonName,
        value: item.ModifiedReasonID,
      });
    });
    this.tableModifiedReason = tempTableModifiedReason;

    //修正者
    const regularUser = computed(() => userStore.hanyutype1s);
    const managerUser = computed(() => userStore.inventorymanagers);

    let tempTableUserInfo = [];
    regularUser.value.forEach((item) => {
      tempTableUserInfo.push({ label: item.Title, value: item.Id });
    });
    /*managerUser.value.forEach(item => {
      tempTableUserInfo.push({ label: item.Title, value: item.Id})
     });*/
    this.tableUsers = tempTableUserInfo;

    await this.fetchTableData();
  },
};
</script>
<style scoped>
.custom-header {
  background-color: black;
  color: white;
  padding: 10px;
  font-size: 16px;
  text-align: left;
}

.background-layer {
  background-color: #f2f2f2;
}

.main {
  padding: 20px;
}

.main .background-layer {
  margin-bottom: 10px;
}
.el-input__inner {
  font-size: 12px;
}
</style>
