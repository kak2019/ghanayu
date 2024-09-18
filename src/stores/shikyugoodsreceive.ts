import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { ISHIKYUGoodsReceiveItem, IStockHistoryItem } from '../model';
import { useStockHistoryStore } from '../stores/stockhistory';
import { useBillOfMaterialsStore } from '../stores/billofmaterials';
import { CONST } from '../config/const';

export const useSHIKYUGoodsReceiveStore = defineStore(FeatureKey.SHIKYUGOODSRECEIVE, {
    state: () => ({
        shikyuGoodsReceives: [] as ISHIKYUGoodsReceiveItem[],
    }),
    getters: {
        shikyuGoodsReceiveItems: (state) => state.shikyuGoodsReceives,
    },
    actions: {
        async getListItems() {
            let allItems: ISHIKYUGoodsReceiveItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: ISHIKYUGoodsReceiveItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIKYUGOODSRECEIVE}`).items
                        .select('ID',
                            'MLNPartNo',
                            'UDPartNo',
                            'ProcessType',
                            'SHIKYUFrom',
                            'GoodsReceiveQty',
                            'Calloffid',
                            'Despatchnote',
                            'GoodsReceiveDate',
                            'Registered',
                            'Modified')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo,
                        ProcessType: item.ProcessType,
                        SHIKYUFrom: item.SHIKYUFrom,
                        GoodsReceiveQty: item.GoodsReceiveQty,
                        Calloffid: item.Calloffid,
                        Despatchnote: item.Despatchnote,
                        GoodsReceiveDate: item.GoodsReceiveDate,
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
            //orderBy GoodsReceiveDate false
            uniqueItems.sort((a, b) => new Date(b.GoodsReceiveDate).getTime() - new Date(a.GoodsReceiveDate).getTime());
            this.shikyuGoodsReceives = uniqueItems;
        },
        async addListItem(item: ISHIKYUGoodsReceiveItem): Promise<string> {
            try {

                const billOfMaterialsStore = useBillOfMaterialsStore();

                const isMlnNumInBom = await billOfMaterialsStore.getItemCountByMLNPartNoProcessType(item.MLNPartNo, item.ProcessType);
                if (isMlnNumInBom) {
                    //Add shikyyuan to good receive table
                    const sp = spfi(getSP());
                    const web = await sp.web();
                    await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIKYUGOODSRECEIVE}`).items.add({
                        MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo,
                        ProcessType: item.ProcessType,
                        SHIKYUFrom: item.SHIKYUFrom,
                        GoodsReceiveQty: item.GoodsReceiveQty,
                        Calloffid: item.Calloffid || "",
                        Despatchnote: item.Despatchnote || "",
                        GoodsReceiveDate: item.GoodsReceiveDate || "",
                        Registered: new Date() || ""
                    });

                    //Add record to StockHistory table.
                    const stockHistoryStore = useStockHistoryStore();
                    const latestStockQty = await stockHistoryStore.getListItemsByRegisteredDate(item.MLNPartNo, item.ProcessType);
                    const stockQty = latestStockQty + item.GoodsReceiveQty;
                    const billOfMaterialsItem = {
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType, // need to get form 工程区分，and covert to Janpnese words
                        UDPartNo: item.UDPartNo,
                        Qty: item.GoodsReceiveQty,
                        FunctionID: "01", // it's only "01" in this process.
                        StockQty: stockQty, //Latest QTY  +  受入数, need to caculate
                        Registered: item.GoodsReceiveDate || ""
                    } as IStockHistoryItem;
                    await stockHistoryStore.addListItem(billOfMaterialsItem);

                    return '登録完了。';
                } else {
                    throw new Error(`存在チェックに失敗しました`);//
                }
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        }

    },
});