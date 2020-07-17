import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpBaseService, VaultService, SessionService, LoggingService, ProductService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DashboardIntroductionComponent } from '..';
import { UrlResolver } from '@app/services/url-reolver';
import { SingletonService } from '@app/services/singleton.svc';

describe('DashboardIntroductionComponent', () => {
    let component: DashboardIntroductionComponent;
    let fixture: ComponentFixture<DashboardIntroductionComponent>;
    let injector;
    let productService: ProductService;
    let vaultservice: VaultService;
    let sliderWrapper: HTMLDivElement;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DashboardIntroductionComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                SlickCarouselModule,
                HttpClientModule,
                ToastrModule.forRoot(),
            ],
            providers: [
                SessionService,
                HttpBaseService,
                LoggingService,
                VaultService,
                ProductService,
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(DashboardIntroductionComponent);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        productService  = injector.get(ProductService);
        vaultservice    = injector.get(VaultService);
        fixture.detectChanges();
    }));

});
