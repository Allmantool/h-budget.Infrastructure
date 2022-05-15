import { Guid } from "typescript-guid";

import { AccountingGridRecord } from "app/modules/accounting/models/accounting-grid-record";

export class Add {
    static readonly type = '[Accounting] Add';
    constructor(public rate: AccountingGridRecord) { }
}

export class AddRange {
    static readonly type = '[Accounting] AddRange';
    constructor(public rates: AccountingGridRecord[]) { }
}

export class Delete {
    static readonly type = '[Accounting] Delete';
    constructor(public recordGuid: Guid) { }
}

export class SetActive {
	static readonly type = '[Accounting] Set active';
	constructor(public id: Guid) {}
}
