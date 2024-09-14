<template>
    <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer">
        <date-picker-with-label v-model="form.date" label="当月年月"></date-picker-with-label>
      </div>
      <div class="background-layer">
        <Selecter v-model="form.select" label="工程区分"></Selecter>
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" />
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.UDPartNo" label="UD部品番号" searchField="UD" />
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button plain type="primary" size="large" style="width: 100px;" @click="searchForm">検索</el-button>
      <el-button plain size="large" style="width: 100px;" @click="resetForm">キャンセル</el-button>
      <el-button plain size="large" style="width: 100px;" @click="downloadTable">ダウンロード</el-button>
    </div>
  </el-row>

  <!-- <TableShipping :tableData="tableData" :loading="loading" :summaries="summaries"></TableShipping> -->

  <el-table :data="tableData" stripe border style="width: 100%; font-size:12px;" :header-cell-style="{backgroundColor: '#366093', color: '#fff'}" height="500px" v-loading="loading"
  show-summary :summary-method="getSummaries" row-class-name="summary-row">
    <!-- 第一层表头 -->
    <el-table-column prop="ProcessTypeName" label="工程区分" width="100" rowspan="2" />
    <el-table-column prop="MLNPartNo" label="MLN部品番号" width="180" rowspan="2" />
    <el-table-column prop="UDPartNo" label="UD部品番号" width="180" rowspan="2" />
    <el-table-column prop="lastLatestMonthQty" label="前月末在庫" colspan="2">
    </el-table-column>
    <el-table-column label="当月実績" colspan="3" header-align="center">
      <el-table-column prop="currentMonthDefectsQty" label="不良" width="80" />
      <el-table-column prop="currentMonthCompletionQty" label="完成" width="100" />
      <el-table-column prop="currentMonthShippingQty" label="振替" width="100" />
    </el-table-column>
    <el-table-column prop="curentMonthStockQty" label="当月末在庫" width="100" rowspan="2" />
  </el-table>
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import * as XLSX from 'xlsx';
import { ref } from 'vue';
import { useSHIKYUGoodsReceiveStore } from "../../../../stores/shikyugoodsreceive";
import { usePartMasterStore } from "../../../../stores/part"
import { useStockHistoryStore } from "../../../../stores/stockhistory"
import { ElMessage } from 'element-plus';
import { useFileName } from '../../../../stores/usefilename';
// 获取 Pinia store 实例

const SHIKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
const partMasterStore =  usePartMasterStore();
const stockHistoryStore = useStockHistoryStore();
const defaultProcess = "M";
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
  },
  data() {
    return {
      tableData: [],
      summaries:[],
      loading: true,
      form: {
        date: new Date(),
        select: "M",
        MLNPartNo: '',
        UDPartNo: '',
        // 其他表单字段
      },
      // tableData: [], // 原始的表格数据
      // filteredData: [], // 用于存放过滤后的表格数据
    };
  },
  methods: {
    downloadTable() {
      // 创建一个新的工作表
      const ws = XLSX.utils.json_to_sheet(this.tableData.map(val => ({
        ProcessType: val.ProcessType,
        MLNPartNo: val.MLNPartNo,
        UDPartNo: val.UDPartNo,
        前月末在庫: val.lastLatestMonthQty,
        BadProducts: val.currentMonthDefectsQty,
        Completion: val.currentMonthCompletionQty,
        VibrationSubstitution: val.currentMonthShippingQty,
        EndMonthStock: val.curentMonthStockQty
      })));

      const newData1 = [["工程区分", "MLN部品番号", "UD部品番号", "前月末在庫", "当月実績", "", "", "当月末在庫"]]
      const newData2 = [["", "", "", "", "不良", "完成", "振替", ""]]
      const newData3 = [["", "", "合計", this.summaries[3],this.summaries[4], this.summaries[5], this.summaries[6], this.summaries[7]]];

      const originalData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      originalData.shift()
      const shiftedData = newData1.concat(newData2).concat(originalData).concat(newData3); // 插入两个空行


      const wb = XLSX.utils.book_new();
      const newWs = XLSX.utils.aoa_to_sheet(shiftedData);

      // 合并单元格以符合复杂表头结构
      newWs['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // 合并 "工程区分" 列
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // 合并 "MLN部品番号" 列
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // 合并 "UD部品番号" 列
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // 合并 "前月末在庫" 列
        { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, // 合并 "当月実績" 列
        { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }  // 合并 "当月末在庫" 列
      ];

      XLSX.utils.book_append_sheet(wb, newWs, 'Sheet1', true);

      // 将工作簿导出为 Excel 文件
      const { fileName, generateFileName } = useFileName();
       generateFileName('支給品検収実績入力');

      XLSX.writeFile(wb, "在庫管理表.xlsx");
    },
    async searchForm() {
      //this.tableData = this.filterDataBySearchItems();
      //this.summaries = this.getSummaries();

      await this.filterDataBySearchItems();
      //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@" + this.summaries);
    },
    async resetForm() {
      // 重置表单字段并清空表格数据
      this.form = {
        date: new Date(),
        select: defaultProcess,
        MLNPartNo: '',
        UDPartNo: ''
      };
      await this.filterDataBySearchItems().then(() => {
      }).catch(error => {
            
      });
    },
    async filterDataBySearchItems(){
      const query = this.form
     
      const formatQueryDate = query.date.getFullYear() + '-' + (query.date.getMonth()+1);

    try {
      this.loading = true;
      const date = this.form.date;
      const processType = this.form.select;
      const mlnPartNo = this.form.MLNPartNo;
      const udPartNo = this.form.UDPartNo;
      await partMasterStore.getListItemsBySearchItems(date, processType, mlnPartNo, udPartNo).then(() => {
                this.loading = false;
                // 对数据进行处理以匹配表格字段
                this.tableData = partMasterStore.filteredParts;
                this.summaries = this.getSummaries();
            }).catch(error => {
                this.loading = false;
                ElMessage.error(error.message);
            });
      console.log("Processed table data:", this.tableData);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }

      /*const filterTable = partMasterStore.partMasterItems
          .filter(item => {
            //console.log("item.Registered ------"+  item.Registered);
            let condition = true
            if(query.date){
              let formatRegisteredDate = item.Registered !=null? new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth()+1): ""
              //console.log("formatRegisteredDate+-------" + formatRegisteredDate);
              condition = condition && formatQueryDate === formatRegisteredDate
            }
            return condition;
          }).filter(item => {
              let condition = true;
               //console.log(item.ID + "item.ProcessType-----------" + item.ProcessType);
              if(query.select){
                  const isProcessTypeIn = item.ProcessType != null && item.ProcessType.indexOf(query.select)>=0
                  if(isProcessTypeIn){
                    //item.ProcessType = query.select;
                    condition = condition && isProcessTypeIn
                  }else{
                    condition = false;
                  }
              }
              return condition;
          }).filter(item => {
            let condition = true;
            const MLNPartNoValue = query.MLNPartNo.trim();
            const UDPartNoValue = query.UDPartNo.trim();
            const isEmpty1 = MLNPartNoValue === "";
            const isEmpty2 = UDPartNoValue === "";
            const filterByMLNPartNo = !isEmpty1 && item.MLNPartNo.indexOf(MLNPartNoValue) >= 0;
            const filterByUDPartNo = !isEmpty2 && item.UDPartNo.indexOf(UDPartNoValue) >= 0;
            if(isEmpty1 && isEmpty2){
              condition = condition;
            }else {
                if(!isEmpty1 && !isEmpty2) {
                  condition = condition && filterByMLNPartNo
                }else{
                  condition = condition && (filterByMLNPartNo|| filterByUDPartNo)
                }
            }
            return condition; 
          });

        return filterTable;*/
    },
    getSummaries() {
      const summaries = [];
      let [totalLastLatestMonthQty,totalCurrentMonthDefectsQty,totalCurrentMonthCompletionQty,totalCurrentMonthShippingQty,totalCurentMonthStockQty] = [0,0,0,0,0];

      this.tableData.forEach(element => {
         totalLastLatestMonthQty += Number(element.lastLatestMonthQty);
         totalCurrentMonthDefectsQty += Number(element.currentMonthDefectsQty);
         totalCurrentMonthCompletionQty += Number(element.currentMonthCompletionQty);
         totalCurrentMonthShippingQty += Number(element.currentMonthShippingQty);
         totalCurentMonthStockQty += Number(element.curentMonthStockQty);
      });

      const lastLatestMonthQty = totalLastLatestMonthQty;
      const currentMonthDefectsQty =  totalCurrentMonthDefectsQty
      const currentMonthCompletionQty =  totalCurrentMonthCompletionQty
      const currentMonthShippingQty =  totalCurrentMonthShippingQty
      const curentMonthStockQty = totalCurentMonthStockQty
      return ['', '', `合計`, `${lastLatestMonthQty}`, ` ${currentMonthDefectsQty}`,`${currentMonthCompletionQty}`, `${currentMonthShippingQty}`,`${curentMonthStockQty}`,]
    }
  },
  async mounted() {
    try {
      // 调用 store 的方法获取数据
      //const formatCurrentDate = query.date.getFullYear() + '-' + (query.date.getMonth()+1);
      /*const date = this.form.date;
      const processType = this.form.select
      await partMasterStore.getListItemsBySearchItems(date, processType).then(() => {
                this.loading = false;
                // 对数据进行处理以匹配表格字段
                this.tableData = this.filterDataBySearchItems();
                this.summaries = this.getSummaries();
                
                //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@" + this.summaries);
            }).catch(error => {
                this.loading = false;
                ElMessage.error(error.message);
            });*/
            await this.filterDataBySearchItems();

      console.log("Processed table data:", this.tableData);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  }
}
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
  padding: 10px;
}

.main .background-layer {
}
.el-table .el-table_footer-wrapper tbody td{
  background:#c4d79b;
  font-weight:bolder;
}
</style>
