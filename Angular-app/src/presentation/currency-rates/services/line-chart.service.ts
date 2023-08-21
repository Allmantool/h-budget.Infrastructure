import { Injectable } from "@angular/core";

import { format } from "date-fns";
import * as _ from "lodash";

import { ChartOptions } from "../components/currency-rates-line-chart/currency-rates-line-chart.component";
import { LineChartOptions } from "../models/line-chart-options";
import { CurrencyTableOptions } from "app/modules/shared/store/models/currency-rates/currency-table-options";
import { CurrencyRateValueModel } from "domain/models/rates/currency-rate-value.model";

@Injectable()
export class LineChartService {
    public getChartOptions(rates: CurrencyRateValueModel[], tableOptions: CurrencyTableOptions, options: LineChartOptions): ChartOptions {

        const ratesFilterByDateRange = _.sortBy(rates, i => i.updateDate)

        const selectedDateRange = tableOptions.selectedDateRange;

        const ratesForPeriod = _.filter(
            ratesFilterByDateRange,
            r => r.updateDate! >= selectedDateRange.start && r.updateDate! <= selectedDateRange.end);

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
                categories: _.map(ratesForPeriod, (r) => format(r.updateDate!, options.dateFormat)),
            },
        };
    }
}