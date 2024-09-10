<template>
  <el-row class="background-layer main">
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="検収実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="支給元"></Selecter>
    </div>
    <div class="background-layer">
      <Input v-model="form.id" label="Call off id" labelColor="#fbf4f4"></Input>
    </div>
    <div class="background-layer">
      <Input v-model="form.note" label="Despatch note" labelColor="#92cddc"></Input>
    </div>
    <div class="background-layer">
      <InputRemoteData v-model="form.num" label="MLN部品番号"/>
    </div>
    <div class="background-layer">
      <Input v-model="form.count" label="受入数"/>
    </div>
    <el-button
        style="width: 100px; height: 30px; margin-top: 5px; border-radius: 50px;"
        @click="submitForm"
        type="primary"
    >
      登録
    </el-button>
    <el-button type="success" style="width: 100px; height: 30px; margin-top: 5px;border-radius: 50px;"
               @click="resetForm"
    >キャンセル
    </el-button>
    <el-button style="width: 100px; height: 30px; margin-top: 5px; border-radius: 50px;"
    @click="downloadExcel"
    >
      ダウンロード
    </el-button>
  </el-row>
  <TableShipping :tableData="tableData" :loading="loading"></TableShipping>
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
import { usePartMasterStore } from '../../../../stores/part';


// 获取 Pinia store 实例
const shiKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
const defaultShikyufrom = "2922";
let curentDate = new Date();
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
      tableData: [],
      loading: true,
      form: {
        date: curentDate,
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
        //Add new record to good receive page
        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: "",
          ProcessType: "F",
          SHIKYUFrom: this.form.select,
          GoodsReceiveQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          GoodsReceiveDate: this.form.date,
        };

        //Get UD part number in the part master table that corresponds to the entered MLN part number
        const partMasterStore = usePartMasterStore();
        const udPartNo = await partMasterStore.getListItemByMLNPartNo(newItem.MLNPartNo);
        newItem.UDPartNo = udPartNo;

        //Add record to good receive table
        const message = await shiKYUGoodsReceiveStore.addListItem(newItem);
        this.$message.success(message);
        await this.fetchTableData();

        this.resetForm(); // 调用 reset 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }
    },
    async fetchTableData() {
      try {
        await shiKYUGoodsReceiveStore.getListItems(this.form.date).then(() => {
          this.loading = false;
        
          this.tableData = shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems
          .filter(item => {
            let condition = true

            const firstDayOfMonth = new Date(curentDate.getFullYear(), curentDate.getMonth(), 1);

            condition = condition && (new Date(firstDayOfMonth) <= new Date(item.GoodsReceiveDate)) && (new Date(item.GoodsReceiveDate) <= new Date(curentDate.toISOString()))
            return condition
        });
        }).catch(error => {
          this.loading = false;
          ElMessage.error(error.message);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    resetForm() {
      this.form = {
        date: curentDate,
        select: defaultShikyufrom,
        id: '',
        note: '',
        num: '',
        count: ''
      };
    },

    downloadExcel() {
      const data = this.tableData.map(item => ({
        '検収実績日': this.formatDate({GoodsReceiveDate: item.GoodsReceiveDate}, { property: 'GoodsReceiveDate' }),
        '支給元': item.SHIKYUFrom,
        'Call off id': item.Calloffid,
        'Despatch note': item.Despatchnote,
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '受入数': item.GoodsReceiveQty,
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
    },

    addOneDay(date) {
      let result = new Date(date);
      result.setDate(result.getDate() + 1);
      return result;
    }
  },
  async mounted() {
    await this.fetchTableData();
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
.el-input__inner {
  font-size:12px;
}
</style>
