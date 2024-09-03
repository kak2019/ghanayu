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
            let ModifiedById = "";
            const Comment = item.Comment || "";
            if (item.ModifiedBy?.length > 0) {
                try {
                    ModifiedById = JSON.parse(item.ModifiedBy).Id;
                } catch (e) { console.log(e) }
            }
            const itemForAdd = { ...item, ModifiedById, Comment };
            delete itemForAdd.ModifiedBy;
            if (itemForAdd.ModifiedById === "") delete itemForAdd.ModifiedById;
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/StockResultModification`).items.add(itemForAdd);
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});