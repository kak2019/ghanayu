<template>
  <el-row>
    <el-col :span="24">
      <div class="custom-header">支給品検収実績入力</div>
    </el-col>
  </el-row>
  <el-row class="background-layer main">
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="検収実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="支給元"></Selecter>
    </div>
    <div class="background-layer">
      <Input v-model="form.id" label="Call off id" labelColor="skyblue"></Input>
    </div>
    <div class="background-layer">
      <Input v-model="form.note" label="Despatch note" labelColor="skyblue"></Input>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.num" label="MLN部品番号"/>
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="受入数"/>
    </div>
    <el-button
        style="width: 100px; height: 50px; margin-top: 1px; margin-bottom: 10px;"
        @click="submitForm"
    >
      登录
    </el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px"
               @click="cancel"
    >キャンセル
    </el-button>
    <el-button style="width: 100px; height: 50px; margin-top: 1px; margin-right: 10px;margin-bottom: 10px;"
    @click="downloadExcel"
    >
      ダウンロード
    </el-button>
  </el-row>
  <el-row style="margin-bottom: 10px; display: flex;flex-wrap: wrap">
    <label style="border: 1px solid black; background-color: orange; margin: 2px 0 2px 0;">メッセージ</label>
    <label style="border: 1px solid black; margin: 2px 20px 2px 0; width: 500px; display: inline-block;"></label>
  </el-row>
  <TableShipping></TableShipping>
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import Input from './input.vue';
import {useSHIKYUGoodsReceiveStore} from '../../../../stores/shikyugoodsreceive';
import * as XLSX from 'xlsx';
import {ElMessage} from "element-plus"; // 更新为你的实际路径


// 获取 Pinia store 实例
const shiKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
const defaultShikyufrom = "2922";
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input
  },
  data() {
    return {
      form: {
        date: '',
        select: '',
        id: '',
        note: '',
        num: '',
        count: ''
      }
    };
  },

  methods: {
    async submitForm() {
      try {
        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: "",
          SHIKYUFrom: this.form.select,
          GoodsReceiveQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          GoodsReceiveDate: this.form.date,
        };
        console.log(this.form.date);
        const message = await shiKYUGoodsReceiveStore.addListItem(newItem);
        this.$message.success(message);
        await shiKYUGoodsReceiveStore.getListItems();

        this.cancel(); // 调用 cancel 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }
    },

    cancel() {
      this.form = {
        date: new Date(),
        select: defaultShikyufrom,
        id: '',
        note: '',
        num: '',
        count: ''
      };
    },

    downloadExcel() {
      const data = shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems.map(item => ({
        '出荷実績日': this.formatDate({GoodsReceiveDate: item.GoodsReceiveDate}, { property: 'GoodsReceiveDate' }),
        '出荷先': item.SHIKYUFrom,
        'Call off id': item.Calloffid,
        'Despatch note': item.Despatchnote,
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '出荷数': item.GoodsReceiveQty,
        '実績登録日': this.formatDate({ Created: item.Created }, { property: 'Created' }),
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Goods Receive');

      XLSX.writeFile(workbook, 'good_receive.xlsx');
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
  }
};
</script>
<style scoped>
.custom-header {
  background-color: black;
  color: white;
  padding: 10px;
  font-size: 16px;
  text-align: left;
}

.background-layer {
  background-color: #F2F2F2;
}

.main {
  padding: 20px;
}

.main .background-layer {
  margin-bottom: 10px;
}
</style>
