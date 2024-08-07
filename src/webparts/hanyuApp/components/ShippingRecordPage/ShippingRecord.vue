<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">出荷実績入力</div>
    </el-col>
  </el-row> <!-- 关闭第一个 el-row 标签 -->
  <el-row class="background-layer">
    <div style="margin-left: 30px">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">登录</el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">キャンセル</el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">ダウンロード</el-button>
    <el-row>
      <label style="border: 1px solid black; background-color: orange; margin: 2px 0 2px 30px;">メッセージ</label>
      <label style="border: 1px solid black; margin: 2px 20px 2px 0; width: 500px; display: inline-block;"></label>
    </el-row>
<!--    <TableShipping></TableShipping>-->
  </el-row> <!-- 关闭第二个 el-row 标签 -->
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
// import TableShipping from './TableShipping.vue';

export default {
  components: {
    // TableShipping,
    DatePickerWithLabel
  },
  data() {
    return {
      form: {
        date: '',
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
</style>
