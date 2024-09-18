<template>
  <div class="date-picker-with-label">
    <label class="custom-label">{{ label }}</label>
    <el-select
        v-model="innerValue"
        placeholder="请选择"
        @change="handleChange"
        style="max-width: 130px;"
        size="small"
    >
      <el-option
          v-for="item in processOptions"
          :key="item.Id"
          :label="item.ProcessName"
          :value="item.ProcessType"
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
    },
    processOptions: {
      type:[]
    },
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
    },
    options(newValue) {
      this.$emit('update:processOptions', newValue);
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('update:modelValue', value);
    },

    // getDefaultValue() {
    //   if (!this.options || this.options.length === 0) {
    //     return ''; // 如果 options 未定义或为空，返回空字符串
    //   }

    //   const defaultOption = this.options.find(item => item.ProcessName === '生加工');
    //   return defaultOption ? defaultOption.ProcessName : ''; // 返回默认值或空字符串
    // },

    // setDefaultValue() {
    //   if (!this.innerValue) {
    //     this.innerValue = this.getDefaultValue();
    //     this.$emit('update:modelValue', this.innerValue);
    //   }
    // }
  },
  // async mounted() {
  //   const processMasterStore = useProcessMasterStore();
  //   try {
  //     await processMasterStore.getListItems(); // 获取数据
  //     this.options = processMasterStore.processMasterItems.map(item => ({
  //       Id: item.Id,           // 保留Id用于key
  //       ProcessName: item.ProcessName // 用于显示的名称
  //     }));

  //     // 设置默认值为生加工
  //     this.setDefaultValue();
  //   } catch (error) {
  //     console.error('Failed to load process master items:', error);
  //   }
  // }
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
  padding-left: 25px;
  padding-right: 30px;
  background-color: #fabf8f;
  padding-top:1px;
  padding-bottom:1px;
}

.custom-date-picker {
  width: 130px;
}
</style>
