<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-date-picker
        v-model="innerValue"
        type="date"
        placeholder="选择日期"
        class="custom-date-picker"
        @change="handleChange"
    ></el-date-picker>
  </div>
</template>

<script>
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
    }
  }
};
</script>

<style scoped>
.date-picker-with-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px;

}

.custom-label {
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
  padding-left: 10px; /* 调整label文字位置 */
  border: 1px solid #000; /* 添加边框 */
  background-color: orange;
}

.custom-date-picker {
  width: 100px; /* 调整日期选择器的宽度 */
}
</style>