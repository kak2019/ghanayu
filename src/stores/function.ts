import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IFunctionsMasterItem } from '../model';

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

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/FunctionsMaster`).items.orderBy("FunctionID", true)();
                this.functions = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});