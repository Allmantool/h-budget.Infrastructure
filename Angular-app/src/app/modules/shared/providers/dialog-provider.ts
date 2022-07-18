import { ComponentType } from "@angular/cdk/portal";
import { Injectable, TemplateRef } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

import * as _ from "lodash";
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DialogProvider {
    constructor(public dialog: MatDialog) { }

    openDialog<T, D, P>(
        componentRef: ComponentType<T> | TemplateRef<T>,
        submitAction: (payload: P) => void,
        сonfig?: MatDialogConfig<D>
    ): void {

        const defaultConfig = new MatDialogConfig();
        defaultConfig.autoFocus = true;
        defaultConfig.disableClose = true;

        this.dialog.open(componentRef, { ...defaultConfig, ...сonfig })
            .afterClosed()
            .pipe(
                take(1)
            )
            .subscribe(
                payload => submitAction(payload)
            );
    }
}