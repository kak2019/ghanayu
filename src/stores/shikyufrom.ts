import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { ISHIKYUFromItem } from '../model';
import { CONST } from '../config/const';

export const useSHIKYUFromStore = defineStore(FeatureKey.SHIKEYUFROM, {
    state: () => ({
        shikyuFroms: [] as ISHIKYUFromItem[],
    }),
    getters: {
        shikyuFromItems: (state) => state.shikyuFroms,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIKEYUFROM}`).items.orderBy("Title", true)();
                this.shikyuFroms = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});