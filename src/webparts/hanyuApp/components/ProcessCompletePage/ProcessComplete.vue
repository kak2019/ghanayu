<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">内製工程完了実績入力</div>
    </el-col>
  </el-row>
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer" style="margin-right: 20px;">
        <date-picker-with-label v-model="form.ProcessCompletion" label="工程完了日"></date-picker-with-label>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <Selecter v-model="form.select" label="工程区分"></Selecter>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" />
      </div>
      <!-- <div class="background-layer">
        <InputRemoteData v-model="form.UDPartNo" label="UD部品番号" searchField="UD" />
      </div> -->
      <div class="background-layer">
        <Input v-model="form.AbnormalNumber" label="不良数"></Input>
      </div>
      <div class="background-layer">
        <Input v-model="form.FinishedNumber" label="完成数"></Input>
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;" @click="submitForm">登录</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px;margin-bottom: 10px;" @click="resetForm">キャンセル</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;" @click="downloadTable">ダウンロード</el-button>
    </div>
  </el-row>

  <TableShipping :tableData="tableData"></TableShipping>
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import * as XLSX from 'xlsx';
import { ref } from 'vue';
import Input from './input.vue';
import { useProcessCompletionResultStore } from "../../../../stores/processcompletion";

const ProcessCompletionResultStore = useProcessCompletionResultStore();

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
      form: {
        ProcessCompletion: '',
        select: '',
        MLNPartNo: '',
        UDPartNo: '',
        AbnormalNumber: '',
        FinishedNumber: ''
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        const newItem = {
          MLNPartNo: this.form.MLNPartNo,
          ProcessType: this.form.select,
          UDPartNo: this.form.UDPartNo,
          DefectQty: this.form.AbnormalNumber,
          CompletionQty: this.form.FinishedNumber,
          ProcessCompletion: new Date(this.form.ProcessCompletion)
        };

        const message = await ProcessCompletionResultStore.addListItem(newItem);
        this.$message.success(message);
        await this.fetchTableData();

        this.resetForm(); // 调用 resetForm 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }
    },

    async fetchTableData() {
      try {
        await ProcessCompletionResultStore.getListItems();
        this.tableData = ProcessCompletionResultStore.processCompletionResultItems;
        console.log("Processed table data:", this.tableData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    resetForm() {
      this.form = {
        ProcessCompletion: '',
        select: '',
        MLNPartNo: '',
        UDPartNo: '',
        AbnormalNumber: '',
        FinishedNumber: ''
      };
    },

    downloadTable() {
      const data = this.tableData.map(item => ({
        "工程完了日": item.ProcessCompletion,
        'MLN部品番号': item.MLNPartNo,
        '不良数': item.DefectQty,
        '完成数': item.CompletionQty,
        '実績登録日': this.formatDate({ Created: item.Registered }, { property: 'Created' }),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Process Completion Results');

      XLSX.writeFile(wb, 'process_completion_results.xlsx');
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },
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
</style>
