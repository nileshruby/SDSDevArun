import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { HttpBaseService, VaultService, SessionService, LoggingService, ProductService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { DashboardPage } from '.';
import { ProductContext } from '@app/entities/models';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { UrlResolver } from '@app/services/url-reolver';
import { SingletonService } from '@app/services/singleton.svc';
describe('DashboardPage', () => {
    let component: DashboardPage;
    let fixture: ComponentFixture<DashboardPage>;
    let injector;
    let productService: ProductService;
    let vaultservice: VaultService;
    let sliderWrapper: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DashboardPage,
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

        fixture         = TestBed.createComponent(DashboardPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        productService  = injector.get(ProductService);
        vaultservice    = injector.get(VaultService);
       // sliderWrapper   = fixture.componentInstance.sliderWrapper;
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    describe('isAvailable', () => {
        it('should check xyz item in product list', () => {
            component.prdList = ["1","2","3","4"];
            let response = component.isAvailable(function() {
                return 1;
              });
            expect(response).toBe(true);
        });
    });

    describe('isUserProduct', () => {
        it('should check user product id in product list', () => {
            component.prdList = ["1","2","3","4"];
            let response = component.isUserProduct(1);
            expect(response).toBe(true);
        });
    });

    describe('onProductCardClick', () => {
        it('should have the onProductCardClick being called when the product card is clicked.', () => {
            console.log('test');
            let data = new ProductContext();
            data.productName = 'Card maintainance';
            data.productId = 1;
            component.selectedProductContext = data;
            let response = component.onProductCardClick(1);
            expect(component.selectedProductContext).toBeNull();
            expect(component.collapseProducts).toBe(false);
        });
    });
});
