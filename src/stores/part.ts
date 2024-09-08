import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IPartMasterItem } from '../model';
import { useStockHistoryStore } from '../stores/stockhistory'
import { CONST } from '../config/const';

export const usePartMasterStore = defineStore(FeatureKey.PARTMASTER, {
    state: () => ({
        parts: [] as IPartMasterItem[],
    }),
    getters: {
        partMasterItems: (state) => state.parts,
        partMasterMLNItems: (state) => state.parts.map(part => part.MLNPartNo),
        partMasterUDItems: (state) => state.parts.map(part => part.UDPartNo)
    },
    actions: {
        async getListItemById(itemId: number): Promise<IPartMasterItem> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const item = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId)();
                return item;
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);

            }
        },
        async getListItemByMLNPartNo(mlnPartNo: string): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).getItemsByCAMLQuery({
                    ViewXml: `
                      <View>
                        <Query>
                          <Where>
                            <Eq>
                              <FieldRef Name='MLNPartNo' />
                              <Value Type='Text'>${mlnPartNo}</Value>
                            </Eq>
                          </Where>
                        </Query>
                        <RowLimit>1</RowLimit>
                      </View>
                    `
                });
                if (items.length > 0) {
                    return items[0].UDPartNo;
                } else {
                    return null;
                }
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getItemCountByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<number> {
            const camlQuery = {
                ViewXml: `
                <View>
                  <Query>
                    <Where>
                      <And>
                        <Eq>
                          <FieldRef Name='MLNPartNo' />
                          <Value Type='Text'>${mlnPartNo}</Value>
                        </Eq>
                        <Contains>
                          <FieldRef Name='ProcessType' />
                          <Value Type='Text'>${processType}</Value>
                        </Contains>
                      </And>                     
                    </Where>
                  </Query>
                  <RowLimit>1</RowLimit>
                </View>`
            };
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).getItemsByCAMLQuery(camlQuery);
                return items.length;
            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getListItems() {
            let allItems: IPartMasterItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IPartMasterItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items
                        .select('ID', 'MLNPartNo', 'UDPartNo', 'ProcessType', 'Registered', 'Modified')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo,
                        ProcessType: item.ProcessType,
                        Registered: item.Registered,
                        Modified: item.Modified
                    }))
                    allItems = allItems.concat(selectedItems);
                    skip += pageSize;
                    hasNext = items.length === pageSize;
                }
                catch (error) {
                    console.error(error);
                    throw new Error(`データの取得中にエラーが発生しました`);
                    hasNext = false;
                }
            }
            const uniqueItems = Array.from(new Set(allItems.map(item => item.ID)))
                .map(id => allItems.find(item => item.ID === id));
            uniqueItems.sort((a, b) => a.MLNPartNo.localeCompare(b.MLNPartNo));
            this.parts = uniqueItems;

        },
        async addListItem(item: IPartMasterItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    UDPartNo: item.UDPartNo,
                    Registered: new Date()
                });
                return '登録完了。';
            }
            catch (error) {
                if (error.message.includes("duplicate value")) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`データの登録中にエラーが発生しました`);
                }
            }
        },
        async updateListItem(itemId: number, item: IPartMasterItem, processType: string = null, isUpdate: boolean = true): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                if (processType) {
                    const item = await this.getListItemById(itemId);
                    const values = (item.ProcessType || '').split(';');
                    if (isUpdate) {
                        if (values.indexOf(processType) === -1) {
                            values.push(processType);
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== '').join(';')
                            });
                        }
                    }
                    else {
                        if (values.indexOf(processType) !== -1) {
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== processType).join(';')
                            });
                        }
                    }

                }
                else {
                    await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).update({
                        // MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo
                    });
                }
                return '登録完了。';
            }
            catch (error) {
                if (error.message.includes("duplicate value")) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`データの登録中にエラーが発生しました`);
                }
            }
        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.getById(itemId).delete();
                return '消去完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの削除中にエラーが発生しました`);
            }
        },
        async getListItemsBySearchItems(date: string, processType: string, mlnPartNo: string, udPartNo: string) {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                let items = (await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePARTMASTER}`).items.orderBy("MLNPartNo", true)());

                //filter part list with process type
                if (processType !== "") {
                    items = items.filter(item => {
                        let condition = true;
                        //console.log(item.ID + "item.ProcessType-----------" + item.ProcessType);
                        const isProcessTypeIn = (item.ProcessType !== null) && (item.ProcessType.indexOf(processType) >= 0)
                        if (isProcessTypeIn) {
                            condition = condition && isProcessTypeIn
                        } else {
                            condition = false;
                        }
                        return condition;
                    });
                }

                //filter parts list with process type
                const MLNPartNoValue = mlnPartNo.trim();
                const UDPartNoValue = udPartNo.trim();
                const isEmpty1 = MLNPartNoValue === "";
                const isEmpty2 = UDPartNoValue === "";
                if (isEmpty1 && isEmpty2) {
                    console.log("");
                } else {
                    items = items.filter(item => {
                        let condition = true;
                        const filterByMLNPartNo = !isEmpty1 && item.MLNPartNo.indexOf(MLNPartNoValue) >= 0;
                        const filterByUDPartNo = !isEmpty2 && item.UDPartNo.indexOf(UDPartNoValue) >= 0;

                        if (!isEmpty1 && !isEmpty2) {
                            condition = condition && filterByMLNPartNo
                        } else {
                            condition = condition && (filterByMLNPartNo || filterByUDPartNo)
                        }
                        return condition;
                    });
                }

                //Beginning of caculation
                const currentMonth = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1);
                const stockHistoryStore = useStockHistoryStore();
                //前月末在庫
                const listWithAllLastMonthQty = await Promise.all(items.map(async item => {
                    return await stockHistoryStore.getLastMonthsLatestStockQtyByMln(item.MLNPartNo, processType, currentMonth);
                }));
                //console.log("----------" + listWithAllLastMonthQty);
                //console.log("----------length" + listWithAllLastMonthQty.length);

                //当月実績 - 不良
                const listWithCurrentMonthDefectsQty = await Promise.all(items.map(async item => {
                    return await stockHistoryStore.getCurrentMonthDefectsQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthDefectsQty);
                //console.log("----------length" + listWithCurrentMonthDefectsQty.length);

                //当月実績 - 完成
                const listWithCurrentMonthCompletionQty = await Promise.all(items.map(async item => {
                    return await stockHistoryStore.getCurrentMonthCompletionQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthCompletionQty);
                //console.log("----------length" + listWithCurrentMonthCompletionQty.length);

                //当月実績 - 振替
                const listWithCurrentMonthShippingQty = await Promise.all(items.map(async item => {
                    return await stockHistoryStore.getCurrentMonthShippingQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthShippingQty);
                //console.log("----------length" + listWithCurrentMonthShippingQty.length);

                //当月末在庫
                const listWithCurentMonthStockQtyByMlnNo = await Promise.all(items.map(async item => {
                    return await stockHistoryStore.getCurentMonthStockQtyByMlnNo(item.MLNPartNo, processType, currentMonth);
                }));
                //console.log("----------" + listWithCurentMonthStockQtyByMlnNo);
                //console.log("----------length" + listWithCurentMonthStockQtyByMlnNo.length);

                for (let i = 0; i < items.length; i++) {
                    items[i].lastLatestMonthQty = listWithAllLastMonthQty[i];
                    items[i].currentMonthDefectsQty = listWithCurrentMonthDefectsQty[i];
                    items[i].currentMonthCompletionQty = listWithCurrentMonthCompletionQty[i];
                    items[i].currentMonthShippingQty = listWithCurrentMonthShippingQty[i];
                    items[i].curentMonthStockQty = listWithCurentMonthStockQtyByMlnNo[i];
                }
                console.log("========" + items);
                this.parts = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        }
    },
});