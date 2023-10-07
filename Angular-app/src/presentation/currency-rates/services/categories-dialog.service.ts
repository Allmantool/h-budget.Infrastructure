import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

import { DialogProvider } from '../../../app/modules/shared/providers/dialog-provider';
import { DialogContainer } from '../../../app/modules/shared/models/dialog-container';
import { CategoriesDialogComponent } from '../../../app/modules/shared/components/dialog/categories/categories-dialog.component';
import { Result } from '../../../core/result';

@Injectable()
export class CategoriesDialogService {
	constructor(
		private dialogProvider: DialogProvider,
		private store: Store
	) {}

	public openCategories(): void {
		const config = new MatDialogConfig<DialogContainer>();

		const onSave = (operationResult: Result<string[]>) => {
			if (!operationResult.isSucceeded) {
				return;
			}

			const categoryNodesSubject = new Subject<number>();

			return categoryNodesSubject;
		};

		config.data = {
			title: 'Budget categories:',
			onSubmit: onSave,
		} as DialogContainer;

		config.disableClose = true;

		this.dialogProvider.openDialog(CategoriesDialogComponent, config);
	}
}