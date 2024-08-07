<template>
  <el-table :data="tableData" stripe style="width: 100% ;background: #3F5F91"  :header-cell-style="{ backgroundColor: '#3F5F91', color: '#FFF' }">
    <el-table-column prop="date" label="出荷実績日" width="180" />
    <el-table-column prop="name" label="出荷先" width="180" />
    <el-table-column prop="address" label="Call off id" />
    <el-table-column prop="Despatchnote" label="Despatch note" />
    <el-table-column prop="MLN" label="MLN部品番号" />
    <el-table-column prop="UDPart" label="UD部品番号" />
    <el-table-column prop="outNum" label="出荷数" />
    <el-table-column prop="date" label="実績登録日" />
  </el-table>
</template>

<script lang="ts" setup>
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
</script>