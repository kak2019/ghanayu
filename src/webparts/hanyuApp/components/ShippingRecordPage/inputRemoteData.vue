<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-autocomplete
        v-model="innerValue"
        :fetch-suggestions="querySearch"
        clearable
        style="width: 120px; border: 1px solid #000000; border-radius: 0;"
        placeholder="Please Input"
        @select="handleChange"
        :props="{
        value: 'value',
        label: 'text'
      }"
    />
<!--    &lt;!&ndash; 添加一个额外的显示元素来查看选中的值 &ndash;&gt;-->
<!--    <span>{{ selectedText }}</span>-->
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
      selectedText: '' // 添加一个用于显示选中文本的数据属性
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
      this.innerValue = value.value; // 确保更新的是value属性
      this.selectedText = value.text; // 更新显示文本
      this.$emit('update:modelValue', value.value);
    },
    querySearch(queryString, cb) {
      const value = [
        {value: '32606NA042', text: 'https://github.com/32606NA042'},
        {value: '32603NA040', text: 'https://github.com/32603NA040'},
        {value: '3228290447', text: 'https://github.com/3228290447'},
        {value: '32211NA045', text: 'https://github.com/32211NA045'},
        {value: '32243NA04H', text: 'https://github.com/32243NA04H'},
        {value: '32264NA04H', text: 'https://github.com/32264NA04H'},
        {value: '32282NA040', text: 'https://github.com/32282NA040'},
        {value: '35208NA02H', text: 'https://github.com/35208NA02H'}
      ];
      let results = [];
      if (queryString) {
        results = value.filter(val => val.value.indexOf(queryString) >= 0);
      }
      cb(results);
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
  font-size: 14px;
  font-weight: bold;
  width: 120px;
  text-align: center;
  border: 1px solid #000; /* 添加边框 */
  background-color: skyblue;
  height: 20px;
}

.custom-date-picker {
  width: 120px; /* 调整日期选择器的宽度 */
}
</style>
