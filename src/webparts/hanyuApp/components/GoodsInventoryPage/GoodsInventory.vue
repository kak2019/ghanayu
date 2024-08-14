<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">在庫管理表 (支给品)</div>
    </el-col>
  </el-row> <!-- 关闭第一个 el-row 标签 -->
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
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;">検索</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px;margin-bottom: 10px;" @click="resetForm">キャンセル</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;" @click="downloadTable">ダウンロード</el-button>
    </div>
  </el-row>

  <TableShipping></TableShipping>
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
// 获取 Pinia store 实例

const SHIKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
  },
  data() {
    return {
      form: {
        date: '',
        select: '',
        MLNPartNo: '',
        UDPartNo: '',
        // 其他表单字段
      },
      //tableData: [], // 原始的表格数据
      //filteredData: [], // 用于存放过滤后的表格数据
    };
  },
  methods: {
    downloadTable() {
      // 创建一个新的工作表
      const ws = XLSX.utils.json_to_sheet(this.filteredData);

      // 添加复杂表头
      XLSX.utils.sheet_add_aoa(ws, [
        ["工程区分", "MLN部品番号", "UD部品番号", "前月末在庫", "当月実績", "", "", "当月末在庫"],  // 第一层表头
        ["", "", "", "", "不良", "完成", "振替", ""] // 第二层表头
      ], { origin: "A1" });

      // 合并单元格以符合复杂表头结构
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // 合并 "工程区分" 列
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // 合并 "MLN部品番号" 列
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // 合并 "UD部品番号" 列
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // 合并 "前月末在庫" 列
        { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, // 合并 "当月実績" 列
        { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }  // 合并 "当月末在庫" 列
      ];

      // 创建工作簿并添加工作表
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "在庫管理表");

      // 将工作簿导出为 Excel 文件
      XLSX.writeFile(wb, "在庫管理表.xlsx");
    },
    resetForm() {
      // 重置表单字段并清空表格数据
      this.form = {
        date: '',
        select: '',
        MLNPartNo: '',
        UDPartNo: ''
      };
      this.filteredData = this.tableData; // 重新设置过滤后的数据
    },
    // async fetchTableData() {
    //   // 模拟获取数据，你可以替换为真实的数据获取逻辑
    //   await stockHistoryStore.getListItems();
    //   this.tableData.value = stockHistoryStore.getListItems()
    //   this.filteredData = this.tableData; // 初始化表格数据
    // }
  },
  mounted() {
    //this.fetchTableData(); // 在组件挂载时获取数据
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
