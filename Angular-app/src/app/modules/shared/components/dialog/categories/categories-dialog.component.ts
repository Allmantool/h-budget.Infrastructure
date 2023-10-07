import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Inject,
	ViewChild,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
	FormControl,
	UntypedFormBuilder,
	UntypedFormControl,
	UntypedFormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject, Observable, startWith, take, map } from 'rxjs';
import * as _ from 'lodash';

import { DialogContainer } from '../../../models/dialog-container';
import { Result } from 'core/result';
import { OperationType } from 'domain/models/accounting/operation-type';

@Component({
	selector: 'categories-dialog',
	templateUrl: './categories-dialog.component.html',
	styleUrls: ['./categories-dialog.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesDialogComponent {
	private dialogConfiguration: DialogContainer;

	@ViewChild('chipGrid ')
	chipGrid!: ElementRef<HTMLInputElement>;

	public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
		false
	);

	public isSaveDisabled: boolean = true;

	public dialogFg: UntypedFormGroup;
	public title: string;

	public categoryNodes: string[] = [];
	public filteredCategoryNodes!: Observable<string[]>;

	public readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	public categoryCtrl = new FormControl('');

	constructor(
		private dialogRef: MatDialogRef<CategoriesDialogComponent>,
		fb: UntypedFormBuilder,
		@Inject(MAT_DIALOG_DATA) dialogConfiguration: DialogContainer
	) {
		this.dialogFg = fb.group({
			category: new UntypedFormControl(new String()),
		});

		this.title = dialogConfiguration.title;
		this.dialogConfiguration = dialogConfiguration;

		this.filteredCategoryNodes = this.categoryCtrl.valueChanges.pipe(
			startWith(null),
			map((categoryNode: string | null) =>
				categoryNode
					? _.filter(this.categoryNodes, categoryNode)
					: this.categoryNodes.slice()
			)
		);
	}

	public close() {
		this.dialogRef.close();
	}

	public getCategoryTypes(): string[] {
		return Object.keys(OperationType).filter((v) => isNaN(Number(v)));
	}

	public save(): void {
		this.isLoading$.next(true);

		if (_.isEmpty(this.categoryNodes)) {
			this.dialogRef.close();
			return;
		}

		const payloadForSave = JSON.stringify(this.categoryNodes);

		this.dialogConfiguration
			.onSubmit(
				new Result<string>({
					payload: payloadForSave,
					isSucceeded: true,
				})
			)
			.pipe(take(1))
			.subscribe((_) => {
				this.isLoading$.next(false);
				this.dialogRef.close();
			});
	}

	public add(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		if (!_.isNil(value)) {
			this.categoryNodes.push(value);
		}

		event.chipInput.clear();

		this.categoryCtrl.setValue(null);

		this.isSaveDisabled = _.isEmpty(this.categoryNodes);
	}

	public remove(categoryNode: string): void {
		const index = this.categoryNodes.indexOf(categoryNode);

		if (index >= 0) {
			this.categoryNodes.splice(index, 1);
		}

		this.isSaveDisabled = _.isEmpty(this.categoryNodes);
	}

	public selected(event: MatAutocompleteSelectedEvent): void {
		this.categoryNodes.push(event.option.viewValue);
		this.chipGrid.nativeElement.value = '';
		this.categoryCtrl.setValue(null);
	}
}
