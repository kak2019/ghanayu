<template>
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer">
        <date-picker-with-label v-model="form.ProcessCompletion" label="工程完了日"></date-picker-with-label>
      </div>
      <div class="background-layer">
        <Selecter v-model="form.selectProcessType" label="工程区分" :processOptions="processOptions"></Selecter>
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" @confirmMethod="confirmMethod" />
      </div>
      <div class="background-layer">
        <Input v-model="form.AbnormalNumber" label="不良数" labelColor="#fabf8f"></Input>
      </div>
      <div class="background-layer">
        <Input v-model="form.FinishedNumber" label="完成数" labelColor="#fabf8f"></Input>
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button type="primary" plain size="large" style="width: 100px;" v-loading.fullscreen.lock="fullscreenLoading" @click="submitForm" >登録</el-button>
      <el-button plain size="large" style="width: 100px;" @click="resetForm" >キャンセル</el-button>
      <el-button plain size="large" style="width: 100px;" @click="downloadTable">ダウンロード</el-button>
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
import { ref, computed } from 'vue';
import Input from './input.vue';
import { useProcessCompletionResultStore } from "../../../../stores/processcompletion";
import { useProcessMasterStore } from '../../../../stores/process';
import { usePartMasterStore } from '../../../../stores/part';
import { useBillOfMaterialsStore } from '../../../../stores/billofmaterials';
import { useStockHistoryStore } from "../../../../stores/stockhistory"
import { useUserStore } from '../../../../stores/user';
import { isDateBefore } from '../../../../common/utils';

const ProcessMasterStore = useProcessMasterStore();
const ProcessCompletionResultStore = useProcessCompletionResultStore();
const BillOfMaterialsStore = useBillOfMaterialsStore();

