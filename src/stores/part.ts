import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IPartMasterItem } from '../model';

export const usePartMasterStore = defineStore(FeatureKey.PARTMASTER, {
    state: () => ({
        parts: [] as IPartMasterItem[],
    }),
    getters: {
        partMasterItems: (state) => state.parts,
    },
    actions: {
        async getListItems() {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();

                const items = await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.orderBy("UDPartNo", true)();
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
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.add(item);
                return 'データは正常に挿入されました。';
            }
            catch (error) {
                throw new Error(`データの挿入中にエラーが発生しました: ${error.message}`);
            }
        },
        async updateListItem(itemId: number, item: IPartMasterItem): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).update(item);
                return 'データが正常に更新されました。';
            }
            catch (error) {
                throw new Error(`データの更新中にエラーが発生しました: ${error.message}`);
            }


        },
        async deleteListItem(itemId: number): Promise<string> {
            try {
                const sp = spfi(getSP());
                const web = await sp.web();
                await sp.web.getList(`${web.ServerRelativeUrl}/Lists/PartsMaster`).items.getById(itemId).delete();
                return 'データは正常に消去されました。';
            }
            catch (error) {
                throw new Error(`データの削除中にエラーが発生しました: ${error.message}`);
            }
        }

    },
});