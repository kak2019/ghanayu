export interface IPartMasterItem {
    ID?: string;
    MLNPartNo: string;
    UDPartNo?: string;
    ProcessType?: string;
    Registered?: string;
    Modified?: string;
    
    lastLatestMonthQty?:string;
    currentMonthDefectsQty?: string;
    currentMonthCompletionQty?: string;
    currentMonthShippingQty?: string;
    curentMonthStockQty?: string;
}