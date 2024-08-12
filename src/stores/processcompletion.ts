import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IProcessCompletionResultItem } from '../model';

export const useProcessCompletionResultStore = defineStore(FeatureKey.PROCESSCOMPLETIONRESULT, {
    state: () => ({
        processCompletionResults: [] as IProcessCompletionResultItem[],
    }),
    getters: {
        processCompletionResultItems: (state) => state.processCompletionResults,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ProcessCompletionResult`).items.orderBy("Registered", false)();
                this.processCompletionResults = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});