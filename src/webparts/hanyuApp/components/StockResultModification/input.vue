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
        style="width: 118px;"
        placeholder="Please Input"
        @input="handleChange"
        @onkeyup="handleChange"
        @onkeydown="handleChange"
        @onafterpaste="handleChange"
        @oninput="handleChange"
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
      default: '#fabf8f' // 设置默认颜色
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
      /*const regex = /^[1-9]\d*$/;
      if (!regex.test(value)) {
        value = value.substring(0, value.length - 1);
      }*/
     /*console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&");
     
      if(value==="0"){
        value=="";
      }*/
      //value=value.replace(/[^[0]/g,'').replace(/^0[0]*/g,'');
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
  width: 117px;
  text-align: center;
  /*border: 1px solid #000;*/
}

.custom-date-picker {
  width: 120px;
}
</style>
