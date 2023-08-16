import { TestBed } from "@angular/core/testing";
import { Store } from "@ngxs/store";

import { RatesDialogService } from "./rates-dialog.service";
import { NationalBankCurrencyProvider } from "../../../../data/providers/rates/national-bank-currency.provider";
import { DialogProvider } from "./../../shared/providers/dialog-provider";

describe('Rate dialog service', () => {

    let nationalBankCurrencyProviderSpy: jasmine.SpyObj<NationalBankCurrencyProvider>;
    let storerSpy: jasmine.SpyObj<Store>;
    let dialogProviderSpy: jasmine.SpyObj<DialogProvider>;

    let sut: RatesDialogService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                RatesDialogService,
                { provide: DialogProvider, useValue: dialogProviderSpy },
                { provide: Store, useValue: storerSpy },
                { provide: NationalBankCurrencyProvider, useValue: nationalBankCurrencyProviderSpy },
            ]
        });

        let sut = TestBed.inject(RatesDialogService);
    });

    it('should use ValueService', () => {

        const dialogProviderSpy = jasmine.createSpyObj('DialogProvider', ['openDialog']);
        const currencyRateProviderSpy = jasmine.createSpyObj('NationalBankCurrencyProvider', ['getCurrenciesForSpecifiedPeriod']);
        const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

        let rateService = new RatesDialogService(dialogProviderSpy, currencyRateProviderSpy, storeSpy);

        expect(rateService.openLoadRatesForPeriod());
    });
});
