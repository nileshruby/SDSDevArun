import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { DetailsComponent } from './details.comp';
import { ActivityItemPipe, SearchTimeRangePipe } from '@modules/generic-product/pipes';
const PIPES = [ ActivityItemPipe, SearchTimeRangePipe ];
import {LoggingService, ProductService, HttpBaseService, SessionService, VaultService} from '@app/services';
import { SharedModule } from '@app/modules/shared/shared.mod';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule} from '@angular/common';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ToastrModule} from '@node_modules/ngx-toastr';
import { IContactDetails, ProductContext} from '@entities/models';
import { of } from 'rxjs';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { PRODUCT_IDS } from '@app/entities/product-ids';
import { UrlResolver } from '@app/services/url-reolver';
import { SingletonService } from '@app/services/singleton.svc';

describe('DetailsComponent', () => {
    let component: DetailsComponent;
    let fixture: ComponentFixture<DetailsComponent>;
    let injector;
    let productService: ProductService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
        imports: [
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            HttpClientModule,
            MatSlideToggleModule,
            HttpClientTestingModule,
            SharedModule,
            ToastrModule.forRoot(),
        ],
        declarations: [
            DetailsComponent,
            ...PIPES,
        ],
        providers: [
            ProductService,
            HttpBaseService,
            SessionService,
            VaultService,
            LoggingService,
            UrlResolver,
            SingletonService
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(DetailsComponent);
        component = fixture.componentInstance;
        injector = getTestBed();
        productService = injector.get(ProductService);
        fixture.detectChanges();
    }));
    
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnChanges', () => {
        it('should get the correct product which is Card Maintainance when method is called', () => {
            component.productId =2;
            component.loading = true;
            PRODUCT_IDS.CPSRTP = 2;
            let product1 = new ProductContext();
            product1.productId = 2;
            product1.productName = 'Card maintainance';

            let product2 = new ProductContext();
            product2.productId = 1;
            product2.productName = 'Product 1';

            let response = [product1, product2];

            spyOn(productService, 'getProducts').and.returnValue(of(response));
            component.ngOnChanges();
            component.loading = false;

            expect(component.product.productName).toEqual('Card maintainance');
            expect(component.product.productId).toEqual(2);
        });

        it('should get the correct primary contact of the Card Maintainance product when method is called', () => {
            component.productId =2;
            component.loading = true;
            PRODUCT_IDS.CPSRTP = 2;
            let product1 = new ProductContext();
            product1.productId = 2;
            product1.productName = 'Card maintainance';

            let contact1: IContactDetails = {
                contactId: 1,
                productId: 2,
                name: 'John',
                phone: '123456789',
                email: 'test@test.com',
                contactType: 'abc',
                isPrimary: true
            }

            let contact2: IContactDetails = {
                contactId: 1,
                productId: 2,
                name: 'Doe',
                phone: '123456789',
                email: 'test@test.com',
                contactType: 'abc',
                isPrimary: false
            }

            product1.contacts = [contact1, contact2]

            let product2 = new ProductContext();
            product2.productId = 1;
            product2.productName = 'Product 1';

            let response = [product1, product2];

            spyOn(productService, 'getProducts').and.returnValue(of(response));
            component.ngOnChanges();
            component.loading = false;

            expect(component.primContact.name).toEqual('John');
        });
    });
    
    describe('onFormSubmit', () => {
        it('should have the saveProduct being called when the form is submited', () => {
            component.loading = true;
            const spyOnSaveProduct = spyOn(productService, 'saveProduct').and.callThrough();
            component.detailsForm = new FormGroup({
                productName: new FormControl('test', Validators.required),
                versionNumber: new FormControl('testversion', Validators.required),
                shortDesc: new FormControl('Card Maintenance (382 message service) for Translator', Validators.required),
                longDesc: new FormControl('Card Maintenance (382 message service) for Translator', Validators.required),
                contactName: new FormControl('Midhun Pinjala', Validators.required),
                contactEmail: new FormControl('MPinjala@jackhenry.com', Validators.required),
                supportNumber: new FormControl('(123) 123-1231', Validators.required)
              });
            component.onFormSubmit();
            component.loading = false;
            expect(spyOnSaveProduct).toHaveBeenCalled();
        });
    });

    describe('onDetailsEditClick', () => {
        it('should have the edit form showing when the click onDetailsEditClick', () => {
            let product = new ProductContext();
            product.productId = 2;
            product.productName = 'Card maintainance';
            product.versionNumber = 'test version';
            product.shortDesc = 'Crd maintainancCard Maintenance (382 message service) for Translatore';
            product.longDesc = '	Card Maintenance for Translator.';
            product.contactName = 'Midhun Pinjala';
            product.contactEmail = 'MPinjala@jackhenry.com';
            product.supportNumber = '(123) 123-1231';
            component.product = product;
            component.onDetailsEditClick();
            expect(component.editMode).toBe(true);
        });
    });

    describe('onCancelClick', () => {
        it ('should have the close the model  when the click  onCancelClick', () => {
            console.log('test run this function');
            component.onCancelClick();
            expect(component.editMode).toBe(false);
        });
    });
});
