<template>
  <el-table :data="tableData" stripe style="width: 100%" :header-cell-style="{backgroundColor: '#3f51b5', color: 'white'}">
    <!-- 第一层表头 -->
    <el-table-column prop="ProcessCompletion" label="工程完了日" width="180" :formatter="formatDate" />
    <el-table-column prop="MLNPartNo" label="MLN部品番号" width="180" rowspan="2" />
    <el-table-column prop="UDPartNo" label="UD部品番号" width="180" rowspan="2" />
    <el-table-column prop="DefectQty" label="不良数" width="80" />

    <el-table-column prop="CompletionQty" label="完成数" width="100" />

    <el-table-column prop="Created" label="実績登録日" width="180" :formatter="formatDate" />
  </el-table>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径

const { tableData } = defineProps(['tableData'])

// 定义日期格式化函数
const formatDate = (row, column) => {
  const date = new Date(row[column.property]);
  const month = String(date.getMonth() + 1).padStart(1, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
</script>

<style>
</style>
