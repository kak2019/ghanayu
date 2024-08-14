<template>
  <el-table :data="SHIKYUGoodsReceiveStore.shikyuGoodsReceiveItems" stripe style="width: 100%" :header-cell-style="{backgroundColor: '#3f51b5', color: 'white'}">
    <!-- 第一层表头 -->
<!--    <el-table-column prop="ProcessType" label="工程区分" width="100" rowspan="2" />-->
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
import { onMounted, ref } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径

// 使用 ref 定义 tableData
const tableData = ref([]);

// 获取 Pinia store 实例
const SHIKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();

onMounted(async () => {
  try {
    // 调用 store 的方法获取数据
    await SHIKYUGoodsReceiveStore.getListItems();

    // 对数据进行处理以匹配表格字段
    tableData.value = SHIKYUGoodsReceiveStore.shikyuGoodsReceiveItems.map(item => ({
      // ProcessType: item.ProcessType,
      MLNPartNo: item.MLNPartNo,
      UDPartNo: item.UDPartNo,
      // BadProducts: 0, // 根据需求处理
      // Completion: item.GoodsReceiveQty, // 假设完成数量为收到的数量
      // VibrationSubstitution: 0, // 根据需求处理
      // EndMonthStock: 0, // 需要处理或计算
    }));

    console.log("Processed table data:", tableData.value);
  } catch (error) {
    console.error('Error fetching stock history:', error);
  }
});
</script>

<style>
</style>
