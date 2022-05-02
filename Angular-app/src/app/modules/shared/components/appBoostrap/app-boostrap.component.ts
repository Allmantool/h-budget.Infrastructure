import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'app-bootsrap',
    templateUrl: './app-boostrap.component.html',
    styleUrls: ['./app-boostrap.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBootsrapCompenent { 
    constructor(
        private route: ActivatedRoute,
        private router: Router) { }

    public navigateToDashboard(): void {
        this.router.navigate(['/'], { relativeTo: this.route });
    }
}