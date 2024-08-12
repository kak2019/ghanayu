import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IShippingResultItem } from '../model';

export const useShippingResultStore = defineStore(FeatureKey.SHIPPINGRESULT, {
    state: () => ({
        shippingResults: [] as IShippingResultItem[],
    }),
    getters: {
        shippingResultItems: (state) => state.shippingResults,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingResult`).items.orderBy("Registered", false)();
                this.shippingResults = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});