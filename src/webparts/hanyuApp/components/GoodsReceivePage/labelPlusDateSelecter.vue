<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-date-picker
        v-model="innerValue"
        type="date"
        placeholder="选择日期"
        class="custom-date-picker"
        @change="handleChange"
        style="max-width: 127px ; border: 1px solid #000;"
        :editable="false"
        :clearable="false"
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
      innerValue: new Date()
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
  margin-right: 10px;

}

.custom-label {
  font-size: 14px;
  font-weight: bold;
  padding-left: 25px; /* 调整label文字位置 */
  padding-right: 30px;
  border: 1px solid #000; /* 添加边框 */
  background-color: orange;
}

.custom-date-picker {
  width: 30px; /* 调整日期选择器的宽度 */
  min-width: 30px;
  max-width: 30px;
}
</style>