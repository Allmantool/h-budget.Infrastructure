export class RatesGridColumnOptions {
	public static SELECT: string = 'select';
	public static ID: string = 'id';
	public static ABBREVIATION: string = 'abbreviation';
	public static NAME: string = 'name';
	public static RATE_PER_UNIT: string = 'ratePerUnit';
	public static PERCENTAGE_DIFF: string = 'percentageDiff';
	public static UPDATE_DATE: string = 'updateDate';

	public static Descriptions: Map<string, string> = new Map<string, string>([
		[RatesGridColumnOptions.SELECT, ''],
		[RatesGridColumnOptions.ID, '#Currency id'],
		[RatesGridColumnOptions.ABBREVIATION, 'Abbreviation'],
		[RatesGridColumnOptions.NAME, 'Name'],
		[RatesGridColumnOptions.RATE_PER_UNIT, 'An unit rate'],
		[RatesGridColumnOptions.PERCENTAGE_DIFF, 'Trend'],
		[RatesGridColumnOptions.UPDATE_DATE, 'Last update date'],
	]);

	public static NAMES: string[] = [...RatesGridColumnOptions.Descriptions.keys()]
}
