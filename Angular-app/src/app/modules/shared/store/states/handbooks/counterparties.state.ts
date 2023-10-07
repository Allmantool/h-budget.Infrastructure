import { Injectable } from '@angular/core';

import { State } from '@ngxs/store';

import { ICounterpartiesStateModel } from './models/ICounterpartiesStateModel';

@State<ICounterpartiesStateModel>({
	name: 'counterpartiesHandbook',
	defaults: {
		counterparties: [],
	},
	children: [],
})
@Injectable()
export class CounterpartiesState {}
