import { Component, Input } from '@angular/core';
import { InputTypes } from '../../models/input-types';

@Component({
    selector: 'app-form-field',
    templateUrl: './app-form-field.component.html',
    styleUrls: ['./app-form-field.component.css'],
})
export class AppFormFieldComponent { 
    @Input() public fieldType: string = InputTypes.INPUT;
    @Input() public title: string = '';
}