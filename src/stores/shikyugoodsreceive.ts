import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { ISHIKYUGoodsReceiveItem, IStockHistoryItem } from '../model';
import { useStockHistoryStore } from '../stores/stockhistory';
import { useBillOfMaterialsStore } from '../stores/billofmaterials';
import { CONST } from '../config/const';
import { computed } from 'vue';
import { isDateBefore } from '../common/utils';

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
                if (isMlnNumInBom>0) {
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
                    //return '部品表なしラエー';
                    throw new Error(`部品表なしエラー`);
                }
            }
            catch (error) {
                console.error(error);
                if(error.message==="部品表なしエラー"){
                    throw new Error(`部品表なしエラー`);
                }else{
                    throw new Error(`データの登録中にエラーが発生しました`);
                }
               
            }
        },

        async checkItemsAlreadyInGoodReceive(mlnPartNo: string, processType: string, goodsReceiveDate:string): Promise<boolean> {
            try {
                
                const goodsReceiveDateForDate = new Date(goodsReceiveDate);
                await this.getListItems();
                const items = computed(() => this.shikyuGoodsReceiveItems.filter(i => i.MLNPartNo === mlnPartNo && i.ProcessType === processType && isDateBefore(goodsReceiveDateForDate, new Date(i.GoodsReceiveDate))));
                
                const isLengthZero: boolean = (items.value.length as number) > 0? true : false;

                return isLengthZero;
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        getCurrentTimeStampMillis(date:string): string {
            /*const now = new Date();
            // 将毫秒转换为毫秒和毫秒的格式
            const millis = now.getMilliseconds().toString().padStart(3, '0');
            // 将Date对象转换为ISO字符串并截取毫秒部分
            const isoString = now.toISOString();
            return isoString.substring(0, isoString.length - 1) + '.' + millis + 'Z';*/
            return "0";
        }
    },
});