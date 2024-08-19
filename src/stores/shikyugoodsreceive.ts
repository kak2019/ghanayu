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

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/SHIKYUGoodsReceive`).items.orderBy("GoodsReceiveDate", false)();
                this.shikyuGoodsReceives = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: ISHIKYUGoodsReceiveItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/SHIKYUGoodsReceive`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    UDPartNo: item.UDPartNo,
                    ProcessType: item.ProcessType,
                    SHIKYUFrom: item.SHIKYUFrom,
                    GoodsReceiveQty: item.GoodsReceiveQty,
                    Calloffid: item.Calloffid || "",
                    Despatchnote: item.Despatchnote || "",
                    GoodsReceiveDate: item.GoodsReceiveDate || "",
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});