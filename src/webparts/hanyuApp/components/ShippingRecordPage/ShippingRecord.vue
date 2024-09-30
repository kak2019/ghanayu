<template>
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer">
        <date-picker-with-label v-model="form.date" label="出荷実績日"></date-picker-with-label>
      </div>
      <div class="background-layer">
        <Selecter v-model="form.select" label="出荷先"></Selecter>
      </div>
      <div class="background-layer">
        <Input v-model="form.id" label="Call off id" :inputWidth="110" :max-length="10" labelColor="#92cddc"></Input>
      </div>
      <div class="background-layer">
        <Input v-model="form.note" label="Despatch note" :inputWidth="150" :max-length="17" labelColor="#92cddc"></Input>
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.num" label="MLN部品番号" labelColor="#fabf8f"/>
      </div>
      <div class="background-layer">
        <Input v-model="form.count" label="出荷数" labelColor="#fabf8f"/>
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <el-button type="primary" plain size="large" style="width: 100px;" v-loading.fullscreen.lock="fullscreenLoading" @click="submitForm" :disabled="isBusinessControler">登録</el-button>
      <el-button plain size="large" style="width: 100px;" @click="cancel" :disabled="isBusinessControler">キャンセル</el-button>
      <el-button plain size="large" style="width: 100px;"
      @click="downloadExcel"
      >
        ダウンロード
      </el-button>
    </div>
  </el-row>
  <TableShipping :tableData="tableData" :loading="loading" :height="tableHeight"></TableShipping>
</template>

<script>
import './App.css';
import DatePickerWithLabel from './labelPlusDateSelecter.vue';
import TableShipping from './TableShipping.vue';
import Selecter from './selecter.vue';
import InputRemoteData from './inputRemoteData.vue';
import Input from './input.vue';
import { ref, computed } from 'vue';
import {useShippingResultStore} from '../../../../stores/shippingresult';
import * as XLSX from 'xlsx';
import {ElMessage} from "element-plus"; // 更新为你的实际路径
import { usePartMasterStore } from '../../../../stores/part';
import { useStockHistoryStore } from "../../../../stores/stockhistory"
import { useUserStore } from '../../../../stores/user';
import { convertToUTC } from '../../../../common/utils';
import { useFileName } from '../../../../stores/usefilename';
import { getCurrentTime } from '../../../../common/utils';

const userStore = new useUserStore();
const isBusinessControler = computed(() => userStore.groupInfo.indexOf('Business Controler') >= 0);
// 获取 Pinia store 实例
const shippingResultStore = useShippingResultStore();
const stockHistoryStore = useStockHistoryStore();
let curentDate = new Date();

