<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">在庫管理表 (工程別)</div>
    </el-col>
  </el-row> <!-- 关闭第一个 el-row 标签 -->
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer" style="margin-right: 20px;">
        <date-picker-with-label v-model="form.date" label="当月年月"></date-picker-with-label>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <Selecter v-model="form.select" label="工程区分"></Selecter>
      </div>
      <div class="background-layer" style="margin-right: 20px;">
        <Input v-model="form.num" label="MLN部品番号" />
      </div>
      <div class="background-layer">
        <Input v-model="form.num" label="UD部品番号" />
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;">検索</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px;margin-bottom: 10px;">キャンセル</el-button>
      <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;">ダウンロード</el-button>
    </div>
  </el-row>

    <TableShipping></TableShipping>

</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import Input from './input.vue'

export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input
  },
  data() {
    return {
      form: {
        date: '',
        select: '',
        // 其他表单字段
      }
    };
  }
}
</script>

<style scoped>
.custom-header {
  background-color: black;
  color: white;
  padding: 10px;
  font-size: 16px;
  text-align: left;
}

.background-layer {
  background-color: #F2F2F2;
}

.main {
  padding: 20px;
}

.main .background-layer {
  margin-bottom: 10px;
}
</style>
