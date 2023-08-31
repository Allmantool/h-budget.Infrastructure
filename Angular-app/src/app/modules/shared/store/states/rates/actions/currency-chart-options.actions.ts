export class SetSelectedCurrencyRange {
	static readonly type =
		'[CURR-CHART-OPTIONS] Set selected currency chart range';
	constructor(
		public startValueIndex: number,
		public endValueIndex: number
	) {}
}
