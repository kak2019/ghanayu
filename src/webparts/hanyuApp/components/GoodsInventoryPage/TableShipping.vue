<template>
  <el-table :data="tableData" stripe style="width: 100%" :header-cell-style="{backgroundColor: '#3f51b5', color: 'white'}">
    <!-- 第一层表头 -->
    <el-table-column prop="process" label="工程区分" width="100" rowspan="2" />
    <el-table-column prop="mlnPartNumber" label="MLN部品番号" width="180" rowspan="2" />
    <el-table-column prop="udPartNumber" label="UD部品番号" width="180" rowspan="2" />
    <el-table-column label="前月末" colspan="2">
      <el-table-column prop="previousStock" label="在庫" width="100" />
    </el-table-column>
    <el-table-column label="当月実績" colspan="3" header-align="center">
      <el-table-column prop="badProducts" label="不良" width="80" />
      <el-table-column prop="completion" label="完成" width="100" />
      <el-table-column prop="vibrationSubstitution" label="振替" width="100" />
    </el-table-column>
    <el-table-column prop="endMonthStock" label="当月末在庫" width="100" rowspan="2" />

    <!-- 第二层表头，第一层不需要嵌套内容的部分 -->
    <!-- 这里你可以根据实际数据结构再做适当调整 -->
  </el-table>

</template>

<script setup>
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    callOffId: 'CO12345',
    despatchNote: 'DN67890',
    mlnPartNumber: 'MLN-001',
    udPartNumber: 'UD-001',
    outNum: 100,
    registrationDate: '2016-05-04'
  },
  {
    date: '2016-05-02',
    name: 'John',
    callOffId: 'CO12346',
    despatchNote: 'DN67891',
    mlnPartNumber: 'MLN-002',
    udPartNumber: 'UD-002',
    outNum: 150,
    registrationDate: '2016-05-03'
  },
  {
    date: '2016-05-04',
    name: 'Alice',
    callOffId: 'CO12347',
    despatchNote: 'DN67892',
    mlnPartNumber: 'MLN-003',
    udPartNumber: 'UD-003',
    outNum: 200,
    registrationDate: '2016-05-05'
  },
  {
    date: '2016-05-01',
    name: 'Bob',
    callOffId: 'CO12348',
    despatchNote: 'DN67893',
    mlnPartNumber: 'MLN-004',
    udPartNumber: 'UD-004',
    outNum: 250,
    registrationDate: '2016-05-02'
  }
]
</script>

<style>
</style>
