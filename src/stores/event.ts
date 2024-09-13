import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IEventItem } from '../model';
import { CONST } from '../config/const';
import { IItem } from '@pnp/sp/items/types';


export const useEventStore = defineStore(FeatureKey.EVENT, {
    state: () => ({
        events: [] as IEventItem[],
    }),
    getters: {
        eventItems: (state) => state.events,
    },
    actions: {
        async getListItems() {
            let allItems: IEventItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IEventItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameEVENTS}`).items
                        .select('ID',
                            'MLNPartNo',
                            'ProcessType',
                            'UDPartNo',
                            'Qty',
                            'FunctionID',
                            'Comment',
                            'Registered',
                            'Modified',
                            'SourceItemID')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        Qty: item.Qty,
                        FunctionID: item.FunctionID,
                        Comment: item.Comment,
                        Registered: item.Registered,
                        Modified: item.Modified,
                        SourceItemID: item.SourceItemID
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
            this.events = uniqueItems;
        },
        async addListItem(item: IEventItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameEVENTS}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: item.ProcessType, // Need to check if it's only F?
                    UDPartNo: item.UDPartNo,
                    Qty: item.Qty,
                    FunctionID: item.FunctionID,
                    Comment: item.Comment || "",
                    Registered: new Date(),
                    SourceItemID: item.SourceItemID || "",
                });
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        },
        async addListItems(items: IEventItem[]): Promise<string> {
            try {
                const sp = spfi(getSP());
                const [batchedSP, execute] = sp.batched();
                const web = await sp.web();
                const list = batchedSP.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameEVENTS}`)

                const res: IItem[] = [];
                const errors: Error[] = [];
                items.forEach(item =>
                    list.items.add({
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        Qty: item.Qty,
                        FunctionID: item.FunctionID,
                        Comment: item.Comment || "",
                        Registered: new Date(),
                        SourceItemID: item.SourceItemID || "",
                    }).then(r => res.push(r)).catch(e => errors.push(e))
                );
                await execute();
                if (res.length) console.log(res);
                if (errors.length) console.error(errors);
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        }
    }
});