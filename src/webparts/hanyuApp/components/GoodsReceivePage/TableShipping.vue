<template>
  <el-table
      :data="tableData" stripe border 
      style="width: 100%; font-size:12px;"
      :header-cell-style="{ backgroundColor: '#366093', color: '#fff' }"
      :style="{ height: tableHeight + 'px', overflow: 'auto'}"
      v-loading="loading"
  >
    <el-table-column prop="GoodsReceiveDate" label="検収実績日"  :formatter="formatDate" align="center"/>
    <el-table-column prop="SHIKYUFrom" label="支給元"  align="center"/>
    <el-table-column prop="Calloffid" label="Call off id" align="center"/>
    <el-table-column prop="Despatchnote" label="Despatch note"  align="center"/>
    <el-table-column prop="MLNPartNo" label="MLN部品番号"  align="center"/>
    <el-table-column prop="UDPartNo" label="UD部品番号" align="center"/>
    <el-table-column prop="GoodsReceiveQty" label="受入数" align="center"/>
    <el-table-column prop="Registered" label="実績登録日"  :formatter="formatDate" align="center"/>
  </el-table>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';
import { useSHIKYUGoodsReceiveStore } from '../../../../stores/shikyugoodsreceive'; // 更新为你的实际路径


// 获取 Pinia store 实例
const { tableData, loading } = defineProps(['tableData','loading'])
/*const shiKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
onMounted(async () => {
  try {
    // 调用 store 的方法获取数据
   await shiKYUGoodsReceiveStore.getListItems();
    // 将获取到的数据绑定到 tableData
    // console.log(tableData.value,"table",shippingResultStore.shippingResultItems);
    // tableData.value = shippingResultStore.shippingResultItems;
    //table = shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems;
    console.log(shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems)
  } catch (error) {
    console.error('Error fetching shipping results:', error);
  }
});*/



// 定义日期格式化函数
const formatDate = (row, column) => {
  const date = new Date(row[column.property]);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
};
</script>

<style>
</style>
