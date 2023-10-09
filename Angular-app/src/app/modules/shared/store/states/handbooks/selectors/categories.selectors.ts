import { createSelector } from '@ngxs/store';

import { CategoriesState } from '../categories.state';
import { ICategorieStateModel } from '../models/ICategoriesStateModel';

export const getCategories = createSelector(
	[CategoriesState],
	(state: ICategorieStateModel) => state?.categories
);
