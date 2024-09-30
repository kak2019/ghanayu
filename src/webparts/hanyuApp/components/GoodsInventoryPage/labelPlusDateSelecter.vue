<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-date-picker
        v-model="innerValue"
        type="month"
        placeholder="选择日期"
        class="custom-date-picker"
        @change="handleChange"
        :disabled-date="disabledDate"
        :editable="false"
        :clearable="false"
        style="max-width: 127px;"
        size="small"
    ></el-date-picker>
  </div>
</template>

<script>
import { CONST } from '../../../../config/const';
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
      this.$emit('update:modelValue', value);
    },

    disabledDate(date) {
      //const start = new Date('2024-01'); // 2024-08-01
      const start = new Date(`${CONST.beginOperationDate}`);
      //const end = new Date('2025-12'); // 2024-08-31
      const end = new Date(`${CONST.endOperationDate}`);
      return date < start || date > end;
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
  width: 67px ;
  font-size: 12px;
  padding-left: 30px; /* 调整label文字位置 */
  padding-right: 30px;
  /*border: 1px solid #000; /* 添加边框 */
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