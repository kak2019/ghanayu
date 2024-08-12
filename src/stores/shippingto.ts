import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IShippingToItem } from '../model';

export const useFunctionsMasterStore = defineStore(FeatureKey.SHIPPINGTO, {
    state: () => ({
        shippingTos: [] as IShippingToItem[],
    }),
    getters: {
        shippingToItems: (state) => state.shippingTos,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingTo`).items.orderBy("Title", true)();
                this.shippingTos = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});