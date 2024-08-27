import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IModifiedReasonMasterItem } from '../model';

export const useModifiedReasonMasterStore = defineStore(FeatureKey.MODIFIEDREASONMASTER, {
    state: () => ({
        modifiedreasons: [] as IModifiedReasonMasterItem[],
    }),
    getters: {
        modifiedReasonMasterItems: (state) => state.modifiedreasons,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ModifiedReasonMaster`).items.orderBy("ModifiedReasonID", true)();
                this.modifiedreasons = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});