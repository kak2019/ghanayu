import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IBillOfMaterialsItem } from '../model';

export const useBillOfMaterialsStore = defineStore(FeatureKey.BILLOFMATERIALS, {
    state: () => ({
        billOfMaterials: [] as IBillOfMaterialsItem[],
    }),
    getters: {
        billOfMaterialsItems: (state) => state.billOfMaterials,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.orderBy("ParentPartNo", true)();
                this.billOfMaterials = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        }

    },
});