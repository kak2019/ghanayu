import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from './keystrs';
import { IDemoListItem } from '../model';

export const useListItemStore = defineStore(FeatureKey.LISTITEM, {
    state: () => ({
        items: [] as IDemoListItem[],
    }),
    getters: {
        listItems: (state) => state.items,
    },
    actions: {
        async getListItems(listName: string) {
            const sp = spfi(getSP());
            const items = await sp.web.lists.getByTitle(listName).items.orderBy("Modified", false).top(10).select("Title", "Id")();
            this.items = items.map(item => ({ Title: item.Title, ID: item.Id as string }));
        },
        async addListItem(listName: string, item: IDemoListItem) {
            const sp = spfi(getSP());
            await sp.web.lists.getByTitle(listName).items.add(item);
            await this.getListItems(listName);
        },
        async updateListItem(listName: string, itemId: number, item: IDemoListItem) {
            const sp = spfi(getSP());
            await sp.web.lists.getByTitle(listName).items.getById(itemId).update(item);
            await this.getListItems(listName);
        },
        async deleteListItem(listName: string, itemId: number) {
            const sp = spfi(getSP());
            await sp.web.lists.getByTitle(listName).items.getById(itemId).delete();
            await this.getListItems(listName);
        }

    },
});