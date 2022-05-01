import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './components/dashboard.component';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			declarations: [DashboardComponent],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(DashboardComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it(`should have as title 'h-budget'`, () => {
		const fixture = TestBed.createComponent(DashboardComponent);
		const app = fixture.componentInstance;
		expect(app.browserTitle).toEqual('default-title');
	});

	it('should render title', () => {
		const fixture = TestBed.createComponent(DashboardComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement;
		expect(compiled.querySelector('.content span').textContent).toContain(
			'default-title app is running!'
		);
	});
});
