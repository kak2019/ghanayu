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
        @input="handleChange"
        size="small"
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
  /*border: 1px solid #000;*/
  padding-top:1px;
  padding-bottom:1px;
  background-color:#fabf8f;
}

.custom-date-picker {
  width: 120px;
}
</style>
