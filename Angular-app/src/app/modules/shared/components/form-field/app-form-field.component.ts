import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-form-field',
    templateUrl: './app-form-field.component.html',
    styleUrls: ['./app-form-field.component.css'],
})
export class AppFormFieldComponent { 
    @Input() fieldType: string = '';
}