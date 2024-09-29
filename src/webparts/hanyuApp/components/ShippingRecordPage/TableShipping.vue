<template>
  <el-table
    :data="tableData"
    stripe
    border
    style="width: 100%; font-size: 12px"
    height="320px"
    :header-cell-style="{ backgroundColor: '#366093', color: 'white' }"
    v-loading="loading"
    :style="{ height: tableHeight + 'px', overflow: 'auto'}"
  >
    <el-table-column
      prop="ShippingResultDate"
      label="出荷実績日"
      width="180"
      :formatter="formatDate"
    />
    <el-table-column prop="ShipTo" label="出荷先" width="180" />
    <el-table-column prop="Calloffid" label="Call off id" />
    <el-table-column prop="Despatchnote" label="Despatch note" />
    <el-table-column prop="MLNPartNo" label="MLN部品番号" />
    <el-table-column prop="UDPartNo" label="UD部品番号" />
    <el-table-column prop="ShipQty" label="出荷数" />
    <el-table-column
      prop="Registered"
      label="実績登録日"
      :formatter="formatDate"
    />
  </el-table>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useShippingResultStore } from "../../../../stores/shippingresult"; // 更新为你的实际路径
const { tableData, loading,tableHeight  } = defineProps(['tableData','loading','tableHeight '])
// 获取 Pinia store 实例
const shippingResultStore = useShippingResultStore();

onMounted(async () => {
  /*try {
    // 调用 store 的方法获取数据
    await shippingResultStore.getListItems().then(() => {
      const firstDayOfMonth = new Date(
        curentDate.getFullYear(),
        curentDate.getMonth(),
        1
      );
      this.tableData = shippingResultStore.shippingResultItems
        .sort(
          (a, b) =>
            new Date(b.Registered).getTime() - new Date(a.Registered).getTime()
        )
        .filter((item) => {
          let condition = true;
          condition =
            condition &&
            new Date(firstDayOfMonth) <= new Date(item.ShippingResultDate) &&
            new Date(item.ShippingResultDate) <=
              new Date(curentDate.toISOString());
          return condition;
        });
      if (this.tableData.length === 0) {
        const firstDayOfLastMonth = new Date(
          curentDate.getFullYear(),
          curentDate.getMonth() - 1,
          1
        );
        let tempFirstDate = firstDayOfMonth;
        tempFirstDate.setDate(tempFirstDate.getDate() - 1);
        const lastDayOfLastMonth = tempFirstDate;
        this.tableData = shippingResultStore.shippingResultItems
          .sort(
            (a, b) =>
              new Date(b.Registered).getTime() -
              new Date(a.Registered).getTime()
          )
          .filter((item) => {
            let condition = true;
            condition =
              condition &&
              new Date(firstDayOfLastMonth) <=
                new Date(item.ShippingResultDate) &&
              new Date(item.ShippingResultDate) <=
                new Date(lastDayOfLastMonth.toISOString());
            return condition;
          });
      }
    });
  } catch (error) {
    console.error("Error fetching shipping results:", error);
  }*/
});

// 定义日期格式化函数
const formatDate = (row, column) => {
  const date = new Date(row[column.property]);
  const month = String(date.getMonth() + 1).padStart(1, "0"); // 月份从0开始
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
};
</script>

<style></style>
