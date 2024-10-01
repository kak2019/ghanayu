import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IBillOfMaterialsItem } from '../model';
import { CONST } from '../config/const';
import { computed } from 'vue';

export const useBillOfMaterialsStore = defineStore(FeatureKey.BILLOFMATERIALS, {
    state: () => ({
        billOfMaterials: [] as IBillOfMaterialsItem[],
    }),
    getters: {
        billOfMaterialsItems: (state) => state.billOfMaterials,
    },
    actions: {
        async getListItems() {
            let allItems: IBillOfMaterialsItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).items
                        .select('ID', 'ParentPartNo', 'ParentProcessType', 'ChildPartNo', 'ChildProcessType', 'StructureQty', 'Registered', 'Modified', 'UniqueKey')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        ParentPartNo: item.ParentPartNo,
                        ParentProcessType: item.ParentProcessType,
                        ChildPartNo: item.ChildPartNo,
                        ChildProcessType: item.ChildProcessType,
                        StructureQty: item.StructureQty,
                        Registered: item.Registered,
                        Modified: item.Modified,
                        UniqueKey: item.UniqueKey
                    }))
                    allItems = allItems.concat(selectedItems);
                    skip += pageSize;
                    hasNext = items.length === pageSize;
                }
                catch (error) {
                    console.error(error);
                    throw new Error(`データの取得中にエラーが発生しました`);
                }
            }
            const uniqueItems = Array.from(new Set(allItems.map(item => item.ID)))
                .map(id => allItems.find(item => item.ID === id));
            const processTypeOrder: { [key: string]: number } = {
                'F': 1,
                'M': 2,
                'E': 3,
                'H': 4,
                'G': 5,
                'S': 6,
                'C': 7
            };
            uniqueItems.sort((a: IBillOfMaterialsItem, b: IBillOfMaterialsItem) => {
                if (a.ParentPartNo === b.ParentPartNo) {
                    return processTypeOrder[a.ParentProcessType as keyof typeof processTypeOrder] - processTypeOrder[b.ParentProcessType as keyof typeof processTypeOrder];
                }
                return a.ParentPartNo.localeCompare(b.ParentPartNo);
            });

            this.billOfMaterials = uniqueItems;
        },
        async isUniqueKeyExists(uniqueKey: string, currentItemId: number = undefined): Promise<boolean> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                // `${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).items.filter(`UniqueKey eq '${uniqueKey}'`)();
                if (items.length === 0) {
                    return false;
                }
                if (currentItemId) {
                    return items.some(item => item.Id !== currentItemId);
                }
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
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
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).getItemsByCAMLQuery(camlQuery);
                return items.length;
            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getItemCountByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<number> {
            try {
                const items = await this.getItemsByChildMLNPartNoProcessType(mlnPartNo, processType);
                return items.length;
            } catch (error) {
                console.error(error);
                throw new Error(`部品表なしラエー`);
            }
        },
        async getItemsByChildMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<IBillOfMaterialsItem[]> {
            /*const camlQuery = {
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
            };*/
            try {
                /*const sp = spfi(getSP());
                const web = await sp.web();
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/BillOfMaterials`).getItemsByCAMLQuery(camlQuery);
                return items;*/

                let items = computed(() => this.billOfMaterialsItems);
                //Have to use 
                await this.getListItems();
                items = computed(() => this.billOfMaterialsItems)

                const newItems = items.value.filter(item => {
                    let condition = true;
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.ChildPartNo && item.ChildProcessType === processType
                    }
                    return condition
                });

                return newItems;

            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
        async getItemsByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<IBillOfMaterialsItem[]> {
            /*const camlQuery = {
                ViewXml: `
                <View>
                  <Query>
                    <Where>
                      <And>
                        <Eq>
                          <FieldRef Name='ParentPartNo' />
                          <Value Type='Text'>${mlnPartNo}</Value>
                        </Eq>
                        <Eq>
                          <FieldRef Name='ParentProcessType' />
                          <Value Type='Text'>${processType}</Value>
                        </Eq>
                      </And>                     
                    </Where>
                  </Query>
                </View>`
            };*/
            try {
                /*const sp = spfi(getSP());
                const web = await sp.web();
                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).getItemsByCAMLQuery(camlQuery);
                return items;*/

                
                let items = computed(() => this.billOfMaterialsItems);
                //Have to use 
                await this.getListItems();
                items = computed(() => this.billOfMaterialsItems)

                const newItems = items.value.filter(item => {
                    let condition = true;
                    if (mlnPartNo) {
                        condition = condition && mlnPartNo === item.ParentPartNo && item.ParentProcessType === processType
                    }
                    return condition
                });

                return newItems;
            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
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
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).items.add({
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
                if (error.message.includes("duplicate value") || error.message.includes('一意性')) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`MLN部品番号重複エラー`);
                }
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
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).items.getById(itemId).update({
                    //ParentPartNo: item.ParentPartNo,
                    //ParentProcessType: item.ParentProcessType,
                    ChildPartNo: item.ChildPartNo,
                    ChildProcessType: item.ChildProcessType,
                    StructureQty: item.StructureQty,
                    UniqueKey: `${item.ParentPartNo}-${item.ParentProcessType}-${item.ChildPartNo}-${item.ChildProcessType}`
                });
                return '登録完了。';
            }
            catch (error) {
                if (error.message.includes("duplicate value") || error.message.includes('一意性')) {
                    throw new Error('重複値エラー');
                } else {
                    console.error(error);
                    throw new Error(`MLN部品番号重複エラー`);
                }
            }


        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                // TODO: maybe dependency check
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameBILLOFMATERIALS}`).items.getById(itemId).delete();
                return '削除完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの削除中にエラーが発生しました`);
            }
        }

    },
});