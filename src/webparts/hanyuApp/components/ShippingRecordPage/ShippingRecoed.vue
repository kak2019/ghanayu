<template>
  <el-row>
    <el-col :span="24"><div class="custom-header">出荷実績入力</div></el-col>
  </el-row>
  <div class="background-layer">
    <date-picker-with-label v-model="form.date" label="出荷実績日" value=""></date-picker-with-label>
  </div>
  <el-row>
    <el-col :span="24">

    </el-col>
  </el-row>

</template>
<script>
import  './App.css'
import DatePickerWithLabel from './labelPlusDateSelecter.vue'

export default {
  components: {
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
  height: 600px;
}
</style>
