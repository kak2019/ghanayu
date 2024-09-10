import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IFunctionsMasterItem } from '../model';
import { CONST } from '../config/const';

export const useFunctionsMasterStore = defineStore(FeatureKey.FUNCTIONSMASTER, {
    state: () => ({
        functions: [] as IFunctionsMasterItem[],
    }),
    getters: {
        functionsMasterItems: (state) => state.functions,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameFUNCTIONSMASTER}`).items
                    .select('FunctionID', 'FunctionName', 'ProcessName', 'ID', 'Modified')
                    .top(8)
                    .orderBy("FunctionID", true)();
                this.functions = items.map(item => ({
                    FunctionID: item.FunctionID,
                    FunctionName: item.FunctionName,
                    ProcessName: item.ProcessName,
                    ID: item.ID,
                    Modified: item.Modified
                }));
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});