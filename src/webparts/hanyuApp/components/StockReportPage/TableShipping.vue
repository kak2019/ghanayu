<template>
  <el-table :data="tableData" stripe style="width: 100%" :header-cell-style="{backgroundColor: '#3f51b5', color: 'white'}">
    <!-- 第一层表头 -->
    <el-table-column prop="ProcessType" label="工程区分" width="100" rowspan="2" />
    <el-table-column prop="MLNPartNo" label="MLN部品番号" width="180" rowspan="2" />
    <el-table-column prop="UDPartNo" label="UD部品番号" width="180" rowspan="2" />
    <el-table-column label="前月末在庫" colspan="2">
    </el-table-column>
    <el-table-column label="当月実績" colspan="3" header-align="center">
      <el-table-column prop="BadProducts" label="不良" width="80" />
      <el-table-column prop="Completion" label="完成" width="100" />
      <el-table-column prop="VibrationSubstitution" label="振替" width="100" />
    </el-table-column>
    <el-table-column prop="EndMonthStock" label="当月末在庫" width="100" rowspan="2" />
  </el-table>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径

const { tableData } = defineProps(['tableData'])
</script>

<style>
</style>
