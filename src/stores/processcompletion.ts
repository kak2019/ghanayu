import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';
import { IProcessCompletionResultItem } from '../model';
import { CONST } from '../config/const';

export const useProcessCompletionResultStore = defineStore(FeatureKey.PROCESSCOMPLETIONRESULT, {
  state: () => ({
    processCompletionResults: [] as IProcessCompletionResultItem[],
  }),
  getters: {
    processCompletionResultItems: (state) => state.processCompletionResults,
  },
  actions: {
    async getListItems() {
      let allItems: IProcessCompletionResultItem[] = [];
      let hasNext = true;
      let skip = 0;
      const pageSize = 1000;
      while (hasNext) {
        try {
          const sp = spfi(getSP());
          const web = await sp.web();

          const items: IProcessCompletionResultItem[] = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSCOMPLETIONRESULT}`).items
            .select('ID',
              'MLNPartNo',
              'ProcessType',
              'UDPartNo',
              'DefectQty',
              'CompletionQty',
              'Registered',
              'Modified',
              'ProcessCompletion')
            .top(pageSize).skip(skip)();
          const selectedItems = items.map(item => ({
            ID: item.ID,
            MLNPartNo: item.MLNPartNo,
            ProcessType: item.ProcessType,
            UDPartNo: item.UDPartNo,
            DefectQty: item.DefectQty,
            CompletionQty: item.CompletionQty,
            Registered: item.Registered,
            Modified: item.Modified,
            ProcessCompletion: item.ProcessCompletion
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
      this.processCompletionResults = uniqueItems;

    },

    async getListItemsByMLNPartNo(mlnPartNo: string) {
      try {
        const sp = spfi(getSP());
        const web = await sp.web();

        const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSCOMPLETIONRESULT}`).getItemsByCAMLQuery({
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
                      </View>
                    `
        });
        this.processCompletionResults = items;
      }
      catch (error) {
        console.error(error);
        throw new Error(`データの取得中にエラーが発生しました`);
      }
    },

    async getItemsByMLNPartNoProcessType(mlnPartNo: string, processType: string): Promise<IProcessCompletionResultItem[]> {
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
                        <Eq>
                          <FieldRef Name='ProcessType' />
                          <Value Type='Text'>${processType}</Value>
                        </Eq>
                      </And>                     
                    </Where>
                    <OrderBy>
                      <FieldRef Name='ProcessCompletion' Ascending='FALSE' />
                    </OrderBy>
                  </Query>
                </View>`
      };
      try {
        const sp = spfi(getSP());
        const web = await sp.web();
        const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSCOMPLETIONRESULT}`).getItemsByCAMLQuery(camlQuery);
        return items;
      } catch (error) {
        console.error(error);
        throw new Error(`データの取得中にエラーが発生しました`);
      }

    },

    async addListItem(item: IProcessCompletionResultItem): Promise<string> {
      try {
        const sp = spfi(getSP());
        const web = await sp.web();
        await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSCOMPLETIONRESULT}`).items.add({
          MLNPartNo: item.MLNPartNo,
          ProcessType: item.ProcessType,
          UDPartNo: item.UDPartNo || "",
          DefectQty: item.DefectQty,
          CompletionQty: item.CompletionQty,
          ProcessCompletion: item.ProcessCompletion,
          Registered: new Date(),
        });
        return '登録完了。';
      } catch (error) {
        console.error(error);
        throw new Error(`データの登録中にエラーが発生しました`);
      }
    }
  }
})