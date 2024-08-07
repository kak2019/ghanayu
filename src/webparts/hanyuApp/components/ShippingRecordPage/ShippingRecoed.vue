<template>
  <el-row>
    <el-col :span="24"><div class="custom-header">出荷実績入力</div></el-col>
  </el-row>
  <el-row class="background-layer">
  <div  style="margin-left: 30px">
    <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
  </div>
  <div class="background-layer">
    <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
  </div>
  <div class="background-layer">
    <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
  </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
    </div>
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
    </div>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">登录</el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px">キャンセル</el-button>
<!--    问题 为什么写内联样式 这个宽高才能生效-->
<!--    <el-button class="button-style">ダウンロード</el-button>-->
    <el-button style="width: 100px; height: 50px; margin-top: 1px">ダウンロード</el-button>
    <el-row>

      <label style="border:1px solid black; background-color: orange ;
      margin: 2px 0 2px 30px;">メッセージ</label>
      <Label style="border: 1px solid black;margin: 2px 20px 2px 0; width: 500px;display: inline-block;"></Label>
    </el-row>
      <TableShipping></TableShipping>



  </el-row>


</template>
<script>
import  './App.css'
import DatePickerWithLabel from './labelPlusDateSelecter.vue'
import TableShipping from "./TableShipping.vue";

export default {
  components: {
    TableShipping,
    DatePickerWithLabel
  },
  data() {
    return {
      form: {
        date: '',
        // 其他表单字段
      }
    };
}}
</script>
<style lang="css">
//button
.button-style {
  width: 100px !important;
  height: 50px!important;
  margin-top: 10px !important;
}
.el-row {
  margin-bottom: 1px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

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
