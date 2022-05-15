import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-datepicker',
  templateUrl: './app-datepicker.component.html',
  styleUrls: ['./app-datepicker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent {
  @Input() currentDay: Date | undefined;

  onChange(event: MatDatepickerInputEvent<Date, string>) {

  }
}