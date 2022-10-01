import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
	Component,
	Input,
	forwardRef,
	ChangeDetectionStrategy,
	Output,
	EventEmitter,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { InputTypes } from '../../models/input-types';

@Component({
	selector: 'app-form-field',
	templateUrl: './app-form-field.component.html',
	styleUrls: ['./app-form-field.component.css'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AppFormFieldComponent),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFormFieldComponent implements ControlValueAccessor {
	private onTouched!: Function;
	private onChanged!: (value: string | number | undefined) => {};

	private disabled = false;

	public data$ = new BehaviorSubject<string | number | undefined>(undefined);

	@Input() public fieldType: string = InputTypes.INPUT;

	@Input() public selectOptions: string[] = [];

	@Input() public title: string = '';

	@Output() public onDataChanged = new EventEmitter<
		string | number | undefined
	>();

	constructor() {}

	writeValue(value: any): void {
		this.data$.next(value);
	}

	registerOnChange(fn: (value: any) => {}): void {
		this.onChanged = fn;
	}

	registerOnTouched(fn: Function): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean) {
		this.disabled = isDisabled;
	}

	updateValue(event: any) {
		this.data$.next(event.value);

		this.onChanged(this.data$.value);
		this.onTouched();

		this.onDataChanged.emit(this.data$.value);
	}
}
