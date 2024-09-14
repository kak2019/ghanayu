<template>
<!-- 关闭第一个 el-row 标签 -->
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer" style="margin-right: 20px;">
        <date-picker-with-label v-model="form.date" label="当月年月"></date-picker-with-label>
      </div>
      <!--      <div class="background-layer" style="margin-right: 20px;">-->
      <!--        <Selecter v-model="form.select" label="工程区分"></Selecter>-->
      <!--      </div>-->
      <div class="background-layer" style="margin-right: 20px;">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" />
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.UDPartNo" label="UD部品番号" searchField="UD" />
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;" type="primary" @click="searchForm">検索</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px;margin-bottom: 10px;" @click="resetForm">キャンセル</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;" @click="downloadTable">ダウンロード</el-button>
    </div>
  </el-row>

  <!-- <TableShipping :tableData="tableData"></TableShipping> -->
  <el-table :data="tableData" stripe style="width: 100%; font-size:12px;" :header-cell-style="{backgroundColor: '#366093', color: '#fff'}" height="320px" v-loading="loading"
  show-summary :summary-method="getSummaries" row-class-name="summary-row">
    <!-- 第一层表头 -->
    <el-table-column prop="MLNPartNo" label="MLN部品番号" width="180" rowspan="2" />
    <el-table-column prop="UDPartNo" label="UD部品番号" width="180" rowspan="2" />
    <el-table-column prop="lastLatestMonthQty" label="前月末在庫" colspan="2">
    </el-table-column>
    <el-table-column label="当月実績" colspan="3" header-align="center">
      <el-table-column prop="currentMonthInQty" label="入庫" width="100" />
      <el-table-column prop="currentMonthOutQty" label="出庫" width="100" />
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
import { useFileName } from '../../../../stores/usefilename';
import * as XLSX from 'xlsx';
import { ref } from 'vue';
import {useSHIKYUGoodsReceiveStore} from "../../../../stores/shikyugoodsreceive";
import { usePartMasterStore } from "../../../../stores/part"
import { useStockHistoryStore } from "../../../../stores/stockhistory"
// 获取 Pinia store 实例

const { fileName, generateFileName } = useFileName();
const partMasterStore =  usePartMasterStore();
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
        MLNPartNo: val.MLNPartNo,
        UDPartNo: val.UDPartNo,
        前月末在庫: val.lastLatestMonthQty,
        BadProducts: val.currentMonthInQty,
        Completion: val.currentMonthOutQty,
        VibrationSubstitution: val.currentMonthShippingQty,
        EndMonthStock: val.curentMonthStockQty
      })));

      const newData1 = [["工程区分", "MLN部品番号", "UD部品番号", "前月末在庫", "当月実績", "", "", "当月末在庫"]]
      const newData2 = [["", "", "", "", "不良", "完成", "振替", ""]]

      const originalData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      originalData.shift()
      const shiftedData = newData1.concat(newData2).concat(originalData); // 插入两个空行


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
      generateFileName('在庫管理表 (支給品)');
      XLSX.writeFile(wb, fileName.value);
    },
    async searchForm() {
      await this.filterDataBySearchItems();
    },
    async resetForm() {
      // 重置表单字段并清空表格数据
      this.form = {
        date: new Date(),
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
        await partMasterStore.getListItemsBySearchItemsForGoodsInventory(date, 'F', mlnPartNo, udPartNo).then(() => {
                  this.loading = false;
                  // 对数据进行处理以匹配表格字段
                  this.tableData = partMasterStore.filteredPartsForGoodsInventory;
                  this.summaries = this.getSummaries();
              }).catch(error => {
                  this.loading = false;
                  ElMessage.error(error.message);
              });
        console.log("Processed table data:", this.tableData);
      } catch (error) {
        console.error('Error fetching stock history:', error);
      }
    },

    getSummaries() {
      const summaries = [];
      let [totalLastLatestMonthQty,totalCurrentMonthInQty,totalCurrentMonthOutQty,totalCurentMonthStockQty] = [0,0,0,0];

      this.tableData.forEach(element => {
          totalLastLatestMonthQty += element.lastLatestMonthQty;
          totalCurrentMonthInQty += element.currentMonthInQty;
          totalCurrentMonthOutQty += element.currentMonthOutQty;
          totalCurentMonthStockQty += element.curentMonthStockQty;
      });

      const lastLatestMonthQty = totalLastLatestMonthQty;
      const currentMonthInQty =  totalCurrentMonthInQty
      const currentMonthOutQty =  totalCurrentMonthOutQty
      const curentMonthStockQty = totalCurentMonthStockQty
      return ['', `合計`, `${lastLatestMonthQty}`, `${currentMonthInQty}`, `${currentMonthOutQty}`,`${curentMonthStockQty}`,]
    }
  },

  async mounted() {
    try {
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
  padding: 20px;
}

.main .background-layer {
  margin-bottom: 10px;
}
</style>
