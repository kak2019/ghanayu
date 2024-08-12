import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { ISHIKYUGoodsReceiveItem } from '../model';

export const useSHIKYUGoodsReceiveStore = defineStore(FeatureKey.SHIKYUGOODSRECEIVE, {
    state: () => ({
        shikyuGoodsReceives: [] as ISHIKYUGoodsReceiveItem[],
    }),
    getters: {
        shikyuGoodsReceiveItems: (state) => state.shikyuGoodsReceives,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/SHIKYUGoodsReceive`).items.orderBy("Registered", false)();
                this.shikyuGoodsReceives = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});