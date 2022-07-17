import { ComponentType } from "@angular/cdk/portal";
import { Injectable, TemplateRef } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

@Injectable({
    providedIn: 'root',
})
export class DialogProvider {
    constructor(public dialog: MatDialog) { }

    openDialog<T>(componentRef: ComponentType<T> | TemplateRef<T>, сonfig: MatDialogConfig): void {
        this.dialog.open(componentRef, сonfig);
    }
}