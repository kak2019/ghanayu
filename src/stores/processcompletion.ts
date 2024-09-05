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
      try {
        const sp = spfi(getSP());
        const web = await sp.web();

        const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/${CONST.listNamePROCESSCOMPLETIONRESULT}`).items.orderBy("Registered", false)();
        this.processCompletionResults = items;
      } catch (error) {
        throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
      }

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
        throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
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
                      <FieldRef Name='ProcessCompletion' Ascending='TRUE' />
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
        throw new Error(`データの取得中にエラーが発生しました: ${error.message}`);
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
          // Registered: new Date(),
        });
        return '登録完了。';
      } catch (error) {
        throw new Error(`データの登録中にエラーが発生しました: ${error.message}`);
      }
    }
  }
})