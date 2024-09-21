<template>
  <el-row class="background-layer main" style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-grow: 1;">
      <div class="background-layer">
        <date-picker-with-label
          v-model="form.date"
          label="検収実績日"
        ></date-picker-with-label>
      </div>
      <div class="background-layer">
        <Selecter v-model="form.select" label="支給元"></Selecter>
      </div>
      <div class="background-layer">
        <Input
          v-model="form.id"
          label="Call off id"
          labelColor="#92cddc"
          :inputWidth="110"
          :max-length="10"
        ></Input>
      </div>
      <div class="background-layer">
        <Input
          v-model="form.note"
          label="Despatch note"
          labelColor="#92cddc"
          :inputWidth="150"
          :max-length="17"
        ></Input>
      </div>
      <div class="background-layer">
        <InputRemoteData v-model="form.num" label="MLN部品番号" />
      </div>
      <div class="background-layer">
        <Input v-model="form.count" label="受入数" :inputWidth="125" />
      </div>
    </div>
      <div style="text-align: right; flex-shrink: 0;">
        <el-button
          plain
          size="large"
          @click="submitForm"
          type="primary"
          style="width: 100px"
          v-loading.fullscreen.lock="fullscreenLoading"
          :disabled="isBusinessControler"
        >
          登録
        </el-button>
        <el-button plain size="large" style="width: 100px" @click="resetForm" :disabled="isBusinessControler"
          >キャンセル
        </el-button>
        <el-button plain size="large" style="width: 100px" @click="downloadExcel">
          ダウンロード
        </el-button>
      </div>
  </el-row>
  <TableShipping :tableData="tableData" :loading="loading"></TableShipping>
</template>

<script>
import "./App.css";
import DatePickerWithLabel from "./labelPlusDateSelecter.vue";
import TableShipping from "./TableShipping.vue";
import Selecter from "./selecter.vue";
import InputRemoteData from "./inputRemoteData.vue";
import Input from "./input.vue";
import { useSHIKYUGoodsReceiveStore } from "../../../../stores/shikyugoodsreceive";
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus"; // 更新为你的实际路径
import { usePartMasterStore } from "../../../../stores/part";
import { useFileName } from '../../../../stores/usefilename';
import { convertToUTC } from '../../../../common/utils';
import { useUserStore } from '../../../../stores/user';
import { computed} from 'vue';

