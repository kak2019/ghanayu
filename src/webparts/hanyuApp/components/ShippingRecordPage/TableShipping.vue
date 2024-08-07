<template>
  <el-table :data="tableData" stripe style="width: 100%">
    <el-table-column prop="date" label="出荷実績日" width="180" />
    <el-table-column prop="name" label="出荷先" width="180" />
    <el-table-column prop="callOffId" label="Call off id" />
    <el-table-column prop="despatchNote" label="Despatch note" />
    <el-table-column prop="mlnPartNumber" label="MLN部品番号" />
    <el-table-column prop="udPartNumber" label="UD部品番号" />
    <el-table-column prop="outNum" label="出荷数" />
    <el-table-column prop="registrationDate" label="実績登録日" />
  </el-table>
</template>

<script lang="ts" setup>
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
