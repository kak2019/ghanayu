<template>
<el-row class="background-layer main">
    <div class="background-layer" label="1213">
      <my-select v-model="form.selectedFunction" label="修正領域" :options="tableFunctions"></my-select>
    </div>
    <div class="background-layer">
       <my-select label="工程区分" v-model="form.selectedProcess" :options="tableRrocess"></my-select>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.num" label="MLN部品番号"/>
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="修正数"/>
    </div>
    <div class="background-layer">
      <my-select label="修正者" v-model="form.ModifiedBy" :options="tableUsers"></my-select>
    </div>
    <div class="background-layer">
      <my-select label="修正理由" v-model="form.modifiedReason" :options="tableModifiedReason"></my-select>
    </div>
    <div class="background-layer">
      <Input v-model="form.note" label="Despatch note" labelColor="#92cddc"></Input>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.comment" label="コメント" labelColor="#92cddc"></InputRemoteData>
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
import MySelect from './MySelect.vue';
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

let curentDate = new Date();
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input,
    MySelect
  },
  data() {
    return {
      tableData: [],
      tableRrocess: [],
      tableFunctions: [],
      tableModifiedReason:[],
      tableUsers: [],
      loading: true,
      form: {
        selectedFunction: '05',
        selectedProcess: 'Z',
        num: '',
        count: '',
        ModifiedBy: userStore.hanyutype1s[0],
        modifiedReason: '01',
        note: '',
        comment: ''
      }
    };
  },

  methods: {
    async submitForm() {
      try {
        
        if (!this.form.num) {
          this.$message.error('MLNPartNo不能为空');
          return;
        }

        // 校验 MLNPartNo 的格式（10 位，由数字和英文组成）
        const mlnPartNoPattern = /^[a-zA-Z0-9]{10}$/;
        if (!mlnPartNoPattern.test(this.form.num)) {
          this.$message.error('请输入有效的MLNPartNo');
          return;
        }

        const modifiedQty = this.form.count;

        /*if (isNaN(modifiedQty)) {
          this.$message.error('请输入有效的值');
          return;
        }

        if (Number(modifiedQty) === 0) {
          this.$message.error('0は不可としマイナス数値は可とする.');
          return;
        }*/

        //Add new record to good receive page
        const regularUser = computed(() => userStore.hanyutype1s);
        const newItem = {
          FunctionID: this.form.selectedFunction, // need to get from dropdownlist
          ProcessType: this.form.selectedProcess,
          MLNPartNo: this.form.num,
          ModifiedQty: this.form.count,
          //People: this.form.modifiedUser,
          ModifiedReason: this.form.modifiedReason,
          Despatchnote: this.form.note,
          Comment: this.form.comment,
          ModifiedBy: JSON.stringify(userStore.hanyutype1s[0]),
        };

        //Get UD part number in the part master table that corresponds to the entered MLN part number
        const partMasterStore = usePartMasterStore();
        const udPartNo = await partMasterStore.getListItemByMLNPartNo(newItem.MLNPartNo);
        newItem.UDPartNo = udPartNo;

        //Add record to good receive table
        const message = await stockResultModificationStore.addListItem(newItem);
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
        console.log("-----------------------------------------");
          this.tableData = stockResultModificationStore.stockResultModifications
          const filteredTable = stockResultModificationStore.stockResultModifications.filter(element => {
              const condition  = true;
              element.ProcessName = this.getProcessNameByType(element.ProcessType);
              element.FunctionName = this.getFunctionNameById(element.FunctionID);
              element.ModifiedReasonName = this.getModifiedReasonNameById(element.ModifiedReason);
              element.EditorName = this.getEditorNameById(element.ModifiedById);
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
    getProcessNameByType(ProcessType){
      if(ProcessType ==="Z"){
        return "支給"
      }else if(ProcessType ==="CH"){
        return "出荷"
      }else{
        const tableData = computed(() => processMasterStore.processMasterItems);
        const newTableData = tableData.value;
        const tableProcessName = newTableData.filter(item => {
          if(item.ProcessType === ProcessType){
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
      }
    },
    getFunctionNameById(FunctionID){
        const tableData = computed(() => functionsMasterStore.functionsMasterItems);
        const newTableData = tableData.value;
        const tableFunctionName = newTableData.filter(item => {
          if(item.FunctionID === FunctionID){
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
    getModifiedReasonNameById(ModifiedReasonID){
        const tableData = computed(() => modifiedReasonMasterStore.modifiedReasonMasterItems);
        const newTableData = tableData.value;
        const tableModifiedReasonName = newTableData.filter(item => {
          if(item.ModifiedReasonID === ModifiedReasonID){
            return true
          }else{
            return false
          }
        });
        if(tableModifiedReasonName.length>0)
        {
          return tableModifiedReasonName[0].ModifiedReasonName
        } else {
          return "";
        }
    },
    getEditorNameById(Editor){

        const regularUser = computed(() => userStore.hanyutype1s);
        //const managerUser = computed(() => userStore.inventorymanagers);

        let tempTableUserInfo = [];
        regularUser.value.forEach(item => {
          tempTableUserInfo.push({ Title: item.Title, Id: item.Id})
        });

        /*managerUser.value.forEach(item => {
          tempTableUserInfo.push({ label: item.Title, value: item.Id})
        });*/

        const tableEditorName = tempTableUserInfo.filter(item => {
          if(item.Id === Editor){
            return true
          }else{
            return false
          }
        });
        if(tableEditorName.length>0)
        {
          return tableEditorName[0].Title
        } else {
          return "";
        }
    },
    resetForm() {      
      this.form = {
        selectedFunction: '05',
        selectedProcess: 'Z',
        num: '',
        count: '',
        ModifiedBy: userStore.hanyutype1s[0], //need to confirm how to get it.
        modifiedReason: '01',
        note: '',
        comment: ''
      };
      this.refreshFunctionName();
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
    },
    refreshFunctionName(){
      //修正領域
      const functionsMasterItems = computed(() => functionsMasterStore.functionsMasterItems);
      let tempTableFunctions = [];
      functionsMasterItems.value.forEach(item => {
        tempTableFunctions.push({ label: item.FunctionName, value: item.FunctionID})
      })
      tempTableFunctions = tempTableFunctions.filter(item=>{
        let condition = true;
        condition = condition && (item.value ==="05" || item.value ==="06" || item.value ==="07")
        return condition;
      });
      this.tableFunctions = tempTableFunctions;
    }
  },
  async mounted() {

    this.refreshFunctionName();
    //工程区分
     const processMasterItems = computed(() => processMasterStore.processMasterItems);
     let tempTableRrocess = [{ label: "支給", value: "Z"}];
     processMasterItems.value.forEach(item => {
      tempTableRrocess.push({ label: item.ProcessName, value: item.ProcessType})
     });

     tempTableRrocess.push({ label: "出荷", value: "CH"})

     tempTableRrocess = tempTableRrocess.filter(item=>{
       let condition = true;
       condition = condition && (item.value !== "F")
       return condition;
     });

     this.tableRrocess = tempTableRrocess;

     //修正理由
     const modifiedReasonMasterItems = computed(() => modifiedReasonMasterStore.modifiedReasonMasterItems);
     let tempTableModifiedReason = [];
     modifiedReasonMasterItems.value.forEach(item => {
      tempTableModifiedReason.push({ label: item.ModifiedReasonName, value: item.ModifiedReasonID})
     });
     this.tableModifiedReason = tempTableModifiedReason;

    //修正者
     const regularUser = computed(() => userStore.hanyutype1s);
     const managerUser = computed(() => userStore.inventorymanagers);

     let tempTableUserInfo = [];
     regularUser.value.forEach(item => {
      tempTableUserInfo.push({ label: item.Title, value: item.Id})
     });
     /*managerUser.value.forEach(item => {
      tempTableUserInfo.push({ label: item.Title, value: item.Id})
     });*/
     this.tableUsers = tempTableUserInfo;

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
