<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-date-picker
        v-model="innerValue"
        type="date"
        placeholder="选择日期"
        class="custom-date-picker"
        @change="handleChange"
        :disabled-date="disabledDate"
        :editable="false"
        :clearable="false"
        style="max-width: 127px ;"
        size="small"
    ></el-date-picker>
  </div>
</template>

<script>
import { CONST } from '../../../../config/const';
import { getCurrentTime } from '../../../../common/utils';
export default {
  name: 'DatePickerWithLabel',
  props: {
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Date],
      required: true
    }
  },
  data() {
    return {
      innerValue: this.modelValue
    };
  },
  watch: {
    modelValue(newValue) {
      this.innerValue = newValue;
    },
    innerValue(newValue) {
      this.$emit('update:modelValue', newValue);
    }
  },
  methods: {
    handleChange(value) {
      if (value) { 
        const newValue = getCurrentTime(value);
        this.$emit('update:modelValue', newValue);
      }
    },

    disabledDate(date) {
      const start = new Date(`${CONST.beginOperationDate}`); // need to change to 2025-01-01
      //const end = new Date(`${CONST.endOperationDate}`);
      const end = new Date();
      return date < start || date > end;
    },

    getFirstDayOfCurrentMonth() {
      const date = new Date();
      date.setDate(1); // 将日期设置为当月的第一天
      date.setHours(0, 0, 0, 0); // 将时间设置为午夜
      return date;
    },
  }
};
</script>

<style scoped>
.date-picker-with-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px;
  margin-right: 10px;

}

.custom-label {
  width: 73px ;
  font-size: 12px;
  padding-left: 25px; /* 调整label文字位置 */
  padding-right: 30px;
 /* border: 1px solid #000;  添加边框 */
  background-color: #fabf8f;
  padding-top:1px;
  padding-bottom:1px;
}

.custom-date-picker {
  width: 30px; /* 调整日期选择器的宽度 */
  min-width: 30px;
  max-width: 30px;
}
</style>