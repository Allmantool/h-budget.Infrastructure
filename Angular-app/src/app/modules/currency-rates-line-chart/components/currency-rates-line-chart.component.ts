import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
	selector: 'app-currency-rates-line-chart',
	templateUrl: './currency-rates-line-chart.component.html',
	styleUrls: ['./currency-rates-line-chart.component.css'],
})
export class CurrencyRatesLineChartComponent implements OnInit {
	ngOnInit(): void {
		this.lineChartData = [
			{ data: [65, 59, 80, 81, 56, 55, 40], label: this.usdCodeLabel },
		];
	}
	@Input() public usdCodeLabel: string = '';
	public chartWIdth: number = 1800;
	public chartHeight: number = 180;
	public lineChartData: ChartDataSets[] = [];
	public lineChartLabels: Label[] = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
	];
	public lineChartOptions: ChartOptions = {
		responsive: true,
	};
	public lineChartColors: Color[] = [
		{
			borderColor: 'black',
			backgroundColor: 'rgba(255,0,0,0.3)',
		},
	];
	public lineChartLegend = true;
	public lineChartType: ChartType = 'line';
	public lineChartPlugins = [];
}
