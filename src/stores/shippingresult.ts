import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IShippingResultItem } from '../model';
import { CONST } from '../config/const';
import { computed } from 'vue';
import { isDateBefore } from '../common/utils';

export const useShippingResultStore = defineStore(FeatureKey.SHIPPINGRESULT, {
    state: () => ({
        shippingResults: [] as IShippingResultItem[],
    }),
    getters: {
        shippingResultItems: (state) => state.shippingResults,
    },
    actions: {
        async getListItems() {
            let allItems: IShippingResultItem[] = [];
            let hasNext = true;
            let skip = 0;
            const pageSize = 1000;
            while (hasNext) {
                try {
                    const sp = spfi(getSP());
                    const web = await sp.web();

                    const items: IShippingResultItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIPPINGRESULT}`).items
                        .select('ID',
                            'MLNPartNo',
                            'ProcessType',
                            'UDPartNo',
                            'ShipTo',
                            'ShipQty',
                            'Calloffid',
                            'Despatchnote',
                            'ShippingResultDate',
                            'Registered',
                            'Modified')
                        .top(pageSize).skip(skip)();
                    const selectedItems = items.map(item => ({
                        ID: item.ID,
                        MLNPartNo: item.MLNPartNo,
                        ProcessType: item.ProcessType,
                        UDPartNo: item.UDPartNo,
                        ShipTo: item.ShipTo,
                        ShipQty: item.ShipQty,
                        Calloffid: item.Calloffid,
                        Despatchnote: item.Despatchnote,
                        ShippingResultDate: item.ShippingResultDate,
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
            //orderBy Registered false
            uniqueItems.sort((a, b) => new Date(b.Registered).getTime() - new Date(a.Registered).getTime());
            this.shippingResults = uniqueItems;
        },
        async getLisItemsByDate(curentDate:Date){
            await this.getListItems();
                const firstDayOfMonth = new Date(
                    curentDate.getFullYear(),
                    curentDate.getMonth(),
                    1
                );
                let items = this.shippingResults.sort((a, b) => new Date(b.Registered).getTime() - new Date(a.Registered).getTime())
                .filter((item) => {
                let condition = true;
                condition =
                    condition &&
                    new Date(firstDayOfMonth) <=
                    new Date(item.ShippingResultDate) &&
                    new Date(item.ShippingResultDate) <=
                    new Date();
                return condition;
                });

                if(items.length ===0){
                    const firstDayOfLastMonth = new Date(
                    curentDate.getFullYear(),
                    curentDate.getMonth()-1,
                    1
                    );
                    const lastDayOfMonthBeforeLast= firstDayOfLastMonth.setDate(firstDayOfLastMonth.getDate()-1);
                    /*let tempFirstDate = firstDayOfMonth;
                    tempFirstDate.setDate(tempFirstDate.getDate()-1);
                    const lastDayOfLastMonth = tempFirstDate;*/
                
                    items = this.shippingResults
                    .sort((a, b) => new Date(b.Registered).getTime() - new Date(a.Registered).getTime())
                    .filter((item) => {
                        let condition = true;
                        condition =
                        condition &&
                        new Date(lastDayOfMonthBeforeLast) <
                            new Date(item.ShippingResultDate) &&
                        new Date(item.ShippingResultDate) <
                            new Date(firstDayOfMonth);
                        return condition;
                    });
                }
                this.shippingResults = items;
        },
        async getLatestShippingResultDateByMLNPartNoDesc(mlnPartNo: string): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                const list = sp.web.getList(`${web.ServerRelativeUrl}/Lists/ShippingResult`);

                const items = await list.items
                    .filter(`MLNPartNo eq '${mlnPartNo}'`)
                    .orderBy("ShippingResultDate", false)();

                if (items.length > 0) {
                    console.log(`Found item: ${JSON.stringify(items[0])}`);
                    return items[0].ShippingResultDate;
                } else {
                    return '';
                }

            } catch (error) {
                console.error(error);
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },

        async addListItem(item: IShippingResultItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNameSHIPPINGRESULT}`).items.add({
                    MLNPartNo: item.MLNPartNo,
                    ProcessType: 'C',
                    UDPartNo: item.UDPartNo,
                    ShipTo: item.ShipTo,
                    ShipQty: item.ShipQty,
                    Calloffid: item.Calloffid || "",
                    Despatchnote: item.Despatchnote || "",
                    ShippingResultDate: item.ShippingResultDate || "",
                    Registered: new Date(),
                });
                return '登録完了。';
            }
            catch (error) {
                console.error(error);
                throw new Error(`データの登録中にエラーが発生しました`);
            }
        },
        async checkItemsAlreadyInShipingResultes(mlnPartNo: string, processType: string, shippingResultDate:string): Promise<boolean> {
            try {
                
                const shippingResultDateForDate = new Date(shippingResultDate);
                await this.getListItems();
                const items = computed(() => this.shippingResultItems.filter(i => i.MLNPartNo === mlnPartNo && i.ProcessType === processType && isDateBefore(new Date(shippingResultDateForDate), new Date(i.ShippingResultDate))));
                
                const isLengthZero: boolean = (items.value.length as number) > 0? true : false;
  
                return isLengthZero;
            }
            catch (error) {
                throw new Error(`データの取得中にエラーが発生しました`);
            }
        },
    },
});