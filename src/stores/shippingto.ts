import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IShippingToItem } from '../model';
import { CONST } from '../config/const';

export const useShippingToStore = defineStore(FeatureKey.SHIPPINGTO, {
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

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIPPINGTO}`).items
                    .select('Title')
                    .top(3)
                    .orderBy("Title", true)();
                this.shippingTos = items.map(i => ({
                    ID: i.ID,
                    Title: i.Title
                }));
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});