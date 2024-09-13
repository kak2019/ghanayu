<template>
  <el-table :data="tableData" stripe style="width: 100%; font-size:12px;" :header-cell-style="{backgroundColor: '#366093', color: '#fff'}" height="800px" v-loading="loading"
  show-summary :summary-method="getSummaries">
    <!-- 第一层表头 -->
    <el-table-column prop="ProcessType" label="工程区分" width="100" rowspan="2" />
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

<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径

const { tableData,loading} = defineProps(['tableData','loading']);

const getSummaries = () => { 
  // 底部合计行   
  const lastLatestMonthQty = "100";
  const currentMonthDefectsQty =  "200";
  const currentMonthCompletionQty =   "300"
  const currentMonthShippingQty =   "400"
  const curentMonthStockQty =  "500"
  return ['', '', `合計`, `${lastLatestMonthQty}`, ` ${currentMonthDefectsQty}`,`${currentMonthCompletionQty}`, `${currentMonthShippingQty}`,`${curentMonthStockQty}`,]
}
</script>

<style>
</style>
