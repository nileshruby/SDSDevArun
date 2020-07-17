import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { DialogService, HelpersService, HttpBaseService, VaultService, SessionService, LoggingService, ProductService} from '@app/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { LocalModalComponent } from '@app/modules/shared/components';
import { IProductVersion, IProductVersionNote } from '@app/entities/models';
import { UrlResolver } from '@app/services/url-reolver';
import { SingletonService } from '@app/services/singleton.svc';
import { TableModule } from 'primeng/table';
import { VersionComponent } from './version.comp';

describe('VersionComponent', () => {
    let component: VersionComponent;
    let fixture: ComponentFixture<VersionComponent>;
    let injector;
    let productService: ProductService;
    let toastrService: ToastrService;
    let dialogService: DialogService;
    let versionModal: LocalModalComponent;
    let noteModal: LocalModalComponent;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let mainframeId: DebugElement;
    let dataTable: ElementRef;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                VersionComponent,
                LocalModalComponent,
            ],
            imports: [
                CommonModule,
                ReactiveFormsModule,
                HttpClientModule,
                ToastrModule.forRoot(),
                TableModule
            ],
            providers: [
                DialogService,
                HelpersService,
                SessionService,
                HttpBaseService,
                LoggingService,
                VaultService,
                ToastrService,
                ProductService,
                UrlResolver,
                SingletonService
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
        }).compileComponents();

        fixture         = TestBed.createComponent(VersionComponent);
        component       = fixture.componentInstance;
        injector        = getTestBed();
        productService  = injector.get(ProductService);
        toastrService   = injector.get(ToastrService);
        dialogService   = injector.get(DialogService);
        versionModal    = fixture.componentInstance.versionModal;
        noteModal       = fixture.componentInstance.noteModal;
        fixture.detectChanges();
    }));

    it('should be created', async(() => {
        component.Heading = 'Test';
        component.productId = 3;
        expect(component).toBeTruthy();
    }));

    describe('onSearch', () => {
        it('should have the search Product Version', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            component.items = [ip];
            component.onSearch('test version', dataTable);
            expect(component.items[0].version).toEqual('test version');
        });
    });

    describe('onVersionCreateClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            component.versionModal.open;
            const event = new MouseEvent('click'); 
            spyOn(event, 'preventDefault');
            expect(component.onVersionCreateClick(event)).toBeUndefined();
        });
    });

    describe('onVersionEditClick', () => {
        it('should have the edit Fi Context when the form is onVersionEditClick', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            let ipContent = {data:ip}
            component.onVersionEditClick(ipContent);
            expect(component.versionEditing.productId).toBe(ipContent.data.productId);
        });
    });
    
    describe('onKeyUpDate', () => {
        it('should have set the productionInputDate when the click onKeyUpDate', () => {
            component.onKeyUpDate('2019-06-08 07:00:00');
            expect(component.productionInputDate).toBe('2019-06-08 07:00:00');
        });
    });

    describe('onVersionSaveClick', () => {
        it('should return Invalid data error. if the form is empty.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.versionForm = new FormGroup({
                version: new FormControl('', Validators.required),
                released: new FormControl(false),
                releaseOrProductionDate: new FormControl('', Validators.required),
                note: new FormControl('', Validators.required)
              });
            component.onVersionSaveClick();
            expect(component.versionForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the onVersionSaveClick being called when the form is submited', () => {
            component.items = [];
            component.versionForm = new FormGroup({
                versionId: new FormControl('1'),
                version: new FormControl('test'),
                released: new FormControl(true),
                releaseOrProductionDate: new FormControl('2019-06-08 07:00:00'),
                note: new FormControl('note test')
              });
            component.versionEditing = new IProductVersion;
            
            let data = new IProductVersion();
            data.versionId                  = 1;
            data.version                    = 'test';
            data.released                   = true;
            data.releaseOrProductionDate    = '2019-06-08 07:00:00';
            data.note                       = 'test note';
            let date = new Date();
            let response = {data:data, errorMessages: [], expiration: date, flags: [] }
            const spyOnSaveProduct = spyOn(productService, 'saveProductVersion').and.returnValue(of(response));
            component.onVersionSaveClick();
            component.versionModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(component.items[0].version).toEqual('test');
        });

        it('should have the SaveNote being called when the form is submited', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            component.items = [ip];
            component.versionForm = new FormGroup({
                versionId: new FormControl('1'),
                version: new FormControl('test'),
                released: new FormControl(true),
                releaseOrProductionDate: new FormControl('2019-06-08 07:00:00'),
                note: new FormControl('note test')
              });
            component.versionEditing = new IProductVersion;
            let data: IProductVersionNote = {
                noteId     : 1,
                versionId  : 1,
                version    : 'test',
                createdBy  : 'test',
                createDate : '2019-06-08 07:00:00',
                note       : 'test note',
            };
            let date = new Date();
            let response = {data:data,  "expiration": date, "errorMessages": [], "flags": [] }
            const spyOnSaveProduct = spyOn(productService, 'saveVersionNote').and.returnValue(of(response));
            component.SaveNote(data.versionId, component.versionForm);
            component.noteModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(component.items[0].notes[0].version).toEqual('test');
        });
    });
    describe('onVersionCancelClick', () => {
        it('should close modal when calling onVersionCancelClick', () => {
            component.versionModal.close();
            component.onVersionCancelClick([], '');
            expect(component.versionEditing).toBeNull();
            expect(component.versionForm).toBeNull();
        });
    });
    describe('onNoteCreateClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            let data: IProductVersionNote = {
                noteId     : 1,
                versionId  : 1,
                version    : 'test',
                createdBy  : 'test',
                createDate : '2019-06-08 07:00:00',
                note       : 'test note',
            };
            ip.notes = [data];
            component.noteModal.open();
            component.onNoteCreateClick(ip);
            expect(component.noteModal.isOpen).toBe(true);
        });
    });
    describe('onNoteEditClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            let data: IProductVersionNote = {
                noteId     : 1,
                versionId  : 1,
                version    : 'test',
                createdBy  : 'test',
                createDate : '2019-06-08 07:00:00',
                note       : 'test note',
            };
            ip.notes = [data];
            component.noteModal.open();
            component.onNoteCreateClick(ip);
            expect(component.noteModal.isOpen).toBe(true);
        });
    });
    describe('onNoteEditClick', () => {
        it('should return. if modal is already opened. and if the modal is not open so should  open', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            let data: IProductVersionNote = {
                noteId     : 1,
                versionId  : 1,
                version    : 'test',
                createdBy  : 'test',
                createDate : '2019-06-08 07:00:00',
                note       : 'test note',
            };
            ip.notes = [data];
            component.noteModal.open();
            component.onNoteEditClick(ip);
            expect(component.noteModal.isOpen).toBe(true);
        });
    });
    describe('onNoteSaveClick', () => {
        it('should return Invalid data error. if the form is empty.', () => {
            const spyDisplayToastMsg = spyOn(toastrService, 'error').and.stub();
            component.noteForm = new FormGroup({
                note: new FormControl('', Validators.required)
              });
            component.onNoteSaveClick();
            expect(component.noteForm.invalid).toBe(true);
            expect(spyDisplayToastMsg).toHaveBeenCalled();
        });

        it('should have the onNoteSaveClick being called when the form is submited', () => {
            let ip = new IProductVersion();
            ip.productId = 1;
            ip.versionId = 1;
            ip.version = 'test version';
            ip.released = true;
            ip.releaseOrProductionDate = '2019-06-08 07:00:00';
            ip.createdBy = 'test';
            ip.createDate = '2019-06-08 07:00:00';
            ip.updatedBy = 'test1';
            ip.updateDate = '2019-06-08 07:00:00';
            ip.summary = 'test summary';
            ip.note = 'test note';
            component.items = [ip];
            component.noteForm = new FormGroup({
                versionId: new FormControl('1'),
                version: new FormControl('test'),
                released: new FormControl(true),
                releaseOrProductionDate: new FormControl('2019-06-08 07:00:00'),
                note: new FormControl('note test')
              });
            component.noteEditing = new IProductVersion;
            let data: IProductVersionNote = {
                noteId     : 1,
                versionId  : 1,
                version    : 'test',
                createdBy  : 'test',
                createDate : '2019-06-08 07:00:00',
                note       : 'test note',
            };
            let date = new Date();
            let response = {data:data, "expiration": date, "errorMessages": [], "flags": [] }
            const spyOnSaveProduct = spyOn(productService, 'saveVersionNote').and.returnValue(of(response));
            component.onNoteSaveClick();
            component.noteModal.close();
            expect(spyOnSaveProduct).toHaveBeenCalled();
            expect(component.items[0].notes[0].version).toEqual('test');
        });
    });
    describe('onNoteCancelClick', () => {
        it('should close model. if click onNoteCancelClick', () => {
            component.onNoteCancelClick('','');
            expect(component.noteEditing).toBe(null);
        });
    });
});
