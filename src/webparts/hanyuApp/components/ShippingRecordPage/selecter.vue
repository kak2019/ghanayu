<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-select
        v-model="innerValue"
        type="date"
        placeholder="请选择"
        @change="handleChange"
        style="max-width: 130px ; border: 1px solid #000;"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
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
      type: [String],
      required: true
    }
  },
  data() {
    return {
      innerValue: this.modelValue,
      options: [
  {
    value: '2921',
    label: '2921',
  },
  {
    value: '2922',
    label: '2922',
  },
  {
    value: '2924',
    label: '2924',
  },
]
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
  width: 130px; /* 调整日期选择器的宽度 */
}
</style>