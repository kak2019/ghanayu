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
        <Selecter v-model="form.selectProcessType" label="工程区分" :processOptions="processOptions"></Selecter>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" @confirmMethod="confirmMethod" />
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
import { useProcessMasterStore } from '../../../../stores/process';
import { usePartMasterStore } from '../../../../stores/part';

const ProcessMasterStore = useProcessMasterStore();
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
      processOptions: [],
      tableData: [],
      form: {
        ProcessCompletion: new Date().toISOString(),
        selectProcessName: '生加工',
        selectProcessType: 'M',
        MLNPartNo: '',
        UDPartNo: '',
        AbnormalNumber: '',
        FinishedNumber: ''
      },
    };
  },
  methods: {
    async submitForm() {
      debugger
      try {
        if (!this.form.MLNPartNo) {
          this.$message.error('MLNPartNo不能为空');
          return;
        }

        // 校验 MLNPartNo 的格式（10 位，由数字和英文组成）
        const mlnPartNoPattern = /^[a-zA-Z0-9]{10}$/;
        if (!mlnPartNoPattern.test(this.form.MLNPartNo)) {
          this.$message.error('请输入有效的MLNPartNo');
          return;
        }

        const defectQty = Number(this.form.AbnormalNumber);
        const completionQty = Number(this.form.FinishedNumber);

        if (isNaN(defectQty) || defectQty < 0) {
          this.$message.error('请输入有效的不良数');
          return;
        }

        if (isNaN(completionQty) || completionQty < 0) {
          this.$message.error('请输入有效的完成数');
          return;
        }

        if (defectQty === 0 && completionQty === 0) {
          this.$message.error('不良数和完成数不能同时为 0');
          return;
        }

        //The BOM table is searched using the entered MLN part number + process category as a key.If a corresponding record exists, it is registered in the ProcessCompletionResult table.
        const partMasterStore = usePartMasterStore();
        const curPartCount = await partMasterStore.getItemCountByMLNPartNoProcessType(this.form.MLNPartNo,this.form.selectProcessType);
        if (curPartCount <= 0) {
          this.$message.error('Part不存在');
          return;
        }

        //If the input "工程完了日" is smaller than the latest record date of this part, show error meesage "工程完了日エラー"
        await ProcessCompletionResultStore.getListItemsByMLNPartNo(this.form.MLNPartNo);
        const curPartRecords = ProcessCompletionResultStore.processCompletionResultItems;
        console.log('=========+++++++++');
        console.log(curPartRecords);
        if (curPartRecords.length > 0) {
          const latestRecord = curPartRecords[0];
          const compareDateResult = this.compareDates(latestRecord.ProcessCompletion,this.form.ProcessCompletion)
          if (compareDateResult === 1) {
            this.$message.error('工程完了日エラー');
            return;
          }
        }



        const newItem = {
          MLNPartNo: this.form.MLNPartNo,
          ProcessType: this.form.selectProcessType,
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

    async fetchProcessMasterData() {
      // const processMasterStore = useProcessMasterStore();
      try {
        await ProcessMasterStore.getListItems(); // 获取数据
        this.processOptions = ProcessMasterStore.processMasterItems.map(item => ({
          Id: item.Id,           // 保留Id用于key
          ProcessName: item.ProcessName, // 用于显示的名称
          ProcessType: item.ProcessType,
        }));
        console.log("Processed Master data:", this.processOptions);
      } catch (error) {
        console.error('Failed to load process master items:', error);
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
        ProcessCompletion: new Date().toISOString(),
        selectProcessName: '生加工',
        selectProcessType: 'M',
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

    confirmMethod({ value, relatedText }) {
      console.log('============');
      console.log('Received value:', value);
      console.log('Received relatedText:', relatedText);
    // 在这里进一步处理接收到的值
    },

    compareDates(date1, date2) {
      const dateObj1 = new Date(date1);
      const dateObj2 = new Date(date2);
      if (dateObj1 > dateObj2) {
        return 1;
      } else if (dateObj1 < date2) {
        return -1;
      } else {
        return 0;
      }
    }
  },
  async mounted() {
    await this.fetchTableData();
    await this.fetchProcessMasterData();
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
