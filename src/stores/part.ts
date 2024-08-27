import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IPartMasterItem } from '../model';
import { useStockHistoryStore } from '../stores/stockhistory'

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

                const item = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId)();
                return item;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getListItemByMLNPartNo(mlnPartNo: string): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).getItemsByCAMLQuery({
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
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
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
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).getItemsByCAMLQuery(camlQuery);
                return items.length;
            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.orderBy("MLNPartNo", true)();
                this.parts = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async addListItem(item: IPartMasterItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    UDPartNo: item.UDPartNo,
                    Registered: new Date()
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
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
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== '').join(';')
                            });
                        }
                    }
                    else {
                        if (values.indexOf(processType) !== -1) {
                            await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).update({
                                ProcessType: values.filter(s => s !== processType).join(';')
                            });
                        }
                    }

                }
                else {
                    await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).update({
                        // MLNPartNo: item.MLNPartNo,
                        UDPartNo: item.UDPartNo
                    });
                }
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }


        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).delete();
                return '消去完了。';
            }
            catch (error) {
                throw new Error(`データの削除中にエラーが発生しました: ${error.message}`);
            }
        },
        async getListItemsBySearchItems(date:string) {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = (await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.orderBy("MLNPartNo", true)());
                const stockHistoryStore = useStockHistoryStore();
                //const currentMonth = current;
                console.log("=================" + date);
                const currentMonth = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1);

                
                //前月末在庫
                const listWithAllLastMonthQty = await Promise.all(items.map(async item =>{
                    return await stockHistoryStore.getLastMonthsLatestStockQtyByMln(item.MLNPartNo, currentMonth);
                }));
                //console.log("----------" + listWithAllLastMonthQty);
                //console.log("----------length" + listWithAllLastMonthQty.length);
                
                //当月実績 - 不良
                const listWithCurrentMonthDefectsQty = await Promise.all(items.map(async item =>{
                    return await stockHistoryStore.getCurrentMonthDefectsQtyByMlnNo(item.MLNPartNo, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthDefectsQty);
                //console.log("----------length" + listWithCurrentMonthDefectsQty.length);

                //当月実績 - 完成
                const listWithCurrentMonthCompletionQty = await Promise.all(items.map(async item =>{
                    return await stockHistoryStore.getCurrentMonthCompletionQtyByMlnNo(item.MLNPartNo, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthCompletionQty);
                //console.log("----------length" + listWithCurrentMonthCompletionQty.length);

                //当月実績 - 振替
                const listWithCurrentMonthShippingQty = await Promise.all(items.map(async item =>{
                    return await stockHistoryStore.getCurrentMonthShippingQtyByMlnNo(item.MLNPartNo, currentMonth);
                }));
                //console.log("----------" + listWithCurrentMonthShippingQty);
                //console.log("----------length" + listWithCurrentMonthShippingQty.length);

                //当月末在庫
                const listWithCurentMonthStockQtyByMlnNo = await Promise.all(items.map(async item =>{
                    return await stockHistoryStore.getCurentMonthStockQtyByMlnNo(item.MLNPartNo, currentMonth);
                }));
                //console.log("----------" + listWithCurentMonthStockQtyByMlnNo);
                //console.log("----------length" + listWithCurentMonthStockQtyByMlnNo.length);

                for(let i=0; i <items.length; i++){
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