export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input
  },

  setup() { 
    const userStore = useUserStore();
    const isBusinessControler = computed(() => userStore.groupInfo.indexOf('Business Controler') >= 0);
    return {
      isBusinessControler
    };
  },

  data() {
    return {
      tableData:[],
      isBusinessControler: isBusinessControler,
      fullscreenLoading: false,
      loading: true,
      form: {
        date: curentDate,
        select: '2922',
        id: '',
        note: '',
        num: '',
        count: ''
      },
      tableHeight: 300
    };
  },
  methods: {
    setTableHeight() {
      // 根据需要动态计算高度，例如：窗口高度减去其他元素高度
      const windowHeight = ref(window.innerHeight);
      const spcHeight = 179;
      const minHeight = (windowHeight.value < 640) ? 200 : 400;
      this.tableHeight = windowHeight.value > minHeight + spcHeight ? windowHeight.value - spcHeight : minHeight;
    },
    async submitForm() {
      try {
        this.fullscreenLoading = true;
        debugger
        if (!this.form.num) {
          this.$message.error('MLNPartNo不能为空');
          this.fullscreenLoading = false;
          return;
        }

        const mlnPartNoPattern = /^[a-zA-Z0-9]{10}$/;
        if (!mlnPartNoPattern.test(this.form.num)) {
          this.$message.error('请输入有效的MLNPartNo');
          this.fullscreenLoading = false;
          return;
        }

        const shipQty = Number(this.form.count.toString().trim());
        const isShipQtyInteger = !Number.isInteger(shipQty);
        if (isNaN(shipQty) || Number(this.form.count) <= 0 || isShipQtyInteger) {
          this.$message.error('请输入有效的出荷数');
          this.fullscreenLoading = false;
          return;
        }

        //If the entered MLN part number with completed process is not existing in the BOM,display error message to the メッセージ.
        const partMasterStore = usePartMasterStore();
        const curPartCount = await partMasterStore.getItemCountByMLNPartNoProcessType(this.form.num,'C');
        if (curPartCount <= 0) {
          this.$message.error('部品表なしエラー');
          this.fullscreenLoading = false;
          return;
        }

        const curUDPartNo = await partMasterStore.getListItemByMLNPartNo(this.form.num);
        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: curUDPartNo,
          ShipTo: this.form.select,
          ShipQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          ShippingResultDate: convertToUTC(getCurrentTime(this.form.date))
        };        
        // If the "出荷実績日" is smaller than the latest record date in system, show error message.
        //Check if user is already input goods after selected date.
        const hasData = await shippingResultStore.checkItemsAlreadyInShipingResultes(
          newItem.MLNPartNo,
          "C",
          newItem.ShippingResultDate
        );
        if (hasData) {
            this.$message.error('出荷実績日エラー');
            this.fullscreenLoading = false;
            return;
        }

        //const curUDPartNo = await partMasterStore.getListItemByMLNPartNo(this.form.num);
        //Register a record in the ShippingResult table.

        //Register an out stock record to the StockHistory table.InOutQty=negative value of (出荷数),FunctionID=04
        const latestStockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(this.form.num, 'C');
        if(newItem.ShipQty > parseInt(latestStockQty)){
            this.$message.error('完成数が前工程の在庫数より多くなっています.');
            this.fullscreenLoading = false;
            return;
        }
        const message = await shippingResultStore.addListItem(newItem).then(async res => {
            await shippingResultStore.getListItems();

            const newOutStockItem = {
              MLNPartNo: this.form.num,
              ProcessType: 'C',
              UDPartNo: curUDPartNo,
              Qty: (0 - Number(this.form.count)),
              FunctionID: '04',
              StockQty:(latestStockQty - Number(this.form.count)).toString(), //获取最新库存
              Registered:newItem.ShippingResultDate
            };
            
            const newOutStockItemDuplicate = {
              MLNPartNo: this.form.num,
              ProcessType: '',
              UDPartNo: curUDPartNo,
              Qty: (0 - Number(this.form.count)) * -1,
              FunctionID: '04',
              StockQty: 0, //获取最新库存
              Registered:newItem.ShippingResultDate
            };

            const addFinishedStockMsg = await stockHistoryStore.addListItem(newOutStockItem);
            const addFinishedStockMsgDuplicate = await stockHistoryStore.addListItem(newOutStockItemDuplicate);
            this.$message.success(addFinishedStockMsg);
            this.fullscreenLoading = false;
            await this.fetchTableData();
            this.cancel(); 
        })
        .catch((error) => {
            this.fullscreenLoading = false;
            ElMessage.error(error.message);
        });

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
      const data = this.tableData.map(item => ({
        '出荷実績日': this.formatDate(
          { ShippingResultDate: item.ShippingResultDate },
          { property: "ShippingResultDate" }
        ) ,
        '出荷先': item.ShipTo,
        'Call off id': item.Calloffid,
        'Despatch note': item.Despatchnote,
        'MLN部品番号': item.MLNPartNo,
        'UD部品番号': item.UDPartNo,
        '出荷数': item.ShipQty,
        '実績登録日': this.formatDate({ Registered: item.Registered }, { property: 'Registered' }),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipping Results');

      const { fileName, generateFileName } = useFileName();
      generateFileName('出荷実績入力');
      XLSX.writeFile(workbook, fileName.value);
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}/${month}/${day}`;
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
    },
    async fetchTableData() {
      try {
        await shippingResultStore.getLisItemsByDate(curentDate);
        this.tableData = shippingResultStore.shippingResultItems;
        this.loading = false;
        } catch (error) {
          console.error("Error fetching shipping results:", error);
        }
    },
  },
  async mounted() {
    await this.fetchTableData();
    this.setTableHeight(); // 设置初始高度
    window.addEventListener('resize', this.setTableHeight); // 监听窗口大小变化
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setTableHeight); // 移除监听器
  },
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
  padding: 10px;
}

.main .background-layer {
}
</style>
