import { Injectable } from "@angular/core";

import { format } from "date-fns";
import * as _ from "lodash";

import { CurrencyTableOptions } from "./../../shared/store/models/currency-rates/currency-table-options";
import { ChartOptions } from "../components/currency-rates-line-chart/currency-rates-line-chart.component";
import { CurrencyRate } from "./../../shared/store/models/currency-rates/currency-rate";
import { LineChartOptions } from "../models/line-chart-options";

@Injectable({
    providedIn: 'root',
})
export class LineChartService {
    public getChartOptions(rates: CurrencyRate[], tableOptions: CurrencyTableOptions, options: LineChartOptions): ChartOptions {

        const ratesFilterByDateRange = _.sortBy(rates, i => i.updateDate)

        const selectedDateRange = tableOptions.selectedDateRange;

        const ratesForPeriod = _.filter(
            ratesFilterByDateRange,
            r => r.updateDate >= selectedDateRange.start && r.updateDate <= selectedDateRange.end);

        const abbreviation = tableOptions.selectedItem.abbreviation;

        return {
            series: [
                {
                    name: abbreviation,
                    data: _.map(ratesForPeriod, (r) => r.ratePerUnit ?? 0),
                },
            ],
            chart: {
                height: options.height,
                width: options.width,
                type: options.type
            },
            title: {
                text: abbreviation,
            },
            xaxis: {
                categories: _.map(ratesForPeriod, (r) => format(r.updateDate, options.dateFormat)),
            },
        };
    }
}