import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";

@Component({
    selector: 'dates-range-dialog',
    templateUrl: './dates-range-dialog.component.html',
    styleUrls: ['./dates-range-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeDialogComponent {
    public dialogFg: UntypedFormGroup;

    constructor(fb: UntypedFormBuilder) {
        this.dialogFg = fb.group({
            "startDate": new UntypedFormControl(new Date()),
            "endDate": new UntypedFormControl(new Date())
        });
    }

    public save(): void {
        let formState = this.dialogFg.value;
    }
}