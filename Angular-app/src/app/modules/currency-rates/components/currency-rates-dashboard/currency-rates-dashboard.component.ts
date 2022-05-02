import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: 'currency-rates-dashboard.component',
	templateUrl: './currency-rates-dashboard.component.html',
	styleUrls: ['./currency-rates-dashboard.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesDashboardComponent { }