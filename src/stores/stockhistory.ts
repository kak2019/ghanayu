import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IStockHistoryItem } from '../model';

export const useStockHistoryStore = defineStore(FeatureKey.STOCKHISTORY, {
    state: () => ({
        stockHistories: [] as IStockHistoryItem[],
    }),
    getters: {
        stockHistoryItems: (state) => state.stockHistories,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockHistory`).items.orderBy("Registered", false)();
                this.stockHistories = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: IStockHistoryItem): Promise<string> {
            try {
                    const sp = spfi(getSP());
                    const web = await sp.web();
                    await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockHistory`).items.add({
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: "F", // Need to check if it's only F?
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
        async getListItemsByRegisteredDate(mlnPartNo: string) : Promise<number>  {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockHistory`).items.orderBy("Registered", false)();
                items.filter(item => {
                    let condition = true
                    if(mlnPartNo) {
                      condition = condition && mlnPartNo === item.MLNPartNo
                    }
                    return condition
                  });
                console.log("items order by register date" + items);
                if(items.length>0)
                {
                    return items[0].StockQty
                }else{
                    return 0;
                }
                
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
    },
});