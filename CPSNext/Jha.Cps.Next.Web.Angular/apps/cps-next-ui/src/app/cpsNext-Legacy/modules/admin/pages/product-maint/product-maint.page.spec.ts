import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { GA_ProductMaintPage } from '..';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, ProductService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, AccountService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProductContext } from '@app/entities/models';
import { of } from 'rxjs';
import { LocalModalComponent } from '@app/modules/shared/components';
import { UrlResolver } from '@app/services/url-reolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';

describe('GA_ProductMaintPage', () => {
    let component: GA_ProductMaintPage;
    let fixture: ComponentFixture<GA_ProductMaintPage>;
    let injector;
    let productService: ProductService;
    let toastrService: ToastrService;
    let dialogService: DialogService;
    let prodModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let datatable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GA_ProductMaintPage,
                LocalModalComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                HttpClientModule,
                TableModule,
                ToastrModule.forRoot(),
                FormsModule,

            ],
            providers: [
                DialogService,
                ProductService,
                HelpersService,
                SessionService,
                HttpBaseService,
                LoggingService,
                VaultService,
                ToastrService,
                AccountService,
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(GA_ProductMaintPage);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        productService  = injector.get(ProductService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        prodModal       = fixture.componentInstance.prodModal;
        debugElement    = fixture.debugElement;
        element         = debugElement.nativeElement;
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        expect(component).toBeTruthy();
    }));

    describe('onProdSaveClick', () => {
        it('should return Invalid data error. if prodForm id invalid', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.prodForm.setValue({productName: '',productCode: '', productId: 0, shortDesc: '', longDesc: '', isOffered: false});
            component.onProdSaveClick();
            expect(component.prodForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('should have the saveProduct being called when the form is submited', () => {

            component.items = [];
            component.isProductCodeDup = true;

            component.prodForm.setValue({productCode: 'CARD1', productId: 1, productName: 'Card maintainance', shortDesc: 'Card Maintenance (382 message service) for Translator', longDesc: 'Card Maintenance (382 message service) for Translator', isOffered: false });
            component.prodEditing = new ProductContext;
            
            let data = new ProductContext();
                data.productName = 'Card maintainance';
                data.shortDesc = 'test';
                data.longDesc = 'test';
                data.isOffered = true;
                data.productCode = 'CARD1';
                data.productId = 1;
            let date = new Date();
            let response = {data:data, "expiration": date, "errorMessages": [], "flags": [] }
            let spyOnSaveProduct = spyOn(productService, 'saveProduct').and.returnValue(of(response));
            component.onProdSaveClick();
            component.prodModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(component.items[0].productCode).toEqual('CARD1');
        });
    });
    
    describe('onProdCreateClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            component.onProdCreateClick('');
            expect(component.prodModal.isOpen).toEqual(true);
        });
    });

    describe('onProdEditClick', () => {
        it('should have the edit product when the form is onProdEditClick', () => {
            let data = new ProductContext;
            data.productId = 1;
            data.productName = 'Card maintainance';
            data.shortDesc = 'test';
            data.productCode = 'test123',
            data.longDesc = 'test';
            data.isOffered = true;
            let product = {data:data}
            component.onProdEditClick(product);
            expect(component.prodEditing.productId).toBe(product.data.productId);
        });
    });

    describe('onSearch', () => {
        it('should have the search product and if the search string is empty so return undefined', () => {
            let search = '';
            expect(component.onSearch(search, datatable)).toBeUndefined();
        });

        it('should have the search product and if the search string is xxx so set item list', () => {
            let product1 = new ProductContext();
            product1.productId = 2;
            product1.productName = 'Card maintainance';
            let product2 = new ProductContext();
            product2.productId = 1;
            product2.productName = 'Product 1';
            component.items = [product1, product2];
            expect(component.onSearch('Card maintainance', datatable)).toBeUndefined();
        });
    });
    describe('isCheckProductCode', () => {
        it('should return Invalid product code error. if product code is less than to 2', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.prodForm.setValue({productName: '',productCode: '1', productId: 0, shortDesc: '', longDesc: '', isOffered: false});
            component.isCheckProductCode();
            expect(component.isProductCodeDup).toBe(false);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('should return Invalid product code error. if product code is greater  then to 7', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.prodForm.setValue({productName: '',productCode: '1', productId: 0, shortDesc: '', longDesc: '', isOffered: false});
            component.isCheckProductCode();
            expect(component.isProductCodeDup).toBe(false);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });
        it('IsProductCodeDup must be true if the product code is already available', () => {
            let product1 = new ProductContext();
                product1.productId = 2;
                product1.productName = 'Card maintainance';
                product1.productCode = 'TEST1';
            let product2 = new ProductContext();
                product2.productId = 1;
                product2.productName = 'Product 1';
                product2.productCode = 'TEST2';
            component.items = [product1, product2];

            component.prodForm.setValue({productName: '',productCode: 'TEST1', productId: 0, shortDesc: '', longDesc: '', isOffered: false});
            component.isCheckProductCode();
            expect(component.isProductCodeDup).toBe(true);
        });
    });
});
