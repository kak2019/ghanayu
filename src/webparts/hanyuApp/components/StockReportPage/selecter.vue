<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-select
        v-model="innerValue"
        placeholder="请选择"
        @change="handleChange" 
        style="max-width: 128px; border: 1px solid #000; border-top:none;"
        size="small"
    >
      <el-option
          v-for="item in options"
          :key="item.Id"
          :label="item.ProcessName"
          :value="item.ProcessName"
      />
    </el-select>
  </div>
</template>

<script>
import { useProcessMasterStore } from '../../../../stores/process'; // 更新为你的实际路径

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
      options: [] // 用于存储从Pinia store中获取的选项数据
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
  },
  async mounted() {
    const processMasterStore = useProcessMasterStore();
    try {
      await processMasterStore.getListItems(); // 获取数据
      this.options = processMasterStore.processMasterItems.map(item => ({
        Id: item.Id,           // 保留Id用于key
        ProcessName: item.ProcessName // 用于显示的名称
      }));
      this.options.shift();
      this.options.push({"" : ""});
    } catch (error) {
      console.error('Failed to load process master items:', error);
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
  font-size: 12px;
  font-weight: bold;
  padding-left: 25px;
  padding-right: 30px;
  border: 1px solid #000;
  background-color: #fabf8f;
}

.custom-date-picker {
  width: 130px;
}
</style>
