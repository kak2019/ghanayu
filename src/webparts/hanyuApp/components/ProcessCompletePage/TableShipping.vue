<template>
  <el-table :data="tableData" stripe border style="width: 100%;font-size:12px;" :header-cell-style="{backgroundColor: '#366093', color: 'white'}" height="320px">
    <!-- 第一层表头 -->
    <el-table-column prop="ProcessCompletion" label="工程完了日"  :formatter="formatDate" />
    <el-table-column prop="MLNPartNo" label="MLN部品番号" rowspan="2" />
    <el-table-column prop="UDPartNo" label="UD部品番号"  rowspan="2" />
    <el-table-column prop="DefectQty" label="不良数"  />

    <el-table-column prop="CompletionQty" label="完成数" />

    <el-table-column prop="Registered" label="実績登録日" :formatter="formatDate" />
  </el-table>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';

const { tableData } = defineProps(['tableData'])

// 定义日期格式化函数
const formatDate = (row, column) => {
  const date = new Date(row[column.property]);
  const month = String(date.getMonth() + 1).padStart(1, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
};
</script>

<style>
</style>
