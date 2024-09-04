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
    listNameSHIPPINGRESULT: "ShippingResult",
    listNameSHIPPINGTO: "ShippingTo",
    listNamePROCESSCOMPLETIONRESULT: "ProcessCompletionResult",
    listNameMODIFIEDREASONMASTER: "ModifiedReasonMaster",
    listNameSTOCKRESULTMODIFICATION: "StockResultModification",
    beginOperationDate: OperationSettings.BeginDate,
    endOperationDate: OperationSettings.EndDate,
}
export { CONST };