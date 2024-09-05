import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IStockHistoryItem } from '../model';
import { CONST } from '../config/const';

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
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                this.stockHistories = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

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
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: IStockHistoryItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: item.ProcessType, // Need to check if it's only F?
                    UDPartNo: item.UDPartNo,
                    Qty: item.Qty,
                    FunctionID: item.FunctionID,
                    StockQty: item.StockQty,
                    Comment: item.Comment || "",
                    Registered: new Date()
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        },
        async getListItemsByRegisteredDate(mlnPartNo: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                let tempItems = [];
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockHistory`).items.orderBy("Registered", false)();
                tempItems = items.filter(item => {
                    let condition = true
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo
                    }
                    return condition
                });
                console.log("items order by register date" + items);
                if (tempItems.length > 0) {
                    return tempItems[0].StockQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async getLatestStockQtyByMLNPartNoProcessTypeDesc(mlnPartNo: string, processType: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const list = sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`);

                const items = await list.items
                    .filter(`MLNPartNo eq '${mlnPartNo}' and ProcessType eq '${processType}'`)
                    .orderBy("Registered", false)();

                if (items.length > 0) {
                    console.log(`Found item: ${JSON.stringify(items[0])}`);
                    return items[0].StockQty;
                } else {
                    return 0;
                }

            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async getLastMonthsLatestStockQtyByMln(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                const newItems = items.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered !== current
                    }
                    return condition
                });
                console.log("get Last Months Latest Stock Qty ByMln" + newItems);
                if (newItems.length > 0) {
                    return newItems[0].StockQty
                } else {
                    return 0;
                }

            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getCurrentMonthDefectsQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                const newItems = items.filter(item => {
                    let condition = true
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                console.log("get Current Month Defects Qty By MlnNo" + items);
                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    newItems.forEach(i => {
                        if ((i.FunctionID === "03" && i.Qty > 0) || i.FunctionID === "07") {
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
        async getCurrentMonthCompletionQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                const newItems = items.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                console.log("get Current Month Completion Qty By MlnNo" + items);
                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    newItems.forEach(i => {
                        if ((i.FunctionID === "02" && i.Qty > 0) || i.FunctionID === "06") {
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
        async getCurrentMonthShippingQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                const newItems = items.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                console.log("get Current Month Shipping Qty By MlnNo" + items);
                if (newItems.length > 0) {
                    let sumInOutQty = 0;
                    if (processType !== "C") {
                        newItems.forEach(i => {
                            if ((i.FunctionID === "02" && i.Qty < 0) || (i.FunctionID === "03" && i.Qty < 0) || i.FunctionID === "08") {
                                sumInOutQty += i.Qty;
                            }
                        });
                        return sumInOutQty
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
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getCurentMonthStockQtyByMlnNo(mlnPartNo: string, processType: string, current: string): Promise<number> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKHISTORY}`).items.orderBy("Registered", false)();
                const newItems = items.filter(item => {
                    let condition = true;
                    const formatRegistered = new Date(item.Registered).getFullYear() + "-" + (new Date(item.Registered).getMonth() + 1);
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.MLNPartNo && item.ProcessType === processType && formatRegistered === current
                    }
                    return condition
                });
                //console.log("get Curent Month Stoc kQty By MlnNo " + items);
                if (newItems.length > 0) {
                    return newItems[0].StockQty
                } else {
                    return 0;
                }
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        }
    }
});