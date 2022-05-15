import { Guid } from "typescript-guid";

export interface AccountingGridRecord {
    id: Guid;
    date: Date;
    contractor: string;
    category: string;
    Income: number;
    expenditure: number;
    balance: number;
    comment: string;
}