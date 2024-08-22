<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-autocomplete
        v-model="innerValue"
        :fetch-suggestions="querySearch"
        clearable
        style="width: 120px; border: 1px solid #000000; border-radius: 0;"
        placeholder=""
        @select="handleChange"
        :props="{
        value: 'value',
        label: 'text'
      }"
    />
  </div>
</template>

<script>
import { usePartMasterStore } from '../../../../stores/part'; // 更新为你的实际路径

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
    searchField: {
      type: String,
      default: 'MLN' // 默认为 'MLN'，可以传入 'UD' 或其他值
    }
  },
  data() {
    return {
      innerValue: this.modelValue,
      selectedText: '', // 用于显示选中文本的数据属性
      parts: [] // 用于存储从store中获取的parts数据
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
      let results = [];
      if (queryString) {
        const searchKey = this.searchField === 'UD' ? 'UDPartNo' : 'MLNPartNo';
        results = this.parts
            .filter(part => part[searchKey].indexOf(queryString) >= 0)
            .map(part => ({
              value: part[searchKey],
              text: part[searchKey]
            }));
      }
      cb(results);
    },
    async fetchParts() {
      const partMasterStore = usePartMasterStore();
      try {
        await partMasterStore.getListItems(); // 获取parts数据
        this.parts = partMasterStore.partMasterItems; // 存储到本地数据中
      } catch (error) {
        console.error('Error fetching parts:', error);
      }
    }
  },
  mounted() {
    this.fetchParts(); // 在组件挂载时获取parts数据
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
