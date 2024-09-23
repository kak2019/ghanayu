import { IEventItem } from "./eventitem";

export interface IStockHistoryItem extends IEventItem {
    Child: string;

    StockQty?: number;
}