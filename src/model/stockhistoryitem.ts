import { IEventItem } from "./eventitem";

export interface IStockHistoryItem extends IEventItem {
    StockQty?: number;
}