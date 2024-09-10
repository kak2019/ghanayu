import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IProcessMasterItem } from '../model';
import { CONST } from '../config/const';

export const useProcessMasterStore = defineStore(FeatureKey.PROCESSMASTER, {
    state: () => ({
        processes: [] as IProcessMasterItem[],
    }),
    getters: {
        processMasterItems: (state) => state.processes,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSMASTER}`).items
                    .select('ID', 'ProcessType', 'ProcessName', 'Position', 'Modified')
                    .top(7)
                    .orderBy("Position", true)();
                this.processes = items.map(i => ({
                    ID: i.ID,
                    ProcessType: i.ProcessType,
                    ProcessName: i.ProcessName,
                    Position: i.Position,
                    Modified: i.Modified
                }));
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});