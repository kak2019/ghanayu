<template>
  <el-row class="background-layer main">
    <div class="background-layer">
      <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
    </div>
    <div class="background-layer">
      <Selecter v-model="form.select" label="出荷先"></Selecter>
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
      <Input v-model="form.count" label="出荷数"/>
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
  <TableShipping></TableShipping>
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import Input from './input.vue';
import {useShippingResultStore} from '../../../../stores/shippingresult';
import * as XLSX from 'xlsx';
import {ElMessage} from "element-plus"; // 更新为你的实际路径
import { usePartMasterStore } from '../../../../stores/part';
import { useStockHistoryStore } from "../../../../stores/stockhistory"


// 获取 Pinia store 实例
const shippingResultStore = useShippingResultStore();
const stockHistoryStore = useStockHistoryStore();

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
        date: new Date().toISOString(),
        select: '2922',
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
        // "Call of id" is max 10 digit and "despatch note" is max 17 digit.
        if (this.form.id.length > 10) {
          this.$message.error('请输入有效的Call of id');
          return;
        }

        if (this.form.note.length > 17) {
          this.$message.error('请输入有效的despatch note');
          return;
        }

        if (!this.form.num) {
          this.$message.error('MLNPartNo不能为空');
          return;
        }

        if (Number(this.form.count) < 0) {
          this.$message.error('请输入有效的出荷数');
          return;
        }

        //If the entered MLN part number with completed process is not existing in the BOM,display error message to the メッセージ.
        const partMasterStore = usePartMasterStore();
        const curPartCount = await partMasterStore.getItemCountByMLNPartNoProcessType(this.form.num,'C');
        if (curPartCount <= 0) {
          this.$message.error('Part不存在');
          return;
        }

        // If the "出荷実績日" is smaller than the latest record date in system, show error message.
        const latestResultDate = await shippingResultStore.getLatestShippingResultDateByMLNPartNoDesc(this.form.num)
        console.log('================')
        if (latestResultDate.length > 0) {
          const compareDateResult = this.compareDates(latestResultDate,this.form.date)
          if (compareDateResult === 1) {
            this.$message.error('出荷実績日エラー');
            return;
          }
        }

        //Register a record in the ShippingResult table.
        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: this.form.count,
          ShipTo: this.form.select,
          ShipQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          ShippingResultDate: this.form.date,
        };

        const message = await shippingResultStore.addListItem(newItem);
        this.$message.success(message);
        await shippingResultStore.getListItems();

        //Register an out stock record to the StockHistory table.InOutQty=negative value of (出荷数),FunctionID=04
        const latestStockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(this.form.num, 'C');
        const curUDPartNo = await partMasterStore.getListItemByMLNPartNo(this.form.num);
        const newOutStockItem = {
          MLNPartNo: this.form.num,
          ProcessType: 'C',
          UDPartNo: curUDPartNo,
          Qty: (0 - Number(this.form.count)),
          FunctionID: '04',
          StockQty:(latestStockQty - Number(this.form.count)).toString() //获取最新库存
        };

        const addFinishedStockMsg = await stockHistoryStore.addListItem(newOutStockItem);
        this.$message.success(addFinishedStockMsg);

        this.cancel(); // 调用 cancel 方法重置表单
      } catch (error) {
        this.$message.error('登録に失敗しました: ' + error.message);
      }
    },

    cancel() {
      this.form = {
        date: new Date().toISOString(),
        select: '2922',
        id: '',
        note: '',
        num: '',
        count: ''
      };
    },

    downloadExcel() {
      const data = shippingResultStore.shippingResultItems.map(item => ({
        '出荷実績日': item.ShippingResultDate,
        '出荷先': item.ShipTo,
        'Call off id': item.Calloffid,
        'Despatch note': item.Despatchnote,
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '出荷数': item.ShipQty,
        '実績登録日': this.formatDate({ Created: item.Created }, { property: 'Created' }),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipping Results');

      XLSX.writeFile(workbook, 'shipping_results.xlsx');
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    },

    compareDates(date1, date2) {
      const dateObj1 = new Date(date1);
      const dateObj2 = new Date(date2);
      if (dateObj1 > dateObj2) {
        return 1;
      } else if (dateObj1 < date2) {
        return -1;
      } else {
        return 0;
      }
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
