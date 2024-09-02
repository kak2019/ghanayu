import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IStockResultModificationItem } from '../model';

export const useStockResultModificationStore = defineStore(FeatureKey.STOCKRESULTMODIFICATION, {
    state: () => ({
        stockResultModifications: [] as IStockResultModificationItem[],
    }),
    getters: {
        stockHistoryItems: (state) => state.stockResultModifications,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockResultModification`).items.orderBy("Modified", false)();
                this.stockResultModifications = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: IStockResultModificationItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockResultModification`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: item.ProcessType,
                    UDPartNo: item.UDPartNo,
                    ModifiedQty: item.ModifiedQty,
                    FunctionID: item.FunctionID,
                    ModifiedReason: item.ModifiedReason,
                    ModifiedUser: item.Editor,
                    Despatchnote: item.Despatchnote,
                    Comment: item.Comment || "",
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});