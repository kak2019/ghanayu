import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IBillOfMaterialsItem } from '../model';

export const useBillOfMaterialsStore = defineStore(FeatureKey.BILLOFMATERIALS, {
    state: () => ({
        billOfMaterials: [] as IBillOfMaterialsItem[],
    }),
    getters: {
        billOfMaterialsItems: (state) => state.billOfMaterials,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.orderBy("ParentPartNo", true)();

                const processTypeOrder: { [key: string]: number } = {
                    'F': 1,
                    'M': 2,
                    'E': 3,
                    'H': 4,
                    'G': 5,
                    'S': 6,
                    'C': 7
                };
                items.sort((a: IBillOfMaterialsItem, b: IBillOfMaterialsItem) => {
                    if (a.ParentPartNo === b.ParentPartNo) {
                        return processTypeOrder[a.ParentProcessType as keyof typeof processTypeOrder] - processTypeOrder[b.ParentProcessType as keyof typeof processTypeOrder];
                    }
                    return a.ParentPartNo.localeCompare(b.ParentPartNo);
                });

                this.billOfMaterials = items;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }

        },
        async isUniqueKeyExists(uniqueKey: string, currentItemId: number = undefined): Promise<boolean> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                // `${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.filter(`UniqueKey eq '${uniqueKey}'`)();
                if (items.length === 0) {
                    return false;
                }
                if (currentItemId) {
                    return items.some(item => item.Id !== currentItemId);
                }
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
            return true;
        },
        async getItemCountByUniqueKeySubstring(substring: string): Promise<number> {
            const camlQuery = {
                ViewXml: `
                <View>
                  <Query>
                    <Where>
                      <Contains>
                        <FieldRef Name='UniqueKey' />
                        <Value Type='Text'>${substring}</Value>
                      </Contains>
                    </Where>
                  </Query>
                </View>`
            };
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).getItemsByCAMLQuery(camlQuery);
                return items.length;
            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getItemCountByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<number> {
            try {
                const items = await this.getItemsByMLNPartNoProcessType(mlnPartNo, processType);
                return items.length;
            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async getItemsByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<IBillOfMaterialsItem[]> {
            const camlQuery = {
                ViewXml: `
                <View>
                  <Query>
                    <Where>
                      <And>
                        <Eq>
                          <FieldRef Name='ChildPartNo' />
                          <Value Type='Text'>${mlnPartNo}</Value>
                        </Eq>
                        <Eq>
                          <FieldRef Name='ChildProcessType' />
                          <Value Type='Text'>${processType}</Value>
                        </Eq>
                      </And>                     
                    </Where>
                  </Query>
                </View>`
            };
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).getItemsByCAMLQuery(camlQuery);
                return items;
            } catch (error) {
                throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
            }
        },
        async addListItem(item: IBillOfMaterialsItem): Promise<string> {
            try {

                const uniqueKeyExists = await this.isUniqueKeyExists(`${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`);
                if (uniqueKeyExists) {
                    throw new Error('一意性チェックに失敗しました');
                }
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.add({
                    ParentPartNo: item.ParentPartNo,
                    ParentProcessType: item.ParentProcessType,
                    ChildPartNo: item.ChildPartNo,
                    ChildProcessType: item.ChildProcessType,
                    StructureQty: item.StructureQty,
                    Registered: new Date(),
                    UniqueKey: `${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }
        },
        async updateListItem(itemId: number, item: IBillOfMaterialsItem): Promise<string> {
            try {
                const uniqueKeyExists = await this.isUniqueKeyExists(item.UniqueKey, itemId);
                if (uniqueKeyExists) {
                    throw new Error('一意性チェックに失敗しました');
                }
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.getById(itemId).update({
                    //ParentPartNo: item.ParentPartNo,
                    //ParentProcessType: item.ParentProcessType,
                    //ChildPartNo: item.ChildPartNo,
                    //ChildProcessType: item.ChildProcessType,
                    StructureQty: item.StructureQty,
                    //UniqueKey: `${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`
                });
                return '登録完了。';
            }
            catch (error) {
                throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
            }


        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                // TODO: maybe dependency check
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).items.getById(itemId).delete();
                return '消去完了。';
            }
            catch (error) {
                throw new Error(`データの削除中にエラーが発生しました: ${error.message}`);
            }
        }

    },
});