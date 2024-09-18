<template>
  <div class="date-picker-with-label">
    <label
        class="custom-label"
        :style="{ backgroundColor: labelColor }"
    >
      {{ label }}
    </label>
    <el-input
        v-model="innerValue"
        clearable
        style="width: 120px;"
        placeholder="Please Input"
        size="small"
        @input="handleChange"
    />
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
    },
    labelColor: {
      type: String,
      default: 'orange' // 设置默认颜色
    }
  },
  data() {
    return {
      innerValue: this.modelValue,
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
  margin-right: 10px;
}

.custom-label {
  font-size: 12px;
  width: 120px;
  text-align: center;
}

.custom-date-picker {
  width: 120px;
}
</style>
