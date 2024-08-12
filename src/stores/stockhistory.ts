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

        }

    },
});