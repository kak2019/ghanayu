import { defineStore } from 'pinia';
import { FeatureKey } from '../config/keystrs';

export const useCounterStore = defineStore(FeatureKey.COUNTER, {

    state: () => ({ count: 0 }),
    getters: {
        double: (state) => state.count * 2,
    },
    actions: {
        async increment() {
            this.count++
        },
    },
})