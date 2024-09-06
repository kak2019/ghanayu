import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IStockResultModificationItem,IStockHistoryItem } from '../model';
import { CONST } from '../config/const';
import { useStockHistoryStore } from '../stores/stockhistory';
import { useBillOfMaterialsStore } from './billofmaterials';
import { usePartMasterStore } from '../stores/part';

export const useStockResultModificationStore = defineStore(FeatureKey.STOCKRESULTMODIFICATION, {
    state: () => ({
        stockResultModifications: [] as IStockResultModificationItem[],
    }),
    getters: {
        stockHistoryItems: (state) => state.stockResultModifications,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKRESULTMODIFICATION}`).items.orderBy("Modified", false)();
                this.stockResultModifications = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: IStockResultModificationItem): Promise<string> {
            console.log("++++++++++++++++++++++++++++++++++++++++++++------")
            let ModifiedById = "";
            const Comment = item.Comment || "";
            if (item.ModifiedBy?.length > 0) {
                try {
                    ModifiedById = JSON.parse(item.ModifiedBy).Id;
                } catch (e) { console.log(e) }
            }
            const itemForAdd = { ...item, ModifiedById, Comment };
            delete itemForAdd.ModifiedBy;
            if (itemForAdd.ModifiedById === "") delete itemForAdd.ModifiedById;
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKRESULTMODIFICATION}`).items.add(itemForAdd);

                //Add record to StockHistory table.
                const stockHistoryStore = useStockHistoryStore();
                const latestStockQty = await stockHistoryStore.getListItemsByRegisteredDate(item.MLNPartNo, item.ProcessType);
                let stockQty;
                if(itemForAdd.FunctionID !=="07"){
                    stockQty = Number(latestStockQty) + Number(item.ModifiedQty);
                }else{
                    stockQty = Number(latestStockQty);
                }
                

                const billOfMaterialsItem = {
                    MLNPartNo: itemForAdd.MLNPartNo,
                    ProcessType: itemForAdd.ProcessType, // need to get form 工程区分，and covert to Janpnese words
                    UDPartNo: itemForAdd.UDPartNo,
                    Qty: itemForAdd.ModifiedQty,
                    FunctionID: itemForAdd.FunctionID,
                    StockQty: stockQty,
                } as IStockHistoryItem;
                await stockHistoryStore.addListItem(billOfMaterialsItem);

                if(itemForAdd.FunctionID==="06" || itemForAdd.FunctionID ==="07"){

                    //Get UD part number in the part master table that corresponds to the entered MLN part number
                    const partMasterStore = usePartMasterStore();
                    const udPartNo = await partMasterStore.getListItemByMLNPartNo(itemForAdd.MLNPartNo);
                    //itemForAdd.UDPartNo = udPartNo;

                    const billOfMaterialsStore = useBillOfMaterialsStore();
                    const stockHistoryStore = useStockHistoryStore();
                    const partRecords = await billOfMaterialsStore.getItemsByMLNPartNoProcessType(item.MLNPartNo, item.ProcessType)
                    // Get item information for front process
                    let structureQty;
                    let ChildPartNo;
                    let ChildProcessType;
                    let lastProcessStockQty;
                    for (const record of partRecords) { 
                      //const { ChildPartNo, ChildProcessType } = record;
                      ChildPartNo = record.ChildPartNo;
                      ChildProcessType = record.ChildProcessType;
                      structureQty = Number(record.StructureQty);
                    }
                    lastProcessStockQty = await stockHistoryStore.getLatestStockQtyByMLNPartNoProcessTypeDesc(ChildPartNo, ChildProcessType);
                    lastProcessStockQty = Number(lastProcessStockQty) + Number(item.ModifiedQty) * -1
                    // Get item information for front process
                    const bomItemLastProcess = {
                        MLNPartNo: ChildPartNo,
                        ProcessType: ChildProcessType,
                        UDPartNo: udPartNo,
                        Qty: Number(itemForAdd.ModifiedQty) * -1 * structureQty, //Number of corrections entered × -1 * Structured Quantity in BOM table
                        FunctionID: "08", // it's only "08" in this process.
                        StockQty: lastProcessStockQty, //Latest stock quantity + entered correction quantity × -1																	
                    } as IStockHistoryItem;
                    await stockHistoryStore.addListItem(bomItemLastProcess);
                }
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});