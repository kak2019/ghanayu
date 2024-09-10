import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IModifiedReasonMasterItem } from '../model';
import { CONST } from '../config/const';

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

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameMODIFIEDREASONMASTER}`).items
                    .select('ModifiedReasonID', 'ModifiedReasonName')
                    .top(3)
                    .orderBy("ModifiedReasonID", true)();
                this.modifiedreasons = items.map(i => ({
                    ModifiedReasonID: i.ModifiedReasonID,
                    ModifiedReasonName: i.ModifiedReasonName
                }));
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});