// 获取 Pinia store 实例
const shiKYUGoodsReceiveStore = useSHIKYUGoodsReceiveStore();
const defaultShikyufrom = "2922";
const userStore = new useUserStore();
const isBusinessControler = computed(() => userStore.groupInfo.indexOf('Business Controler') >= 0);
let curentDate = new Date();
export default {
  components: {
    TableShipping,
    DatePickerWithLabel,
    Selecter,
    InputRemoteData,
    Input,
  },
  data() {
    return {
      isBusinessControler: isBusinessControler,
      fullscreenLoading: false,
      tableData: [],
      loading: true,
      form: {
        date: curentDate,
        select: defaultShikyufrom,
        id: "",
        note: "",
        num: "",
        count: "",
      },
    };
  },

  methods: {
    async submitForm() {
      try {
        //Add new record to good receive page
        if (!this.form.num) {
          this.$message.error('MLNPartNo不能为空');
          return;
        }

        // 校验 MLNPartNo 的格式（10 位，由数字和英文组成）
        const mlnPartNoPattern = /^[a-zA-Z0-9]{10}$/;
        if (!mlnPartNoPattern.test(this.form.num)) {
          this.$message.error('请输入有效的MLNPartNo');
          return;
        }

        const goodsReceiveQty = Number(this.form.count);
        const isInteger = !Number.isInteger(goodsReceiveQty);
        if (isNaN(goodsReceiveQty) || goodsReceiveQty <= 0 || isInteger) {
          this.$message.error('请输入有效的受入数');
          return;
        }

        const newItem = {
          MLNPartNo: this.form.num,
          UDPartNo: "",
          ProcessType: "F",
          SHIKYUFrom: this.form.select,
          GoodsReceiveQty: parseInt(this.form.count, 10),
          Calloffid: this.form.id,
          Despatchnote: this.form.note,
          GoodsReceiveDate: convertToUTC(this.form.date),
        };
        
        this.fullscreenLoading = true;
        //
        //Check if user is already input goods after selected date.
        const hasData = await shiKYUGoodsReceiveStore.checkItemsAlreadyInGoodReceive(
          newItem.MLNPartNo,
          newItem.ProcessType,
          newItem.GoodsReceiveDate
        );
        if (isNaN(hasData) || hasData > 0) {
          this.$message.error('検収実績日エラー');
          this.fullscreenLoading = false;
          return;
        }
        //Get UD part number in the part master table that corresponds to the entered MLN part number
        const partMasterStore = usePartMasterStore();
        const udPartNo = await partMasterStore.getListItemByMLNPartNo(
          newItem.MLNPartNo
        );
        newItem.UDPartNo = udPartNo;
        //Add record to good receive table 
        const message = await shiKYUGoodsReceiveStore.addListItem(newItem);
        this.fullscreenLoading = false
        if(message!=""){
          this.$message.success(message);
        }
        await this.fetchTableData();
        this.resetForm(); // 调用 reset 方法重置表单
      } catch (error) {
        this.fullscreenLoading = false
        if(error.message==="部品表なしエラー"){
          this.$message.error(error.message);
        }else{
          this.$message.error("登録に失敗しました: " + error.message);
        }
      } finally{
        this.fullscreenLoading = false
      }
    },
    async fetchTableData() {
      try {
        await shiKYUGoodsReceiveStore
          .getListItems()
          .then(() => {
            this.loading = false;
                const firstDayOfMonth = new Date(
                  curentDate.getFullYear(),
                  curentDate.getMonth(),
                  1
                );

            this.tableData =
              shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems.filter((item) => {
                let condition = true;
                condition =
                  condition &&
                  new Date(firstDayOfMonth) <=
                    new Date(item.GoodsReceiveDate) &&
                  new Date(item.GoodsReceiveDate) <=
                    new Date(curentDate.toISOString());
                return condition;
              });
              debugger
              if(this.tableData.length===0){
                const firstDayOfLastMonth = new Date(
                  curentDate.getFullYear(),
                  curentDate.getMonth()-1,
                  1
                );
                let tempFirstDate = firstDayOfMonth;
                tempFirstDate.setDate(tempFirstDate.getDate()-1);
                const lastDayOfLastMonth = tempFirstDate;
                this.tableData =
                  shiKYUGoodsReceiveStore.shikyuGoodsReceiveItems.filter((item) => {
                    let condition = true;
                    condition =
                      condition &&
                      new Date(firstDayOfLastMonth) <=
                        new Date(item.GoodsReceiveDate) &&
                      new Date(item.GoodsReceiveDate) <=
                        new Date(lastDayOfLastMonth.toISOString());
                    return condition;
                  });
                }
          })
          .catch((error) => {
            this.loading = false;
            ElMessage.error(error.message);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    resetForm() {
      this.form = {
        date: curentDate,
        select: defaultShikyufrom,
        id: "",
        note: "",
        num: "",
        count: "",
      };
    },

    downloadExcel() {
      const data = this.tableData.map((item) => ({
        検収実績日: this.formatDate(
          { GoodsReceiveDate: item.GoodsReceiveDate },
          { property: "GoodsReceiveDate" }
        ),
        支給元: item.SHIKYUFrom,
        "Call off id": item.Calloffid,
        "Despatch note": item.Despatchnote,
        MLN部品番号: item.MLNPartNo,
        UD部品番号: item.UDPartNo,
        受入数: item.GoodsReceiveQty,
        実績登録日: this.formatDate(
          { Registered: item.Registered },
          { property: "Registered" }
        ),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Goods Receive");

      const { fileName, generateFileName } = useFileName();

      generateFileName('支給品検収実績入力');
      XLSX.writeFile(workbook, fileName.value);
    },

    formatDate(row, column) {
      const date = new Date(row[column.property]);
      const month = String(date.getMonth() + 1).padStart(1, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}/${month}/${day}`;
    },

    addOneDay(date) {
      let result = new Date(date);
      result.setDate(result.getDate() + 1);
      return result;
    },
  },
  async mounted() {
    await this.fetchTableData();
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
  background-color: #f2f2f2;
}

.main {
  padding: 10px;
}

.main .background-layer {
}
.el-input__inner {
  font-size: 12px;
}
</style>
