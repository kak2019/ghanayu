<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-select
        v-model="innerValue"
        placeholder="Please select"
        @change="handleChange"
        style="max-width: 128px; border: 1px solid #000; border-top:none;"
        size="small"
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
import { useSHIKYUFromStore } from '../../../../stores/shikyufrom'; // 更新为你的实际路径

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
    options:{
      type: Array,
      default:()=>[]
    }
  },
  data() {
    return {
      innerValue: this.modelValue,
      options: [] // 初始化为空数组，稍后从store中获取数据
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
    async fetchOptions() {
      const shiYueFromStore = useSHIKYUFromStore();
      try {
       await  shiYueFromStore.getListItems(); // 获取数据
        console.log(shiYueFromStore.shikyuFromItems ,"res")

        this.options = shiYueFromStore.shikyuFromItems.map(item => ({
          value: item.Title,
          label: item.Title
        }));
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }
  },
  mounted() {
    this.fetchOptions(); // 在组件挂载时获取数据
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
  border: 1px solid #000; /* 添加边框 */
  background-color: #fabf8f;
}

.custom-date-picker {
  width: 100px; /* 调整日期选择器的宽度 */
}
</style>
