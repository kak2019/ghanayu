import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IStockResultModificationItem, IStockHistoryItem } from '../model';
import { CONST } from '../config/const';
import { useStockHistoryStore } from '../stores/stockhistory';
//import { useBillOfMaterialsStore } from './billofmaterials';
//import { usePartMasterStore } from '../stores/part';
import { useUserStore } from '../stores/user';

export const useStockResultModificationStore = defineStore(FeatureKey.STOCKRESULTMODIFICATION, {
    state: () => ({
        stockResultModifications: [] as IStockResultModificationItem[],
    }),
    getters: {
        stockHistoryItems: (state) => state.stockResultModifications,
    },
    actions: {
        async getListItems() {
            let allItems: IStockResultModificationItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;

            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKRESULTMODIFICATION}`).items
                        .select('ID',
                            'MLNPartNo',
                            'ProcessType',
                            'UDPartNo',
                            'FunctionID',
                            'ModifiedQty',
                            'ModifiedReason',
                            'Despatchnote',
                            'Comment',
                            'EditorId',
                            'Registered',
                            'Modified'
                        )
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        FunctionID: item.FunctionID,
                        ModifiedQty: item.ModifiedQty,
                        ModifiedReason: item.ModifiedReason,
                        Despatchnote: item.Despatchnote,
                        Comment: item.Comment,
                        Editor: item.EditorId,
                        Registered: item.Registered,
                        Modified: item.Modified
                    }));
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
            //change editor value
            const userStore = useUserStore();
            const results = [];

            for (const { Editor, ...rest } of uniqueItems) {
                let result = Editor;
                if (Editor) {
                    const user = userStore.cachedUsers.find(u => u.Id === +Editor);
                    if (user) {
                        result = user.Title;
                    } else {
                        const remoteUser = await userStore.getUser(+Editor);
                        if (remoteUser) {
                            result = remoteUser.Title;
                            userStore.setUsers([remoteUser, ...userStore.cachedUsers]);
                        }
                    }
                }

                results.push({
                    ...rest,
                    Editor: result,
                });
            }

            this.stockResultModifications = results;
        },
        async addListItem(item: IStockResultModificationItem, LatestStockQty:number,childProcessNItemToStock:[]): Promise<string> {
            //let ModifiedById = "";
            const Comment = item.Comment || "";

            const itemForAdd = { ...item, Comment };
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSTOCKRESULTMODIFICATION}`).items.add(itemForAdd);

                //Add record to StockHistory table.
                const stockHistoryStore = useStockHistoryStore();
                //const latestStockQty = await stockHistoryStore.getListItemsByRegisteredDate(item.MLNPartNo, item.ProcessType);
                let stockQty;
                if (itemForAdd.FunctionID !== "07") {
                    stockQty = Number(LatestStockQty) + Number(itemForAdd.ModifiedQty);
                    if(itemForAdd.ProcessType === "CH"){
                        stockQty = 0;
                    }
                } else {
                    stockQty = Number(LatestStockQty);
                }

                const billOfMaterialsItem = {
                    MLNPartNo: itemForAdd.MLNPartNo,
                    ProcessType: itemForAdd.ProcessType, // need to get form 工程区分，and covert to Janpnese words
                    UDPartNo: itemForAdd.UDPartNo,
                    Qty: itemForAdd.ModifiedQty,
                    FunctionID: itemForAdd.FunctionID,
                    Registered:itemForAdd.Registered,
                    StockQty: stockQty,
                    Comment: item.Comment || "",
                } as IStockHistoryItem;
                await stockHistoryStore.addListItem(billOfMaterialsItem);

                if ((itemForAdd.FunctionID === "06" && itemForAdd.ProcessType !=="Z") || itemForAdd.FunctionID === "07") {
                    
                    let lastProcessStockQty;
                    childProcessNItemToStock.forEach(async (item) => {
                        const { ChildPartNo, UdPartNo, ChildProcessType, StockQty, StructureQty} = item;
                        lastProcessStockQty = Number(StockQty) + Number(itemForAdd.ModifiedQty) * -1;//Latest stock quantity + entered correction quantity × -1
                        let inOutQty = 0;
                        if(itemForAdd.ProcessType === "CH"){
                            inOutQty = Number(itemForAdd.ModifiedQty) * -1;
                        }else{
                            inOutQty =  Number(itemForAdd.ModifiedQty) * -1 * Number(StructureQty);//Number of corrections entered × -1 * Structured Quantity in BOM table
                        }
                        // Get item information for front process
                        const bomItemLastProcess = {
                            MLNPartNo: ChildPartNo,
                            ProcessType: ChildProcessType,
                            UDPartNo: UdPartNo,
                            Qty: inOutQty, 
                            FunctionID: "08", // it's only "08" in this process.
                            StockQty: lastProcessStockQty, 																	
                        } as IStockHistoryItem;
                        await stockHistoryStore.addListItem(bomItemLastProcess);
                    });
                    /*for (const record of childProcessNItemToStock) { 
                        const { ChildPartNo, UdPartNo, ChildProcessType, StockQty, StructureQty} = record;
                        lastProcessStockQty = Number(StockQty) + Number(itemForAdd.ModifiedQty) * -1;//Latest stock quantity + entered correction quantity × -1
                        let inOutQty = 0;
                        if(itemForAdd.ProcessType === "CH"){
                            inOutQty = Number(itemForAdd.ModifiedQty) * -1;
                        }else{
                            inOutQty =  Number(itemForAdd.ModifiedQty) * -1 * Number(StructureQty);//Number of corrections entered × -1 * Structured Quantity in BOM table
                        }
                        // Get item information for front process
                        const bomItemLastProcess = {
                            MLNPartNo: ChildPartNo,
                            ProcessType: ChildProcessType,
                            UDPartNo: UdPartNo,
                            Qty: inOutQty, 
                            FunctionID: "08", // it's only "08" in this process.
                            StockQty: lastProcessStockQty, 																	
                        } as IStockHistoryItem;
                        await stockHistoryStore.addListItem(bomItemLastProcess);
                    }*/
                }
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});