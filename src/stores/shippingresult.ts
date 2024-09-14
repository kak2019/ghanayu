import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IShippingResultItem } from '../model';
import { CONST } from '../config/const';

export const useShippingResultStore = defineStore(FeatureKey.SHIPPINGRESULT, {
    state: () => ({
        shippingResults: [] as IShippingResultItem[],
    }),
    getters: {
        shippingResultItems: (state) => state.shippingResults,
    },
    actions: {
        async getListItems() {
            let allItems: IShippingResultItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IShippingResultItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIPPINGRESULT}`).items
                        .select('ID',
                            'MLNPartNo',
                            'ProcessType',
                            'UDPartNo',
                            'ShipTo',
                            'ShipQty',
                            'Calloffid',
                            'Despatchnote',
                            'ShippingResultDate',
                            'Registered',
                            'Modified')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        ShipTo: item.ShipTo,
                        ShipQty: item.ShipQty,
                        Calloffid: item.Calloffid,
                        Despatchnote: item.Despatchnote,
                        ShippingResultDate: item.ShippingResultDate,
                        Registered: item.Registered,
                        Modified: item.Modified
                    }))
                    allItems = allItems.concat(selectedItems);
                    skip += pageSize;
                    hasNext = items.length === pageSize;
                } catch (error) {
                    console.error(error);
                    throw new Error(`データの取得中にエラーが発生しました`);
                }
            }
            const uniqueItems = Array.from(new Set(allItems.map(item => item.ID)))
                .map(id => allItems.find(item => item.ID === id));
            //orderBy Registered false
            uniqueItems.sort((a, b) => new Date(b.Registered).getTime() - new Date(a.Registered).getTime());
            this.shippingResults = uniqueItems;
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
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },

        async addListItem(item: IShippingResultItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIPPINGRESULT}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: 'C',
                    UDPartNo: item.UDPartNo,
                    ShipTo: item.ShipTo,
                    ShipQty: item.ShipQty,
                    Calloffid: item.Calloffid || "",
                    Despatchnote: item.Despatchnote || "",
                    ShippingResultDate: item.ShippingResultDate || "",
                    Registered: new Date(),
                });
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        },

    },
});