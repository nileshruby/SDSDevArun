import {
  async,
  ComponentFixture,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { CommonModule, APP_BASE_HREF } from '@angular/common';

// import { DashboardPage } from '.';
import { DashboardProductDetailsComponent } from './dash-product-details.comp';
import { RouterModule } from '@angular/router';

import {} from 'jasmine';

describe('DashboardProductDetailsComponent', () => {
  let component: DashboardProductDetailsComponent;
  let fixture: ComponentFixture<DashboardProductDetailsComponent>;

  const routes = [
    { path: 'dashPrddetails', component: DashboardProductDetailsComponent }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardProductDetailsComponent],
      imports: [RouterModule.forRoot(routes)],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardProductDetailsComponent);
    component = fixture.componentInstance;
  }));

  it('should have as title "Dashboard Product Details"'),
    async(() => {
      // const fixture = TestBed.createComponent(DashboardProductDetailsComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('Dash Product Details');
    });

  it('should be true'),
    async(() => {
      expect(true === true);
    });
});