export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input
  },

  setup() { 
    const userStore = useUserStore();
    const isBusinessControler = computed(() => userStore.groupInfo.indexOf('Business Controler') >= 0);
    return {
      isBusinessControler
    };
  },

  data() {
    return {
      fullscreenLoading: false,
      processOptions: [],
      tableData: [],
      needToSyncItems: [],
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
        const isDefectQtyInteger = !Number.isInteger(defectQty);
        const isCompletionQtyInteger = !Number.isInteger(completionQty);
        if (isNaN(defectQty) || defectQty < 0 || isDefectQtyInteger) {
          this.$message.error('请输入有效的不良数');
          return;
        }

        if (isNaN(completionQty) || completionQty < 0 || isCompletionQtyInteger) {
          this.$message.error('请输入有效的完成数');
          return;
        }

        if (defectQty === 0 && completionQty === 0) {
          this.$message.error('不良数和完成数不能同时为 0');
          return;
        }

        this.fullscreenLoading = true;
        //The BOM table is searched using the entered MLN part number + process category as a key.If a corresponding record exists, it is registered in the ProcessCompletionResult table.
        const partMasterStore = usePartMasterStore();
        const curPartCount = await partMasterStore.getItemCountByMLNPartNoProcessType(this.form.MLNPartNo,this.form.selectProcessType);
        if (curPartCount <= 0) {
          this.$message.error('部品表なしエラー');
          return;
        }
        const curUDPartNo = await partMasterStore.getListItemByMLNPartNo(this.form.MLNPartNo);
        this.form.UDPartNo = curUDPartNo

        //If the input "工程完了日" is smaller than the latest record date of this part, show error meesage "工程完了日エラー"
        
          const processCompletionResultStore = useProcessCompletionResultStore();
          const curPartRecords = await processCompletionResultStore.getItemsByMLNPartNoProcessType(this.form.MLNPartNo, this.form.selectProcessType);

          if (curPartRecords.length > 0) {
            const latestRecord = curPartRecords[0];
            if (!this.isToday(this.form.ProcessCompletion)) { 
              const compareDateResult = isDateBefore(new Date(this.form.ProcessCompletion), new Date(latestRecord.ProcessCompletion))
              if (compareDateResult) {
                this.$message.error('工程完了日エラー');
                return;
              }
            }
          }
        
        

        //If the entered completed quantity is greater than the stock quantity of the previous process, an error message "完成数が前工程の在庫数より多くなっています" will be displayed and the item will not be registered in the in-house process completion results table.
        //根据MLN编号和工程区分获得部品列表
        const billOfMaterialsStore = useBillOfMaterialsStore();
        const stockHistoryStore = useStockHistoryStore();
        const partRecords = await billOfMaterialsStore.getItemsByMLNPartNoProcessType(this.form.MLNPartNo, this.form.selectProcessType)
        //遍历partRecords,获取所有前置部品中的最小库存数，然后用完成数与之比较做判断
        const date = new Date();
        const year = date.getFullYear();
        // const month = (date.getMonth() + 1).toString.padStart(2, '0');
        let minimumCount = Infinity;
        for (const record of partRecords) { 
          const { ChildPartNo, ChildProcessType, StructureQty } = record;

          const stockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(ChildPartNo, ChildProcessType);
          const childUDPartNo = await partMasterStore.getListItemByMLNPartNo(ChildPartNo);
          this.form.UDPartNo = curUDPartNo;
          const childFinalFinishedQty = Number(this.form.FinishedNumber) * StructureQty * -1;
          const childFinalAbnormalQty = Number(this.form.AbnormalNumber) * StructureQty * -1;
          const childPartFinished = {
            MLNPartNo: ChildPartNo,
            ProcessType: ChildProcessType,
            UDPartNo: childUDPartNo,
            Qty: childFinalFinishedQty,
            FunctionID: '02',
            StockQty:(childFinalFinishedQty + stockQty).toString() //获取最新库存
          };

          const childPartAbnormal = {
            MLNPartNo: ChildPartNo,
            ProcessType: ChildProcessType,
            UDPartNo: childUDPartNo,
            Qty: childFinalAbnormalQty,
            FunctionID: '03',
            StockQty: (childFinalFinishedQty + stockQty).toString() //获取最新库存
          };

          this.needToSyncItems.push(childPartFinished);
          this.needToSyncItems.push(childPartAbnormal);

          if (stockQty < minimumCount) {
              minimumCount = stockQty;
          }
        }

        if ((Number(this.form.FinishedNumber) + Number(this.form.AbnormalNumber)) >  minimumCount) {
          this.needToSyncItems = [];
          this.$message.error('完成数が前工程の在庫数より多くなっています');
          return;
        }
  
        const latestStockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(this.form.MLNPartNo, this.form.selectProcessType);

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

        const newStockItemFinished = {
          MLNPartNo: this.form.MLNPartNo,
          ProcessType: this.form.selectProcessType,
          UDPartNo: this.form.UDPartNo,
          Qty: this.form.FinishedNumber,
          FunctionID: '02',
          StockQty:(Number(this.form.FinishedNumber) + latestStockQty).toString() //获取最新库存
        };

        const newStockItemAbnormal = {
          MLNPartNo: this.form.MLNPartNo,
          ProcessType: this.form.selectProcessType,
          UDPartNo: this.form.UDPartNo,
          Qty: this.form.AbnormalNumber,
          FunctionID: '03',
          StockQty: (Number(this.form.FinishedNumber) + latestStockQty).toString() //获取最新库存
        };

        this.needToSyncItems.push(newStockItemAbnormal);
        this.needToSyncItems.push(newStockItemFinished);

        const syncStockMsg = await stockHistoryStore.addListItems(this.needToSyncItems);
        this.$message.success(syncStockMsg);
        this.needToSyncItems = [];
        this.fullscreenLoading = false
        this.resetForm(); // 调用 resetForm 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }finally{
        this.fullscreenLoading = false
      }
    },

    async fetchProcessMasterData() {
      // const processMasterStore = useProcessMasterStore();
      try {
        await ProcessMasterStore.getListItems(); // 获取数据
        this.processOptions = ProcessMasterStore.processMasterItems
        .filter(item => item.ProcessType !== 'F')
        .map(item => ({
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
        "工程完了日": this.formatDate({ ProcessCompletion: item.ProcessCompletion }, { property: 'ProcessCompletion' }),
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '不良数': item.DefectQty,
        '完成数': item.CompletionQty,
        '実績登録日': this.formatDate({ Registered: item.Registered }, { property: 'Registered' }),
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
      return `${year}/${month}/${day}`;
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
    },

    isToday(date) {
      const today = new Date(); // 获取当前日期
      const givenDate = new Date(date);
  
      // 将当前日期和传入日期的时间部分都设置为 00:00:00
      today.setHours(0, 0, 0, 0);
      givenDate.setHours(0, 0, 0, 0);

      // 比较日期
      return today.getTime() === givenDate.getTime();
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
  padding-top:1px;
  padding-bottom:1px;
}

.background-layer {
  background-color: #F2F2F2;
}

.main {
  padding: 10px;
}

.main .background-layer {
  /*margin-bottom: 10px;*/
}

.el-input__inner {
  font-size: 12px;
}
</style>
