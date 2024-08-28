<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">在庫管理表 (工程別)</div>
    </el-col>
  </el-row> <!-- 关闭第一个 el-row 标签 -->
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer" style="margin-right: 20px;">
        <date-picker-with-label v-model="form.date" label="当月年月"></date-picker-with-label>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <Selecter v-model="form.select" label="工程区分"></Selecter>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <InputRemoteData v-model="form.MLNPartNo" label="MLN部品番号" searchField="MLN" />
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.UDPartNo" label="UD部品番号" searchField="UD" />
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button style="width: 100px; height: 40px; margin-top: 1px; margin-bottom: 10px;" @click="searchForm">検索</el-button>
      <el-button style="width: 100px; height: 40px; margin-top: 1px;margin-bottom: 10px;" @click="resetForm">キャンセル</el-button>
      <el-button style="width: 100px; height: 40px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;" @click="downloadTable">ダウンロード</el-button>
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
import {useSHIKYUGoodsReceiveStore} from "../../../../stores/shikyugoodsreceive";
import { usePartMasterStore } from "../../../../stores/part"
import { useStockHistoryStore } from "../../../../stores/stockhistory"
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
      XLSX.writeFile(wb, "在庫管理表.xlsx");
    },
    searchForm() {
      this.tableData = this.filterDataBySearchItems();
    },
    resetForm() {
      // 重置表单字段并清空表格数据
      this.form = {
        date: new Date(),
        select: defaultProcess,
        MLNPartNo: '',
        UDPartNo: ''
      };
      this.tableData = this.filterDataBySearchItems(); // 重新设置过滤后的数据
    },
    filterDataBySearchItems(){
      const query = this.form
     
      const formatQueryDate = query.date.getFullYear() + '-' + (query.date.getMonth()+1);

      const filterTable = partMasterStore.partMasterItems
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
            //console.log("item.MLNPartNo ------"+  item.MLNPartNo);
            //console.log("item.UDPartNo ------"+  item.UDPartNo);
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

        return filterTable;
    }
  },
  async mounted() {
    try {
      // 调用 store 的方法获取数据
      //const formatCurrentDate = query.date.getFullYear() + '-' + (query.date.getMonth()+1);
      const date = this.form.date;
      await partMasterStore.getListItemsBySearchItems(date);

      // 对数据进行处理以匹配表格字段
      this.tableData = this.filterDataBySearchItems();

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
