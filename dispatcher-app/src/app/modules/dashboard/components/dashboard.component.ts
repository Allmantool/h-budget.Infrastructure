import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Location } from "@angular/common"

@Component({
  selector: 'app-dashboard-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  constructor(
    private location: Location,
    private meta: Meta,
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('Login');
    this.meta.updateTag({ name: "site", content: "My Site" })
  }

  public browserTitle: string = 'default-title';

  navigateTo(url: string) {
    this.location.go(url)
  }

  goBack() {
    this.location.back()
  }

  goForward() {
    this.location.forward()
  }
}
