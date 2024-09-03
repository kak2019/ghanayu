<template>
  <el-table
      :data="tableData"
      style="width: 100%; font-size:12px;"
      :header-cell-style="{ backgroundColor: '#366093', color: '#fff' }"
      height="320px"
      v-loading="loading"
  >
    <el-table-column prop="Modified" label="修正年月日" width="100%" :formatter="formatDate" />
    <el-table-column prop="FunctionName" label="修正領域" width="100%"/>
    <el-table-column prop="ProcessName" label="工程区分" width="100%"/>
    <el-table-column prop="MLNPartNo" label="MLN部品番号" />
    <el-table-column prop="UDPartNo" label="UD部品番号" />
    <el-table-column prop="ModifiedQty" label="修正数" />
    <el-table-column prop="EditorName" label="修正者" />
    <el-table-column prop="ModifiedReasonName" label="修正理由" />
    <el-table-column prop="Despatchnote" label="Despatch note" />
    <el-table-column prop="Comment" label="コメント" />
  </el-table>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径


// 获取 Pinia store 实例
const { tableData, loading } = defineProps(['tableData','loading'])

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
