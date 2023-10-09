import { Injectable } from '@angular/core';

import { Action, State, StateContext } from '@ngxs/store';
import * as _ from 'lodash';
import { nameof } from 'ts-simple-nameof';

import { ICategorieStateModel } from './models/ICategoriesStateModel';
import { AddCategory } from './actions/category.actions';
import { OperationCategory } from '../../../../../../domain/models/accounting/operation-category';

@State<ICategorieStateModel>({
	name: 'categoriesHandbook',
	defaults: {
		categories: [],
	},
	children: [],
})
@Injectable()
export class CategoriesState {
	@Action(AddCategory)
	AddCategory(
		{ getState, patchState }: StateContext<ICategorieStateModel>,
		{ category }: AddCategory
	): void {
		const state = getState();

		const items = _.orderBy(
			[...state.categories, category],
			nameof<OperationCategory>((op) => op.value),
			['asc']
		);

		patchState({
			categories: items,
		});
	}
}
