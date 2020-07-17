import { IApiResponseBackend } from '@app/entities/api-response';
import { Injectable } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { map } from '@node_modules/rxjs/internal/operators';

import { HttpBaseService } from '@services/http.svc';
import { SessionService } from '@services/session.svc';
import { LoggingService } from '@services/logging.svc';
import { IApiResponse } from '@entities/api-response';
import { APP_KEYS } from '@entities/app-keys';
import { IProductVersion, IAwardsErrorType } from '@entities/models';
import { environment } from '../../../environments/environment';
import { UrlResolver } from './url-reolver';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

@Injectable()
export class AwardsService {
    protected readonly CLASSNAME = 'AwardsService';
    private serverUrl: string;
    cols: any[] = [];
    rowData: any[] = [];

    constructor(private _http: HttpBaseService,
        private _sessionSvc: SessionService,
        private _log: LoggingService,
        private _url: UrlResolver) {

    }

    public getBRUFileType(errorType: string, MainFrameIDs: string = null, startDate: Date = null,
        endDate: Date = null): Observable<IApiResponseBackend> {
        const backendModel: any = {
            FileType: errorType,
            FromFileDate: startDate,
            ToFileDate: endDate,
            MainframeFIID: MainFrameIDs
        };

        const url = this._url.serverUrl + 'product/RetrieveAwardFileTypeResponse';
        return this._http.post(url, backendModel);
    }
    public getMRFFileType(errorType: string, MainFrameIDs: string = null, startDate: Date = null,
        endDate: Date = null): Observable<IApiResponseBackend> {
        const backendModel: any = {
            FileType: errorType,
            FromFileDate: startDate,
            ToFileDate: endDate,
            MainframeFIID: MainFrameIDs
        };

        const url = this._url.serverUrl + 'product/RetrieveAwardMonetaryFileTypeResponse';
        return this._http.post(url, backendModel);
    }
    public getErrorData(errorType: string, MainFrameIDs: string = null, startDate: Date = null,
        endDate: Date = null): Observable<IApiResponseBackend> {

        // this.rowData = [];
        const dt: Date = new Date(); //null;
        dt.getDate();

        let response: IApiResponseBackend = { ErrorMessages: [], Flags: [], Expiration: dt };

        switch (errorType) {
            case 'EME':
            case 'EMM':
            case 'PPCF':
                this.rowData = [
                    {
                        'filetype': 'log', 'filename': 'award.log', 'mainframefiid': '1234', 'bin': '123456', 'panlast4': '1234',
                        'cardholdername': 'John Doe', 'address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                        'postalcode': '73321', 'fiaccount': '312542', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'filetype': 'log', 'filename': 'award2.log', 'mainframefiid': '1234', 'bin': '123456', 'panlast4': '1234',
                        'cardholdername': 'Samatha Price', 'address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                        'postalcode': '73321', 'fiaccount': '312542', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'filetype': 'log', 'filename': 'award2a.log', 'mainframefiid': '1554', 'bin': '987456', 'panlast4': '1541',
                        'cardholdername': 'Nathan Summers', 'address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                        'postalcode': '73321', 'fiaccount': '312542', 'dateandtime': '04-29-2020 01:34:00 am',
                        'error': '0000 - Success'
                    }

                ];
                break;
            case 'TRC':
            case 'SAA':
                this.rowData = [
                    { 'mainframefiid': '2234', 'filename': 'award1.log', 'bin': '123456', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success' },
                    { 'mainframefiid': '2234', 'filename': 'award1.log', 'bin': '123456', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success' },
                    { 'mainframefiid': '2234', 'filename': 'award1.log', 'bin': '123456', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success' },
                    { 'mainframefiid': '2234', 'filename': 'award1.log', 'bin': '123456', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success' },
                    { 'mainframefiid': '2234', 'filename': 'award1.log', 'bin': '123456', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success' },
                ];
                break;
            case 'TRR':
                this.rowData = [
                    {
                        'filetype': 'log', 'filename': 'award.log', 'bin': '323456', 'mainframefiid': '3234', 'panlast4': '3234',
                        'cardholdername': 'John Doe', 'pointsawarded': 23, 'sign': '+', 'transactiondate': '04-29-2020', 'fiaccountnumber': '312542',
                        'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'filetype': 'log', 'filename': 'award.log', 'bin': '323456', 'mainframefiid': '3234', 'panlast4': '3234',
                        'cardholdername': 'John Doe', 'pointsawarded': 23, 'sign': '+', 'transactiondate': '04-29-2020', 'fiaccountnumber': '312542',
                        'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'filetype': 'log', 'filename': 'award.log', 'bin': '323456', 'mainframefiid': '3234', 'panlast4': '3234',
                        'cardholdername': 'John Doe', 'pointsawarded': 65, 'sign': '+', 'transactiondate': '04-29-2020', 'fiaccountnumber': '312542',
                        'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    }
                ];
                break;
            case 'BRU':
                //errorType: string, MainFrameIDs: string[] = [], startDate: Date = null, endDate: Date=null
                const backendModel: any = {
                    FileType: errorType,
                    FromFileDate: startDate,
                    ToFileDate: endDate,
                    MainframeFIID: MainFrameIDs
                };

                const url = this._url.serverUrl + 'product/RetrieveAwardFileTypeResponse';
                this._http.post(url, backendModel).subscribe((res: IApiResponseBackend) => {
                    this.rowData = res.Data;
                    response.Expiration = res.Expiration;
                    response.ErrorMessages = res.ErrorMessages;
                    response.Flags = res.Flags;
                    response.RedirectTo = res.RedirectTo;
                    response.Data = res.Data;
                    return response;
                }
                );


                // this.rowData = [
                //     {'mainframefiid': '1234', 'binfilename': '123456', 'sysprinagent':'1234/5678/9012', 'recordtype':'BRU',
                //     'account':'6542312','cardholdername': 'John Doe','address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                //     'fiaccount': '312542', 'updatetype':'override','dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'},

                //     {'mainframefiid': '1234', 'binfilename': '2867', 'sysprinagent':'1234/5678/9012', 'recordtype':'BRU',
                //     'account':'6542312','cardholdername': 'John Doe','address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                //     'fiaccount': '312542', 'updatetype':'override','dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'},

                //     {'mainframefiid': '1234', 'binfilename': '127776', 'sysprinagent':'1234/5678/9012', 'recordtype':'BRU',
                //     'account':'6542312','cardholdername': 'John Doe','address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                //     'fiaccount': '312542', 'updatetype':'override','dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'},

                //     {'mainframefiid': '1234', 'binfilename': '42323', 'sysprinagent':'1234/5678/9012', 'recordtype':'BRU',
                //     'account':'6542312','cardholdername': 'John Doe','address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                //     'fiaccount': '312542', 'updatetype':'override','dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'},

                //     {'mainframefiid': '1234', 'binfilename': '123456', 'sysprinagent':'1234/5678/9012', 'recordtype':'BRU',
                //     'account':'6542312','cardholdername': 'John Doe','address1': 'Address 1', 'address2': 'Address 2', 'city': 'Allen',
                //     'fiaccount': '312542', 'updatetype':'override','dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'}

                // ];
                break;
            case 'MFT':
                this.rowData = [
                    {
                        'mainframefiid': '1234', 'monetaryfilename': 'fund002.log', 'account': '6542312', 'cardholdername': 'John Doe',
                        'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'sysprinagent': '1234/5678/9012', 'recordtype': 'BRU',
                        'transactionamount': 123.33, 'trancode': '0020', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'mainframefiid': '2234', 'monetaryfilename': 'fund002.log', 'account': '6542312', 'cardholdername': 'John Doe',
                        'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'sysprinagent': '1234/5678/9012', 'recordtype': 'BRU',
                        'transactionamount': 223.33, 'trancode': '0020', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    },

                    {
                        'mainframefiid': '34234', 'monetaryfilename': 'fund002.log', 'account': '6542312', 'cardholdername': 'John Doe',
                        'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'sysprinagent': '1234/5678/9012', 'recordtype': 'BRU',
                        'transactionamount': 33.33, 'trancode': '0020', 'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                    }

                ];
                break;
            case 'MRF':
                const mrfbackendModel: any = {
                    FileType: errorType,
                    FromFileDate: startDate,
                    ToFileDate: endDate,
                    MainframeFIID: MainFrameIDs
                };

                const murl = this._url.serverUrl + 'product/RetrieveAwardsMonetaryResponseFileType';
                this._http.post(murl, mrfbackendModel).subscribe((res: IApiResponseBackend) => {
                    this.rowData = res.Data;
                    response.Expiration = res.Expiration;
                    response.ErrorMessages = res.ErrorMessages;
                    response.Flags = res.Flags;
                    response.RedirectTo = res.RedirectTo;
                    response.Data = res.Data;
                    return response;
                }
                );


                // this.rowData = [
                //     {
                //         'MainframeFIID': '1234', 'responsefilename': 'filename.log', 'mrffiledate': '04-29-2020 01:34:00 am', 'mrffilesequence': 'filesquence', 'recordtype': 'MRF', 'sysprinagent': '1234/5678/9012', 'BruCardNumberMasked': 'BBBBBBXXXXXXXSSSC', 'ChName': 'John Doe',
                //         'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'monetaryfilename': 'fund002.log', 'clientnumber': '12345', 'recordtypeid': '12345', 'transactionid': '12345',
                //         'trancode': '0020', 'itemdate': '04-29-2020 01:34:00 am', 'transactionamount': 123.33, 'referencenumber': 'AAA12345', 'cardacceptorcode': 'AAA123456', 'unparsedmerchantinformation': 'test123',
                //         'merchantname': 'test user', 'merchantcity': 'test', 'merchantstate': 'test state', 'tickettermscode': 'test code', 'mcc': 'mcc test', 'unparsedmonaterydata': 'test data', 'networkid': 'test network id',
                //         'cashbackamount': 'test cashbackamount', 'posentrymode': 'test posentrymode', 'ecicode': 'test ecicode', 'pinindicator': 'pinindicator', 'mechantzip': 'mechantzip', 'recurringpaymentindicator': 'test recurringpaymentindicator',
                //         'walletprogramid': 'walletprogramid', 'unparsedmandatorydata': 'unparsed mandatorydata', 'ResponseErrorCode': 'test errorcode', 'datawillbeshowasis': 'datawillbeshowasis',
                //         'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                //     },

                //     {
                //         'MainframeFIID': '1235', 'responsefilename': 'filename.log', 'mrffiledate': '04-29-2020 01:34:00 am', 'mrffilesequence': 'filesquence', 'recordtype': 'MRF', 'sysprinagent': '1234/5678/9012', 'BruCardNumberMasked': 'BBBBBBXXXXXXXSSSC', 'ChName': 'Mark Joy',
                //         'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'monetaryfilename': 'fund002.log', 'clientnumber': '12345', 'recordtypeid': '12345', 'transactionid': '12345',
                //         'trancode': '0020', 'itemdate': '04-29-2020 01:34:00 am', 'transactionamount': 123.33, 'referencenumber': 'AAA12345', 'cardacceptorcode': 'AAA123456', 'unparsedmerchantinformation': 'test123',
                //         'merchantname': 'test user', 'merchantcity': 'test', 'merchantstate': 'test state', 'tickettermscode': 'test code', 'mcc': 'mcc test', 'unparsedmonaterydata': 'test data', 'networkid': 'test network id',
                //         'cashbackamount': 'test cashbackamount', 'posentrymode': 'test posentrymode', 'ecicode': 'test ecicode', 'pinindicator': 'pinindicator', 'mechantzip': 'mechantzip', 'recurringpaymentindicator': 'test recurringpaymentindicator',
                //         'walletprogramid': 'walletprogramid', 'unparsedmandatorydata': 'unparsed mandatorydata', 'ResponseErrorCode': 'test errorcode', 'datawillbeshowasis': 'datawillbeshowasis',
                //         'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                //     },

                //     {
                //         'MainframeFIID': '1236', 'responsefilename': 'filename.log', 'mrffiledate': '04-29-2020 01:34:00 am', 'mrffilesequence': 'filesquence', 'recordtype': 'MRF', 'sysprinagent': '1234/5678/9012', 'BruCardNumberMasked': 'BBBBBBXXXXXXXSSSC', 'ChName': 'Henry Doe',
                //         'address1': 'Address 1', 'city': 'Allen', 'fiaccount': '312542', 'monetaryfilename': 'fund002.log', 'clientnumber': '12345', 'recordtypeid': '12345', 'transactionid': '12345',
                //         'trancode': '0020', 'itemdate': '04-29-2020 01:34:00 am', 'transactionamount': 123.33, 'referencenumber': 'AAA12345', 'cardacceptorcode': 'AAA123456', 'unparsedmerchantinformation': 'test123',
                //         'merchantname': 'test user', 'merchantcity': 'test', 'merchantstate': 'test state', 'tickettermscode': 'test code', 'mcc': 'mcc test', 'unparsedmonaterydata': 'test data', 'networkid': 'test network id',
                //         'cashbackamount': 'test cashbackamount', 'posentrymode': 'test posentrymode', 'ecicode': 'test ecicode', 'pinindicator': 'pinindicator', 'mechantzip': 'mechantzip', 'recurringpaymentindicator': 'test recurringpaymentindicator',
                //         'walletprogramid': 'walletprogramid', 'unparsedmandatorydata': 'unparsed mandatorydata', 'ResponseErrorCode': 'test errorcode', 'datawillbeshowasis': 'datawillbeshowasis',
                //         'dateandtime': '04-29-2020 01:34:00 am', 'error': '0000 - Success'
                //     }

                // ];
                break;
        }

        // const ret: IApiResponseBackend = { Data: this.rowData, Expiration: dt, ErrorMessages : [], Flags: []};
        response.Data = this.rowData;
        // response = ret;
        // return of(ret);

        return of(response);
    }

    public getErrorTypes(): Observable<IApiResponse> {
        const dd: Date = new Date();

        const lst: IAwardsErrorType[] = [
            //   {ID:'EME', value: 'EME'},
            //   {ID: 'EMM', value: 'Electronic Monthly Maintenance (EMM)'},
            //   {ID: 'PPCF', value: 'PPCF'},
            { ID: 'BRU', value: 'BRU Response File' },
            { ID: 'MRF', value: 'Monetary Response File' }
            //   {ID:'TRC', value: 'Card Transaction File (TRC)'},
            //   {ID: 'SAA', value: 'Stand Alone Awards (SAA)'},
            //   {ID: 'TRR', value: 'TRR'},
            //   {ID:'MFT', value: 'Monetary File Type (MFT)'}
            //   {ID:'MRF', value: 'Monetary Response (MRF)'}
        ];

        const rep = <IApiResponse>{
            data: lst, statusCode: 0, redirectTo: null, value: null,
            expiration: dd, flags: null, errorMessages: null
        };

        return of(rep);
    }

    public getColumns(errorType: string) {
        let lst: string[] = [];
        const dd: Date = new Date();

        switch (errorType) {
            case 'EME':
            case 'EMM':
            case 'PPCF':
                this.cols = [
                    { field: 'filetype', header: 'File Type' },
                    { field: 'filename', header: 'File Name' },
                    { field: 'mainframefiid', header: 'Mainframe FIID' },
                    { field: 'bin', header: 'BIN' },
                    { field: 'panlast4', header: 'PAN last 4' },
                    { field: 'cardholdername', header: 'Cardholder Name' },
                    { field: 'address1', header: 'Address 1' },
                    { field: 'address2', header: 'Address 2' },
                    { field: 'city', header: 'City' },
                    { field: 'state', header: 'State' },
                    { field: 'postalcode', header: 'Postal Code' },
                    { field: 'fiaccount', header: 'FI Account' },
                    { field: 'dateandtime', header: 'Date & Time' },
                    { field: 'error', header: 'Error Code + Description' }
                ];
                break;
            case 'TRC':
            case 'SAA':
                this.cols = [
                    { field: 'mainframefiid', header: 'Mainframe FIID' },
                    { field: 'filename', header: 'File Name' },
                    { field: 'bin', header: 'BIN' },
                    { field: 'dateandtime', header: 'Date & Time' },
                    { field: 'error', header: 'Error Code + Description' }
                ];
                break;
            case 'TRR':
                this.cols = [
                    { field: 'filetype', header: 'File Type' },
                    { field: 'filename', header: 'File Name' },
                    { field: 'bin', header: 'BIN' },
                    { field: 'mainframefiid', header: 'Mainframe FIID' },
                    { field: 'panlast4', header: 'PAN last 4' },
                    { field: 'cardholdername', header: 'Cardholder Name' },
                    { field: 'pointsawarded', header: 'Points Awarded' },
                    { field: 'sign', header: 'Sign' },
                    { field: 'transactiondate', header: 'Transaction Date' },
                    { field: 'fiaccountnumber', header: 'FI Account Number' },
                    { field: 'dateandtime', header: 'Date & Time' },
                    { field: 'error', header: 'Error Code + Description' }
                ];
                break;
            case 'BRU':
                this.cols = [
                    { field: 'MainframeFIID', header: 'Mainframe FIID' },
                    { field: 'ResponseFileName', header: 'Response File Name' },
                    { field: 'BruFileDate', header: 'File Date' },
                    { field: 'BruFileSequence', header: 'File Seq #' },
                    { field: 'BruRecordType', header: 'Record Type' },
                    { field: 'BruCardNumberMasked', header: 'Account' }, // 'BBBBBBXXXXXXXSSSC'
                    { field: 'ChName', header: 'Cardholder Name' },
                    { field: 'ChAddress1', header: 'Address 1' },
                    { field: 'ChCity', header: 'City' },
                    { field: 'FiAccountNumber', header: 'FI Account' },
                    { field: 'BruRewardUpdateType', header: 'Update Type' },
                    { field: 'ResponseErrorCode', header: 'Error Code + Description' }
                ];
                break;
            case 'MFT':
                this.cols = [
                    { field: 'mainframefiid', header: 'Mainframe FIID' },
                    { field: 'monetaryfilename', header: 'Monetary File Name' },
                    { field: 'account', header: 'Account' }, // 'BBBBBBXXXXXXXSSSC'
                    { field: 'cardholdername', header: 'Cardholder Name' },
                    { field: 'address1', header: 'Address 1' },
                    { field: 'city', header: 'City' },
                    { field: 'fiaccount', header: 'FI Account' },
                    { field: 'sysprinagent', header: 'Sys/Prin/Agent' },
                    { field: 'recordtype', header: 'Record Type' },
                    { field: 'transactionamount', header: 'Transaction Amount' },
                    { field: 'trancode', header: 'Tran Code' },
                    { field: 'dateandtime', header: 'Date & Time' },
                    { field: 'error', header: 'Error Code + Description' }
                ];
                break;
            case 'MRF':
                this.cols = [
                    { field: 'MainframeFiid', header: 'Mainframe FIID' },
                    { field: 'ResponseFileName', header: 'Response File Name' },
                    { field: 'MonetaryFileDate', header: 'File Date' },
                    { field: 'MonetaryFileSequence', header: 'File Seq #' },
                    { field: 'MonetaryRecordType', header: 'Record Type' },
                    { field: 'MonetaryCardNumberMasked', header: 'Account' }, // 'BBBBBBXXXXXXXSSSC'
                    { field: 'ChName', header: 'Cardholder Name' },
                    { field: 'ChAddress1', header: 'Address 1' },
                    { field: 'ChCity', header: 'City' },
                    { field: 'FiAccountNumber', header: 'FI Account' },
                    { field: 'MonetaryTransactionAmount', header: 'Transaction Amount' },
                    { field: 'MonetaryTranCode', header: 'Tran Code' },
                    { field: 'ResponseErrorCode', header: 'Error Code + Description' }
                ];
                break;
            default:
                lst = null;
                break;
        }

        const rep = <IApiResponse>{
            data: this.cols, statusCode: 0, redirectTo: null, value: null,
            expiration: dd, flags: null, errorMessages: null
        };

        return of(rep);
    }


}
