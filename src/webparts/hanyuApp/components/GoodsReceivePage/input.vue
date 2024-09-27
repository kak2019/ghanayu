<template>
  <div class="date-picker-with-label">
    <label
        class="custom-label"
        :style="{ backgroundColor: labelColor, width: inputWidth + 'px' }"
    >
      {{ label }}
    </label>
    <el-input
        v-model="innerValue"
        clearable
        :style="{ width: inputWidth + 'px' }"
        placeholder="Please Input"
        @input="handleChange"
        size="small"
        :maxlength="maxLength"
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
      default: '#fabf8f' // 设置默认颜色
    },
    maxLength:{
      type: Number,
      default : 10
    },
    inputWidth: {
      type: Number,
      default: 100
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
  width: 122px;
  text-align: center;
 /* border:solid 1px #dbdbdb;
  border-radius: 50px 0 50px 0;*/
  padding-top:1px;
  padding-bottom:1px;
}

.custom-date-picker {
  width: 120px;
}
</style>
