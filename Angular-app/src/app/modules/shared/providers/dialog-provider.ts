import { ComponentType } from "@angular/cdk/portal";
import { Injectable, TemplateRef } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

import * as _ from "lodash";
import { take } from 'rxjs/operators';

import { DialogDelegate } from "./dialog-delegate";

@Injectable({
    providedIn: 'root',
})
export class DialogProvider {
    constructor(public dialog: MatDialog) { }

    openDialog<T, D, P>(
        componentRef: ComponentType<T> | TemplateRef<T>,
        dialogDelegate: DialogDelegate<P>,
        сonfig?: MatDialogConfig<D>
    ): void {
        if (_.isNil(сonfig)) {
            сonfig = new MatDialogConfig();
        }

        сonfig.autoFocus = true;
        сonfig.disableClose = true;

        this.dialog.open(componentRef, сonfig)
            .afterClosed()
            .pipe(
                take(1)
            )
            .subscribe(
                payload => dialogDelegate(payload)
            );
    }
}