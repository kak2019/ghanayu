import { defineStore } from 'pinia';
import { spfi } from '@pnp/sp';
import { getSP } from '../pnpjsConfig';
import { FeatureKey } from '../config/keystrs';

export const useWebStore = defineStore(FeatureKey.WEB, {

    state: () => ({
        title: "",
        description: ""
    }),
    getters: {
        webTitle: (state) => state.title,
        webDescription: (state) => state.description
    },
    actions: {
        async getWeb() {
            const sp = spfi(getSP());
            const w = await sp.web.select("Title", "Description")();
            //console.log(JSON.stringify(w, null, 4));
            this.title = w.Title;
            this.description = w.Description;
        },
    },
})