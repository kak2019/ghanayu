import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IShippingResultItem} from '../model';

export const useShippingResultStore = defineStore(FeatureKey.SHIPPINGRESULT, {
    state: () => ({
        shippingResults: [] as IShippingResultItem[],
    }),
    getters: {
        shippingResultItems: (state) => state.shippingResults,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingResult`).items.orderBy("Registered", false)();
                this.shippingResults = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },

        async getLatestShippingResultDateByMLNPartNoDesc(mlnPartNo: string): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const list = sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingResult`);

                const items = await list.items
                    .filter(`MLNPartNo eq '${mlnPartNo}'`)
                    .orderBy("ShippingResultDate", false)();

                if (items.length > 0) {
                    console.log(`Found item: ${JSON.stringify(items[0])}`);
                    return items[0].ShippingResultDate;
                } else {
                    return '';
                }

            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },

        async addListItem(item: IShippingResultItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingResult`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    UDPartNo: item.UDPartNo,
                    ShipTo: item.ShipTo,
                    ShipQty: item.ShipQty,
                    Calloffid: item.Calloffid || "",
                    Despatchnote: item.Despatchnote || "",
                    ShippingResultDate: item.ShippingResultDate || "",
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        },

    },
});