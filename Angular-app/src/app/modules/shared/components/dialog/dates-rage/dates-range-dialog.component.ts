import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { DialogContainer } from "app/modules/shared/models/dialog-container";

@Component({
    selector: 'dates-range-dialog',
    templateUrl: './dates-range-dialog.component.html',
    styleUrls: ['./dates-range-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeDialogComponent {
    public dialogFg: UntypedFormGroup;

    public title: string;

    constructor(
        private dialogRef: MatDialogRef<DateRangeDialogComponent>,
        fb: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) data: DialogContainer) {

        this.dialogFg = fb.group({
            "startDate": new UntypedFormControl(new Date()),
            "endDate": new UntypedFormControl(new Date())
        });

        this.title = data.title;
    }

    public close() {
        this.dialogRef.close();
    }

    public getRates(): void {
        this.dialogRef.close(this.dialogFg.value);
    }
}