import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IPartMasterItem } from '../model';
import { useStockHistoryStore } from '../stores/stockhistory'
import { CONST } from '../config/const';
import { useProcessMasterStore } from '../stores/process';
import { computed} from 'vue';

export const usePartMasterStore = defineStore(FeatureKey.PARTMASTER, {
    state: () => ({
        parts: [] as IPartMasterItem[],
        filteredParts: [] as IPartMasterItem[],
        filteredPartsForGoodsInventory: [] as IPartMasterItem[],
    }),
    getters: {
        partMasterItems: (state) => state.parts,
        partMasterMLNItems: (state) => state.parts.map(part => part.MLNPartNo),
        partMasterUDItems: (state) => state.parts.map(part => part.UDPartNo),
        filteredPartMasterItems:(state) => state.filteredParts,
        filteredPartMasterForGoodsInventoryItems:(state) => state.filteredParts,
    },
    actions: {
        async getListItemById(itemId: number): Promise<IPartMasterItem> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const item = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId)();
                return item;
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);

            }
        },
        async getListItemByMLNPartNo(mlnPartNo: string): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).getItemsByCAMLQuery({
                    ViewXml: `
                      <View>
                        <Query>
                          <Where>
                            <Eq>
                              <FieldRef Name='MLNPartNo' />
                              <Value Type='Text'>${mlnPartNo}</Value>
                            </Eq>
                          </Where>
                        </Query>
                        <RowLimit>1</RowLimit>
                      </View>
                    `
                });
                if (items.length > 0) {
                    return items[0].UDPartNo;
                } else {
                    return null;
                }
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        
        async getItemCountByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<number> {
            console.log("start");
            try {
                let count = 0
                await this.getListItems().then(() => {
                    const items = computed(() => this.partMasterItems).value.filter(i => (i.MLNPartNo === mlnPartNo && (i.ProcessType!==null && i.ProcessType.indexOf(processType)>=0)));
                    console.log("items:" + items);
                    count = items.length; 
                });
                console.log("count:---" + count);
                return count
            }catch(error){
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getListItems() {
            let allItems: IPartMasterItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IPartMasterItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items
                        .select('ID', 'MLNPartNo', 'UDPartNo', 'ProcessType', 'Registered', 'Modified')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo,
                        ProcessType: item.ProcessType,
                        Registered: item.Registered,
                        Modified: item.Modified
                    }))
                    allItems = allItems.concat(selectedItems);
                    skip += pageSize;
                    hasNext = items.length === pageSize;
                }
                catch (error) {
                    console.error(error);
                    throw new Error(`データの取得中にエラーが発生しました`);
                    hasNext = false;
                }
            }
            const uniqueItems = Array.from(new Set(allItems.map(item => item.ID)))
                .map(id => allItems.find(item => item.ID === id));
            uniqueItems.sort((a, b) => a.MLNPartNo.localeCompare(b.MLNPartNo));
            this.parts = uniqueItems;

        },
        async addListItem(item: IPartMasterItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    UDPartNo: item.UDPartNo,
                    Registered: new Date()
                });
                return '登録完了。';
            }
            catch (error) {
                if (error.message.includes("duplicate value")) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`データの登録中にエラーが発生しました`);
                }
            }
        },
        async updateListItem(itemId: number, item: IPartMasterItem, processType: string = null, isUpdate: boolean = true): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                if (processType) {
                    const item = await this.getListItemById(itemId);
                    const values = (item.ProcessType || '').split(';');
                    if (isUpdate) {
                        if (values.indexOf(processType) === -1) {
                            values.push(processType);
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== '').join(';')
                            });
                        }
                    }
                    else {
                        if (values.indexOf(processType) !== -1) {
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== processType).join(';')
                            });
                        }
                    }

                }
                else {
                    await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                        // MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo
                    });
                }
                return '登録完了。';
            }
            catch (error) {
                if (error.message.includes("duplicate value")) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`データの登録中にエラーが発生しました`);
                }
            }
        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).delete();
                return '消去完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの削除中にエラーが発生しました`);
            }
        },
        getProcessNameByType(ProcessType: string){

            const processMasterStore = useProcessMasterStore();
            
            if(ProcessType ==="Z"){
              return "支給"
            }else if(ProcessType ==="CH"){
              return "出荷"
            }else{
              const tableData = computed(() => processMasterStore.processMasterItems);
              const newTableData = tableData.value;
              const tableProcessName = newTableData.filter(item => {
                if(item.ProcessType === ProcessType){
                  return true
                }else{
                  return false
                }
              });
              if(tableProcessName.length>0)
              {
                return tableProcessName[0].ProcessName
              }else{
                return "";
              }
            }
        },
        async getListItemsBySearchItems(date: string, processType: string, mlnPartNo: string, udPartNo: string) {
            try {
                //let items = [];
                let tableData = computed(() => this.partMasterItems);
                if(tableData.value.length <=0){
                    await this.getListItems().then(() => {
                        tableData = computed(() => this.partMasterItems);
                    });
                }
                const items = tableData;
                let tempItems;
                //filter part list with process type
                if (processType !== "") {
                    tempItems = items.value.filter(item => {
                        let condition = true;
                        //console.log(item.ID + "item.ProcessType-----------" + item.ProcessType);
                        const isProcessTypeIn = (item.ProcessType !== null) && (item.ProcessType.indexOf(processType) >= 0)
                        if (isProcessTypeIn) {
                            condition = condition && isProcessTypeIn
                        } else {
                            condition = false;
                        }
                        item.ProcessTypeName = this.getProcessNameByType(processType);
                        return condition;
                    });
                }else{
                    tempItems = items.value;
                }

                //filter parts list with process type
                const MLNPartNoValue = mlnPartNo.trim();
                const UDPartNoValue = udPartNo.trim();
                const isEmpty1 = MLNPartNoValue === "";
                const isEmpty2 = UDPartNoValue === "";
                if (isEmpty1 && isEmpty2) {
                    console.log("");
                } else {
                    tempItems = tempItems.filter(item => {
                        let condition = true;
                        const filterByMLNPartNo = !isEmpty1 && item.MLNPartNo.indexOf(MLNPartNoValue) >= 0;
                        const filterByUDPartNo = !isEmpty2 && item.UDPartNo.indexOf(UDPartNoValue) >= 0;

                        if (!isEmpty1 && !isEmpty2) {
                            condition = condition && filterByMLNPartNo
                        } else {
                            condition = condition && (filterByMLNPartNo || filterByUDPartNo)
                        }
                        return condition;
                    });
                }

                //Beginning of caculation
                const currentMonth = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1);
                const stockHistoryStore = useStockHistoryStore();
                //前月末在庫
                const listWithAllLastMonthQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getLastMonthsLatestStockQtyByMln(item.MLNPartNo, processType, currentMonth);
                }));

                //当月実績 - 不良
                const listWithCurrentMonthDefectsQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurrentMonthDefectsQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));

                //当月実績 - 完成
                const listWithCurrentMonthCompletionQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurrentMonthCompletionQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));


                //当月実績 - 振替
                const listWithCurrentMonthShippingQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurrentMonthShippingQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));


                //当月末在庫
                const listWithCurentMonthStockQtyByMlnNo = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurentMonthStockQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));

                for (let i = 0; i < tempItems.length; i++) {
                    tempItems[i].lastLatestMonthQty = listWithAllLastMonthQty[i].toString();
                    tempItems[i].currentMonthDefectsQty = listWithCurrentMonthDefectsQty[i].toString();
                    tempItems[i].currentMonthCompletionQty = listWithCurrentMonthCompletionQty[i].toString();
                    tempItems[i].currentMonthShippingQty = listWithCurrentMonthShippingQty[i].toString();
                    tempItems[i].curentMonthStockQty = listWithCurentMonthStockQtyByMlnNo[i].toString();
                }

                this.filteredParts = tempItems;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async getListItemsBySearchItemsForGoodsInventory(date: string, processType: string, mlnPartNo: string, udPartNo: string) {
            try {
                let tableData = computed(() => this.partMasterItems);
                await this.getListItems().then(() => {
                    tableData = computed(() => this.partMasterItems);
                });
                
                const items = tableData;
                let tempItems;
                //filter part list with process type
                if (processType !== "") {
                    tempItems = items.value.filter(item => {
                        let condition = true;
                        //console.log(item.ID + "item.ProcessType-----------" + item.ProcessType);
                        const isProcessTypeIn = (item.ProcessType !== null) && (item.ProcessType.indexOf(processType) >= 0)
                        if (isProcessTypeIn) {
                            condition = condition && isProcessTypeIn
                        } else {
                            condition = false;
                        }
                        return condition;
                    });
                }

                //filter parts list with process type
                const MLNPartNoValue = mlnPartNo.trim();
                const UDPartNoValue = udPartNo.trim();
                const isEmpty1 = MLNPartNoValue === "";
                const isEmpty2 = UDPartNoValue === "";
                if (isEmpty1 && isEmpty2) {
                    console.log("");
                } else {
                    tempItems = tempItems.filter(item => {
                        let condition = true;
                        const filterByMLNPartNo = !isEmpty1 && item.MLNPartNo.indexOf(MLNPartNoValue) >= 0;
                        const filterByUDPartNo = !isEmpty2 && item.UDPartNo.indexOf(UDPartNoValue) >= 0;

                        if (!isEmpty1 && !isEmpty2) {
                            condition = condition && filterByMLNPartNo
                        } else {
                            condition = condition && (filterByMLNPartNo || filterByUDPartNo)
                        }
                        return condition;
                    });
                }

                //Beginning of caculation
                const currentMonth = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1);
                const stockHistoryStore = useStockHistoryStore();
                //前月末在庫
                const listWithAllLastMonthQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getLastMonthsLatestStockQtyByMln(item.MLNPartNo, processType, date);
                }));
                //console.log("----------" + listWithAllLastMonthQty);
                //console.log("----------length" + listWithAllLastMonthQty.length);

                //当月実績 - 入库
                const listWithCurrentMonthInQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurrentMonthInQtyByMlnNo(item.MLNPartNo, 'F', currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthCompletionQty);
                //console.log("----------length" + listWithCurrentMonthCompletionQty.length);

                //当月実績 - 出库
                const listWithCurrentMonthOutQty = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurrentMonthOutQtyByMlnNo(item.MLNPartNo, 'F', currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthShippingQty);
                //console.log("----------length" + listWithCurrentMonthShippingQty.length);

                //当月末在庫
                const listWithCurentMonthStockQtyByMlnNo = await Promise.all(tempItems.map(async item => {
                    return await stockHistoryStore.getCurentMonthStockQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));

                for (let i = 0; i < tempItems.length; i++) {
                    tempItems[i].lastLatestMonthQty = listWithAllLastMonthQty[i].toString();
                    tempItems[i].currentMonthInQty = listWithCurrentMonthInQty[i].toString();
                    tempItems[i].currentMonthOutQty = listWithCurrentMonthOutQty[i].toString();
                    tempItems[i].curentMonthStockQty = listWithCurentMonthStockQtyByMlnNo[i].toString();
                }
                console.log("========" + tempItems);
                this.filteredPartsForGoodsInventory = tempItems;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});