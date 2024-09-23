import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IStockHistoryItem } from '../model';
import { IItem } from '@pnp/sp/items/types';
import { CONST } from '../config/const';
import { computed } from 'vue';
import { isDateBefore } from '../common/utils';

export const useStockHistoryStore = defineStore(FeatureKey.STOCKHISTORY, {
    state: () => ({
        stockHistories: [] as IStockHistoryItem[],
        currentMonthStockHistories: [] as IStockHistoryItem[],
    }),
    getters: {
        stockHistoryItems: (state) => state.stockHistories,
        currentMonthstockHistoryItems: (state) => state.currentMonthStockHistories,
    },
    actions: {
        async getListItems() {
            let allItems: IStockHistoryItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IStockHistoryItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items
                        .select('ID',
                            'MLNPartNo',
                            'ProcessType',
                            'UDPartNo',
                            'Qty',
                            'FunctionID',
                            'StockQty',
                            'Comment',
                            'Registered',
                            'Modified',
                            'SourceItemID')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        Qty: item.Qty,
                        FunctionID: item.FunctionID,
                        StockQty: item.StockQty,
                        Comment: item.Comment,
                        Registered: item.Registered,
                        Modified: item.Modified,
                        SourceItemID: item.SourceItemID,
                        Child:item.Child
                    }))
                    allItems = allItems.concat(selectedItems);
                    skip += pageSize;
                    hasNext = items.length === pageSize;
                } catch (error) {
                    console.error(error);
                    throw new Error(`データの取得中にエラーが発生しました`);
                }
            }
            const uniqueItems = Array.from(new Set(allItems.map(item => item.ID)))
                .map(id => allItems.find(item => item.ID === id));
            //orderBy Registered false
            uniqueItems.sort((a, b) => new Date(b.Registered).getTime() - new Date(a.Registered).getTime()).sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
            this.stockHistories = uniqueItems;
        },
        async getCurrentMonthListItems() {
            try {
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const nowISO = now.toISOString();
                const firstDayOfMonthISO = firstDayOfMonth.toISOString();
                const camlQuery = `
                    <View>
                        <Query>
                        <Where>
                            <And>
                            <Geq>
                                <FieldRef Name='Registered' />
                                <Value Type='DateTime'>${firstDayOfMonthISO}</Value>
                            </Geq>
                            <Leq>
                                <FieldRef Name='Registered' />
                                <Value Type='DateTime'>${nowISO}</Value>
                            </Leq>
                            </And>
                        </Where>
                        </Query>
                    </View>
                    `;
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).getItemsByCAMLQuery({ ViewXml: camlQuery });
                this.currentMonthStockHistories = items;
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }

        },
        async addListItem(item: IStockHistoryItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: item.ProcessType, 
                    UDPartNo: item.UDPartNo,
                    Qty: item.Qty,
                    FunctionID: item.FunctionID,
                    StockQty: item.StockQty,
                    Comment: item.Comment || "",
                    Registered: item.Registered || "",
                    SourceItemID: item.SourceItemID || "",
                });
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        },
        async addListItems(items: IStockHistoryItem[]): Promise<string> {
            try {
                const sp = spfi(getSP());
                const [batchedSP, execute] = sp.batched();
                const web = await sp.web();
                const list = batchedSP.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`)

                const res: IItem[] = [];
                const errors: Error[] = [];
                items.forEach((item) =>
                    list.items.add({
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        Qty: item.Qty,
                        FunctionID: item.FunctionID,
                        StockQty: item.StockQty,
                        Comment: item.Comment || "",
                        Registered: new Date(),
                        SourceItemID: item.SourceItemID || "",
                    }).then(r => res.push(r)).catch(e => errors.push(e))
                );
                await execute();
                if (res.length) console.log(res);
                if (errors.length) console.error(errors);
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        },
        async getListItemsByRegisteredDate(mlnPartNo: string, processType: string): Promise<number> {
            try {
                let items = computed(() => this.stockHistoryItems).value.sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
                //Have to use 
                await this.getListItems();
                items = computed(() => this.stockHistoryItems).value.sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
            
                let tempItems = [];
                tempItems = items.filter(item => {
                    let condition = true
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && processType === item.ProcessType
                    }
                    return condition
                });
                
                if (tempItems.length > 0) {
                    return tempItems[0].StockQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },

        async getLatestStockQtyByMLNPartNoProcessTypeDesc(mlnPartNo: string, processType: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const list = sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`);

                let items = await list.items
                    .filter(`MLNPartNo eq '${mlnPartNo}' and ProcessType eq '${processType}'`)
                    .orderBy("Registered", false)();
                    items= items.sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
                if (items.length > 0) {
                    console.log(`Found item: ${JSON.stringify(items[0])}`);
                    return items[0].StockQty;
                } else {
                    return 0;
                }

            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },

        async getLastMonthsLatestStockQtyByMln(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                let items = computed(() => this.stockHistoryItems);
                //In order to get data real time have add this, but this will make performance low
                await this.getListItems();
                items = computed(() => this.stockHistoryItems);

                const today = new Date(current);
                const firstDayOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );
                const newItems = items.value.filter(item => {
                    let condition = true;
                    const tempRegistered = new Date(item.Registered);
                    //const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && isDateBefore(tempRegistered,firstDayOfMonth)
                    }
                    return condition
                });

                if (newItems.length > 0) {
                    return newItems[0].StockQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getCurrentMonthDefectsQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems);
                //In order to get data real time have add this, but this will make performance low
                //await this.getListItems();
                //items = computed(() => this.stockHistoryItems);

                const newItems = items.value.filter(item => {
                    let condition = true
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });

                const sumInOutQty = newItems.reduce((accumulator, currentItem) => {
                    if ((currentItem.FunctionID === "03" && currentItem.Qty > 0) || currentItem.FunctionID === "07") {
                        return accumulator + currentItem.Qty;
                    }
                    return accumulator;
                }, 0);
                //console.log("1. get Current Month Defects Qty By MlnNo ===================+++" + sumInOutQty);
                return sumInOutQty
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },

        async getCurrentMonthInQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems);
                const newItems = items.value.filter(item => {
                    let condition = true
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    newItems.forEach(i => {
                        if ((i.FunctionID === "01" && i.Qty > 0) || i.FunctionID === "06") {
                            sumInOutQty += i.Qty;
                        }
                    });
                    return sumInOutQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async getCurrentMonthOutQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems);
                const newItems = items.value.filter(item => {
                    let condition = true
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                console.log("get Current Month Out Qty By MlnNo" + items);
                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    newItems.forEach(i => {
                        if ((i.FunctionID === "02" && i.Qty < 0) || (i.FunctionID === "03" && i.Qty < 0) || i.FunctionID === "08") {
                            sumInOutQty += i.Qty;
                        }
                    });
                    return 0 - sumInOutQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async getCurrentMonthCompletionQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems);
                const newItems = items.value.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });

                const sumInOutQty = newItems.reduce((accumulator, currentItem) => {
                    if ((currentItem.FunctionID === "02" && currentItem.Qty > 0) || currentItem.FunctionID === "06") {
                        return accumulator + currentItem.Qty;
                    }
                    return accumulator;
                }, 0);
                return sumInOutQty;
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getCurrentMonthShippingQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems);
                const newItems = items.value.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });

                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    if (processType !== "C") {
                        newItems.forEach(i => {
                            if ((i.FunctionID === "02" && i.Qty < 0) || (i.FunctionID === "03" && i.Qty < 0) || i.FunctionID === "08") {
                                sumInOutQty += i.Qty;
                            }
                        });
                        return sumInOutQty * -1;
                    } else {
                        newItems.forEach(i => {
                            if ((i.FunctionID === "04" && i.Qty < 0) || i.FunctionID === "08") {
                                sumInOutQty += i.Qty;
                            }
                        });
                        return sumInOutQty * -1;
                    }
                } else {
                    return 0;
                }

            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getCurentMonthStockQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const items = computed(() => this.stockHistoryItems).value.sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
                const newItems = items.filter(item => {
                    let condition = true;
                    const today = new Date(current);
                    const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && isDateBefore(new Date(item.Registered),lastDayOfCurrentMonth)
                    }
                    return condition
                });

                if (newItems.length > 0) {
                    return newItems[0].StockQty
                } else {
                    return 0;
                }
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        }
    }
});

