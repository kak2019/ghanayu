declare let beginOperationDate: string;
declare let endOperationDate: string;
export class OperationSettings {
    public static get BeginDate(): string {
        return beginOperationDate;
    }
    public static get EndDate(): string {
        return endOperationDate;
    }
}
const CONST = {
    listNamePARTMASTER: "PartsMaster",
    listNameBILLOFMATERIALS: "BillOfMaterials",
    listNameFUNCTIONSMASTER: "FunctionsMaster",
    listNameSHIKYUGOODSRECEIVE: "SHIKYUGoodsReceive",
    listNameSHIKEYUFROM: "SHIKYUFrom",
    listNamePROCESSMASTER: "ProcessMaster",
    listNameSTOCKHISTORY: "StockHistory",
    listNameEVENTS: "Events",
    listNameSHIPPINGRESULT: "ShippingResult",
    listNameSHIPPINGTO: "ShippingTo",
    listNamePROCESSCOMPLETIONRESULT: "ProcessCompletionResult",
    listNameMODIFIEDREASONMASTER: "ModifiedReasonMaster",
    listNameSTOCKRESULTMODIFICATION: "StockResultModification",
    beginOperationDate: OperationSettings.BeginDate,
    endOperationDate: OperationSettings.EndDate,
    isEventList : true
}
export { CONST };