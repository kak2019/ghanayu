export interface IPartMasterItem {
    ID?: string;
    MLNPartNo: string;
    UDPartNo?: string;
    ProcessType?: string;
    Registered?: string;
    Modified?: string;
    ProcessTypeName?:string;
    
    lastLatestMonthQty?:string;
    currentMonthDefectsQty?: string;
    currentMonthCompletionQty?: string;
    currentMonthShippingQty?: string;
    curentMonthStockQty?: string;
    currentMonthInQty?: string;
    currentMonthOutQty?: string;
}