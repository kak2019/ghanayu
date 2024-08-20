import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { ISHIKYUGoodsReceiveItem, IStockHistoryItem } from '../model';
import { useStockHistoryStore} from '../stores/stockhistory';
import { useBillOfMaterialsStore } from '../stores/billofmaterials';

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

                const billOfMaterialsStore = useBillOfMaterialsStore();
                console.log("-----------------" + item.ProcessType);
                const isMlnNumInBom = await billOfMaterialsStore.getItemCountByMLNPartNoProcessType(item.MLNPartNo, item.ProcessType);
                if(isMlnNumInBom){
                    //Add shikyyuan to good receive table
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

                    //Add record to StockHistory table.
                    const stockHistoryStore = useStockHistoryStore();
                    const stockQty = 0 +  item.GoodsReceiveQty;
                    const billOfMaterialsItem = {
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType, // need to get form 工程区分，and covert to Janpnese words
                        UDPartNo: item.UDPartNo,
                        Qty: item.GoodsReceiveQty,
                        FunctionID: "01", // need to check if it's only "01"
                        StockQty: stockQty, //Latest QTY  +  受入数, need to caculate
                    } as IStockHistoryItem;
                    await stockHistoryStore.addListItem(billOfMaterialsItem);

                    return '登録完了。';
                }else{
                    throw new Error(`存在チェックに失敗しました`);//
                }
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});