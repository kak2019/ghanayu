import { defineStore } from "pinia";
import { IOperationCalenderItem } from "../model";
import { FeatureKey } from "../config/keystrs";

export const useOperationCalendarStore = defineStore(FeatureKey.OPERATIONCALENDAR, {
    state: () => ({
        opreationcalenders: [
            { SystemDate: "202501", FirstDayOfOperation: "20250106" },
            { SystemDate: "202502", FirstDayOfOperation: "20250203" },
            { SystemDate: "202503", FirstDayOfOperation: "20250303" },
            { SystemDate: "202504", FirstDayOfOperation: "20250401" },
            { SystemDate: "202505", FirstDayOfOperation: "20250507" },
            { SystemDate: "202506", FirstDayOfOperation: "20250602" },
            { SystemDate: "202507", FirstDayOfOperation: "20250701" },
            { SystemDate: "202508", FirstDayOfOperation: "20250801" },
            { SystemDate: "202509", FirstDayOfOperation: "20250901" },
            { SystemDate: "202510", FirstDayOfOperation: "20251001" },
            { SystemDate: "202511", FirstDayOfOperation: "20251103" },
            { SystemDate: "202512", FirstDayOfOperation: "20251201" },
            { SystemDate: "202601", FirstDayOfOperation: "20260105" },
            { SystemDate: "202602", FirstDayOfOperation: "20260202" },
            { SystemDate: "202603", FirstDayOfOperation: "20260302" },
            { SystemDate: "202604", FirstDayOfOperation: "20260401" },
            { SystemDate: "202605", FirstDayOfOperation: "20260507" },
            { SystemDate: "202606", FirstDayOfOperation: "20260601" },
            { SystemDate: "202607", FirstDayOfOperation: "20260701" },
            { SystemDate: "202608", FirstDayOfOperation: "20260803" },
            { SystemDate: "202609", FirstDayOfOperation: "20260901" },
            { SystemDate: "202610", FirstDayOfOperation: "20261001" },
            { SystemDate: "202611", FirstDayOfOperation: "20261102" },
            { SystemDate: "202612", FirstDayOfOperation: "20261201" },
            { SystemDate: "202701", FirstDayOfOperation: "20270104" },] as IOperationCalenderItem[]
    }),
    getters: {
        operationCalendarItems: (state) => state.opreationcalenders,
        getOperationCalendarItemByDate: (state) => (date: string) => state.opreationcalenders.find(oc => oc.SystemDate === date)
    }
});