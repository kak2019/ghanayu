<template>
<div class="date-picker-with-label">
  <label class="custom-label">{{ label }}</label>
  <el-select v-model="innerValue" placeholder="Please select" @change="handleChange" style="max-width: 128px;"
        size="small">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</div>
</template>
 
<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String],
      required: true
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      innerValue: this.modelValue,
    };
  },
  methods: {
    handleChange(value) {
      this.$emit('update:modelValue', value);
    }
  },
  watch: {
    modelValue(newValue) 
    {
      this.innerValue = newValue;
    },
    innerValue(newValue) {
      this.$emit('update:modelValue', newValue);
    }
  },
  mounted() {
    //this.fetchOptions(); // 在组件挂载时获取数据
    //this.$emit('update:modelValue', value);
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
  padding-left: 25px; /* 调整label文字位置 */
  padding-right: 30px;
  /* border: 1px solid #000; /* 添加边框 */
  background-color: #fabf8f;
}

.custom-date-picker {
  width: 100px; /* 调整日期选择器的宽度 */
}
</style>