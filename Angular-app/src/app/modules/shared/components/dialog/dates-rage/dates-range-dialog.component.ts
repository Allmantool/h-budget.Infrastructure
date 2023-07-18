import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormControl,
	UntypedFormGroup,
} from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { DialogContainer } from 'app/modules/shared/models/dialog-container';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'dates-range-dialog',
	templateUrl: './dates-range-dialog.component.html',
	styleUrls: ['./dates-range-dialog.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeDialogComponent {
	public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
		false
	);
	public dialogFg: UntypedFormGroup;
	public title: string;

	constructor(
		private dialogRef: MatDialogRef<DateRangeDialogComponent>,
		fb: UntypedFormBuilder,
		@Inject(MAT_DIALOG_DATA) data: DialogContainer
	) {
		this.dialogFg = fb.group({
			startDate: new UntypedFormControl(new Date()),
			endDate: new UntypedFormControl(new Date()),
		});

		this.title = data.title;
	}

	public close() {
		this.dialogRef.close();
	}

	public getRates(): void {
		this.isLoading$.next(true);
		this.dialogRef.beforeClosed().subscribe(() => {
			this.dialogRef.close(this.dialogFg.value);
		});
	}
}
