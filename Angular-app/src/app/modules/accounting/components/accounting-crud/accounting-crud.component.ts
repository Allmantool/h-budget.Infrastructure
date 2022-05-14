import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: 'accounting-crud',
    templateUrl: './accounting-crud.component.html',
    styleUrls: ['./accounting-crud.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class AccountingCrudComponent {
  }