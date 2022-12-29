import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app-root.component.html',
	styleUrls: ['./app-root.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRootComponent {
	constructor(private route: ActivatedRoute, private router: Router) {}

	public navigateToDashboard(): void {
		this.router.navigate(['/'], { relativeTo: this.route });
	}
}
