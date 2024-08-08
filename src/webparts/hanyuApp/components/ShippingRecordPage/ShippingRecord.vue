<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">出荷実績入力</div>
    </el-col>
  </el-row> <!-- 关闭第一个 el-row 标签 -->
  <el-row class="background-layer main">
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="出荷先"></Selecter>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.id" label="Call off id"></InputRemoteData>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.note" label="Despatch note"></InputRemoteData>
    </div>
    <div class="background-layer">
      <Input v-model="form.num" label="MLN部品番号" />
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="出荷数" />
    </div>
    <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;">登录</el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">キャンセル</el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;">ダウンロード</el-button>
  </el-row> <!-- 关闭第二个 el-row 标签 -->
    <el-row style="margin-bottom: 10px; display: flex;flex-wrap: wrap">
      <label style="border: 1px solid black; background-color: orange; margin: 2px 0 2px 0;">メッセージ</label>
      <label style="border: 1px solid black; margin: 2px 20px 2px 0; width: 500px; display: inline-block;"></label>
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
