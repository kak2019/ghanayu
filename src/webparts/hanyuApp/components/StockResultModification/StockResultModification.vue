<template>
<el-row class="background-layer main">
    <div class="background-layer">
      <Selecter v-model="form.select" :options="tableModifiedReason" label="修正領域"></Selecter>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="工程区分"></Selecter>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.num" label="MLN部品番号"/>
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="修正数"/>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="修正者"></Selecter>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="修正理由"></Selecter>
    </div>
    <div class="background-layer">
      <Input v-model="form.note" label="Despatch note" labelColor="#92cddc"></Input>
    </div>
    <div class="background-layer">
      <Input v-model="form.id" label="コメント" labelColor="#92cddc"></Input>
    </div>

    <el-button
        style="width: 100px; height: 40px; margin-top: 1px; margin-bottom: 10px;"
        @click="submitForm"
    >
      登録
    </el-button>
    <el-button style="width: 100px; height: 40px; margin-top: 1px"
               @click="resetForm"
    >キャンセル
    </el-button>
    <el-button style="width: 100px; height: 40px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;"
    @click="downloadExcel"
    >
      ダウンロード
    </el-button>
  </el-row>

  <TableShipping :tableData="tableData" :loading="loading"></TableShipping>
</template>

<script>
import './App.css';
import { computed } from 'vue';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import Input from './input.vue';
import { useStockResultModificationStore } from '../../../../stores/stockresultmodification';
import * as XLSX from 'xlsx';
import { ElMessage } from "element-plus"; // 更新为你的实际路径
import { usePartMasterStore } from '../../../../stores/part';
import { useModifiedReasonMasterStore } from '../../../../stores/modifiedreason';
import { useFunctionsMasterStore } from '../../../../stores/function';
import { useUserStore } from '../../../../stores/user';
import { useProcessMasterStore } from '../../../../stores/process';

// 获取 Pinia store 实例
const stockResultModificationStore = useStockResultModificationStore();
const modifiedReasonMasterStore = useModifiedReasonMasterStore();
const functionsMasterStore = useFunctionsMasterStore();
const processMasterStore = useProcessMasterStore();
const userStore = useUserStore();

const defaultShikyufrom = "2922";
let curentDate = new Date();
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input
  },
  data() {
    return {
      tableData: [],
      tableModifiedReason:[],
      tableFunctions: [],
      tableUsers: [],
      loading: true,
      form: {
        date: curentDate,
        select: '',
        id: '',
        note: '',
        num: '',
        count: ''
      }
    };
  },

  methods: {
    async submitForm() {
      try {
        //Add new record to good receive page
        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: "",
          ProcessType: "F",
          SHIKYUFrom: this.form.select,
          GoodsReceiveQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          GoodsReceiveDate: this.form.date,
        };

        //Get UD part number in the part master table that corresponds to the entered MLN part number
        const partMasterStore = usePartMasterStore();
        const udPartNo = await partMasterStore.getListItemByMLNPartNo(newItem.MLNPartNo);
        newItem.UDPartNo = udPartNo;

        //Add record to good receive table
        const message = await shiKYUGoodsReceiveStore.addListItem(newItem);
        this.$message.success(message);
        await this.fetchTableData();

        this.resetForm(); // 调用 reset 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }
    },
    async fetchTableData() {
      try {
        await stockResultModificationStore.getListItems().then(() => {
          this.loading = false;
        
          this.tableData = stockResultModificationStore.stockResultModifications
          const filteredTable = stockResultModificationStore.stockResultModifications.filter(element => {
              const condition  = true;
              element.ProcessName = this.getProcessNameByType(element.processType);
              element.FunctionName = this.getFunctionNameById(element.FunctionID);
              element.ModifiedReasonName = this.getModifiedReasonNameById(element.ModifiedReason);
              element.EditorName = getModifiedReasonNameById(element.modifiedreason); // get user
              return condition;
          });
          this.tableData = filteredTable;
        }).catch(error => {
          this.loading = false;
          ElMessage.error(error.message);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    getProcessNameByType(processType){
        const tableData = computed(() => processMasterStore.processMasterItems);
        const newTableData = tableData.value;
        const tableProcessName = newTableData.filter(item => {
          if(item.processType === processType){
            return true
          }else{
            return false
          }
        });
        if(tableProcessName.length>0)
        {
          return tableProcessName[0].ProcessName
        }else{
          return "";
        }
    },
    getFunctionNameById(functionID){
        const tableData = computed(() => functionsMasterStore.functionsMasterItems);
        const newTableData = tableData.value;
        const tableFunctionName = newTableData.filter(item => {
          if(item.FunctionID === functionID){
            return true
          }else{
            return false
          }
        });
        if(tableFunctionName.length>0)
        {
          return tableFunctionName[0].FunctionName
        }else{
          return "";
        }
    },
    getModifiedReasonNameById(modifiedReasonID){
        const tableData = computed(() => modifiedReasonMasterStore.modifiedReasonMasterItems);
        const newTableData = tableData.value;
        const tableModifiedReasonName = newTableData.filter(item => {
          if(item.ModifiedReasonID === modifiedReasonID){
            return true
          }else{
            return false
          }
        });
        if(tableModifiedReasonName.length>0)
        {
          return tableModifiedReasonName[0].ModifiedReasonName
        }else{
          return "";
        }
    },
    resetForm() {
      this.form = {
        date: curentDate,
        select: defaultShikyufrom,
        id: '',
        note: '',
        num: '',
        count: ''
      };
    },

    downloadExcel() {
      const data = this.tableData.map(item => ({
        '修正年月日': this.formatDate({Registered: item.Registered}, { property: 'Registered' }),
        '修正領域': item.ModifiedReasonName,
        '工程区分': item.ProcessName,
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '修正数': item.ModifiedQty,
        '修正者': item.EditorName,
        '修正理由': item.ModifiedReasonName,
        'Despatch note': item.Despatchnote,
        'コメント': item.Comment
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'stock result modification');

      XLSX.writeFile(workbook, 'stock_result_modification.xlsx');
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },

    addOneDay(date) {
      let result = new Date(date);
      result.setDate(result.getDate() + 1);
      return result;
    }
  },
  async mounted() {
    await this.fetchTableData();
  }
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
  background-color: #F2F2F2;
}

.main {
  padding: 20px;
}

.main .background-layer {
  margin-bottom: 10px;
}
.el-input__inner {
  font-size:12px;
}
</style>
