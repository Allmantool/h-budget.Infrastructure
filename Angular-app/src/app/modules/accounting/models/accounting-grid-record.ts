import { Guid } from "typescript-guid";

export interface AccountingGridRecord {
    id: Guid;
    date: Date;
    contractor: string;
    category: string;
    income: number;
    expense: number;
    balance: number;
    comment: string;
}