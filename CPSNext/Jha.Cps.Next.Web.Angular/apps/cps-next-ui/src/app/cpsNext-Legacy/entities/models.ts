// UI versions of server side models.

import * as moment from 'moment';

// GENERAL
export interface IKVP {
  key: string | number;
  value: any;
}

// ACCOUNT

export interface IUserDetails {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  phoneAlt: string;
  questionId: number;
  question: string;
  answer: string;
}

export interface ISecurityQuestion {
  questionId: number;
  text: string;
  answer: string;
  selected: boolean;
}

export interface IPassword {
  userId: number;
  password: string;
  newPassword: string;
  confirm: string;
}

export interface IUserPassword {
  UsrId: number;
  newPassword: string;
  userName: string;
}


// Financial Institutions

export class FiContext {
  public fiId?: number;
  public aba? = '';
  public pscuClientId? = '';
  public mainframeId? = '';
  public fiName? = '';
  public fiNameShort? = '';
  public address? = '';
  public city? = '';
  public state? = '';
  public zip? = '';
  public zip4? = '';
  public isFdcMigrated? = false;

  public createdBy? = '';
  public updatedBy? = '';
  public createDateTime? = '';
  public updateDateTime? = '';

  public bins?: BinContext[];

  constructor() {
    this.bins = [];
  }
}


// Extra Awards 

export class EAContext {
  public MainframeFIID?: number;
  public responsefilename? = '';
  public mrffiledate? = '';
  public mrffilesequence? = '';
  public recordtype? = '';
  public sysprinagent? = '';
  public BruCardNumberMasked? = '';
  public ChName? = '';
  public address1? = '';
  public city? = '';
  public fiaccount? = '';
  public monetaryfilename? = '';
  public clientnumber? = '';
  public recordtypeid? = '';
  public transactionid? = '';
  public trancode? = '';
  public itemdate? = '';
  public transactionamount? : Number;
  public referencenumber? = '';
  public cardacceptorcode? = '';
  public unparsedmerchantinformation? = '';
  public merchantname? = '';
  public merchantcity? = '';
  public merchantstate? = '';
  public tickettermscode? = '';
  public mcc? = '';
  public unparsedmonaterydata? = '';
  public networkid? = '';
  public cashbackamount? = '';
  public posentrymode? = '';
  public ecicode? = '';
  public pinindicator? = '';
  public mechantzip? = '';
  public recurringpaymentindicator? = '';
  public walletprogramid  ? = '';
  public unparsedmandatorydata? = '';
  public ResponseErrorCode? = '';
  public datawillbeshowasis? = '';
  public dateandtime? = '';
  public error? = '';

}

export class FiLiveStatus {
  public productId?: number;
  public fiId: number;
  public isLive? = false;
}

export class BinContext {
  public binId?: number;
  public fiId?: number;
  public binNumber? = '';
  public merchantNum? = '';
  public pscuPrincipalNum? = '';
  public pscuSysNum? = '';
  public AgentNum? = '';
  public panPattern? = '';
  public IcaNumber? = '';
  public sharedSys? = false;
  public BsnId?: number;
  public pscuPrinNum? = '';
  public merchantNumber? = '';

 
  public BinNumber? = '';
  public MerchantNum? = '';
  public PscuPrinNum? = '';
  public PscuSysNum? = '';
  public CreateBy? = '';
  public UpdateBy? = '';
  public CreateDateTime? = '';
  public UpdateDateTime? = '';


  public createdBy? = '';
  public updatedBy? = '';
  public createDateTime? = '';
  public updateDateTime? = '';
}
export class BinSetupContext {
 
  public BnsId?: number; 
  public BinNumber? = '';
  public AgentNum? = '';
  public MerchantNum? = '';
  public PscuPrinNum? = '';
  public PscuSysNum? = '';
  public CreateBy? = '';
  public UpdateBy? = '';
  public CreateDateTime? = '';
  public UpdateDateTime? = '';
}

export class ProductFiContext {
  public fiId: number;
  public productId: number;

  public fi: FiContext = null;
  public config?: any = {};

  public createdBy? = '';
  public updatedBy? = '';
  public createDateTime? = '';
  public updateDateTime? = '';

  constructor(productId: number, fi: FiContext) {
    if (fi) {
      this.fiId = fi.fiId;
      this.productId = productId;
    }
  }
}


// ACCOUNT

export interface ISecurityQuestion {
  questionId: number;
  text: string;
  answer: string;
  selected: boolean;
}

//UserDetails
export class UserDetailContext {
  public UsrID?: number;
  public FIID?: string; // defined as string to be able to convert to an empty string as needed by UI Grid ( User Admin config Screens)
  public MainframeFIID?: number;
  public Username? = '';
  public FIName? = '';
  public FirstName? = '';
  public LastName? = '';

  public Email? = '';
  public Phone? = '';
  public Phone2? = '';
  public Extension? = '';
  //public Phone2? = '';
  public ProductName? = '' ;
  public Role? = '';
  public PasswordStatus? = '';
  public PrdID?: number;
  // public IsLocked:boolean = false;
  // public IsMFAEnabled:boolean = false;
  // public IsMFALocked:boolean = false;
  // public IsJHAUser:boolean = false;

  constructor() {
    
  }
}

export class LoadFileContentResponse {
  public FileContent?: string = '';
  public Message?: string = '';
}

export class saveFileContent {
  public FilePath: string = '';
  public FileContent: string = '';
  public User: string = '';
}
//Service Hosts
export class ServiceHostContext {
  public HscID?: number;
 // public ContainerHostingName? = '';
  public Name? = '';
  public Description? = '';
  public DcsID?: number;
  public SiteName? = '';
  public Status? = '';
  public ContainerType? = '';
  public ContainerName? = '';
  public ContainerRootDirectory? = '';
  public CtrID?: number;
  public ServerName? = '';
  public ServerIP? = '';
  public AssemblyLocation? = '';
  public ContainerConfigFilePath? = '';
  public LogFilePath? = '';
  public ContainerConfigTemplateId?: number;
  public CfgTplID?:number;
  public TemplateName? = '';
  public TableName? = '';
  public ColumnName? = '';
  public Template? = '';
  public DictKey? = '';
  public DictID?: number;
  public DictValue? = '';
  public DictDotNetDataType? = '';
  public DictDescription? = '';

  
  constructor() {
    
  }
}

////Service Configuration
export class ServiceConfigurationContext {
  public SvcCfgID?: number;
  public SviID?: number;
  public SvcInstanceName? = '';
  public DCSiteFlag? = '';
  public Description? = '';
  public ApplicationModule? = '';
  public MessagingTransformType? = '';
  public MessagingSettingFile? = '';
  public IsoSpecfication? = '';
  public TcpChannelName? = '';
  public TcpServerIP? = '';
  public TcpPort? = '';
  public ServiceChannelName? = '';
  public ServiceURI? = '';
  public ServiceContractType? = '';
  public ServiceType? = '';
  public ServiceChannelName2? = '';
  public ServiceURI2? = '';
  public ServiceChannelName3? = '';
  public ServiceURI3? = '';
  public ServiceConfigure? = '';
  public LogConfigure? = '';
  
  constructor() {
    
  }
}

//Service Hosts
export class ServiceInstanceContext {
  public HscID?: number;
  public SviID?: number;
  public PrdID?: number;
  public ProductName? = '';
  public ServiceHost?= '';
  public TcpServerIP?= '';
  public TcpPort?= '';
  public Status?= '';
  public Command?= '';
  public ReloadAppFile?= '';
  public ApplicationModule?= '';
  public MessagingTransformType?= '';
  public MessagingSettingFile?= '';
  public ServiceInstanceID? = '';
  public ServiceDescription?= '';
  public IsoSpecfication?= '';
  public TcpChannelName?= '';
  public ServiceChannelName?= '';
  public ServiceURI?= '';
  public ServiceContractType?= '';
  public ServiceChannelType?= '';
  public LogFilePath?= '';
  public ServiceChannelName2?= '';
  public ServiceURI2?= '';
  public ServiceChannelName3?= '';
  public ServiceURI3?= '';
  public ServiceConfigTemplateId?= '';
  public LogConfigTemplateId?= '';
  public ServiceVersion?= '';
  public AutoRestart? = '';
  public FINames? = '';
  public isRestartProcess:boolean = false;
  
  constructor() {
    
  }
}
// PRODUCTS

export class ProductContext {
  public productId: number;
  public displayOrder?: number = null;
  public productName = '';
  public productCode ='';
  public shortDesc = '';
  public longDesc = '';
  public featureMenu?: string = '';
  public fullFeatureMenuList?: string = '';

  public role = '';
  public prefix = '';
  public routeName = '';
  public isOffered?: boolean = null;
  public createdBy = '';
  public createDate? = null;
  public updatedBy = '';
  public updateDate? = null;

  public contacts: IContactDetails[];
  public productNotes: IProductVersionNote[];
  public productStats: IProductStats[];


  public contactId: number;
  public contactName = '';
  public contactEmail = '';
  public contactPhone = '';
  public contactType = '';
  public supportNumber = '';
  public versionNumber = '';

  public mainCssClass = '';
  public bigImageCssClass = '';
  public disableCssClass = '';
  public productSelectedCssClass = '';

  constructor() {
    this.contacts = [];
    this.productNotes = [];
    this.productStats = [];
  }
}

export interface IProductStats {
  MonthAndYear: string;
  fiCount: number;
}

export class IProductVersion {
  productId?: number;
  versionId?: number;
  version?: string;
  released?: boolean;
  releaseOrProductionDate?: string;
  createdBy?: string;
  createDate?: string;
  updatedBy?: string;
  updateDate?: string;
  summary?: string;
  note?: string;
  notes?: IProductVersionNote[];
}

export interface IProductVersionNote {
  noteId?: number;
  versionId?: number;
  version?: string;
  note?: string;
  createdBy?: string;
  createDate?: string;
}


// Configs

export interface IConfigItem {
  configId?: number;
  categoryId?: number;
  entityId?: number;
  key: string;
  value: string;
  dataType: string;
  isProductConfig: boolean;
  isRequired?: boolean;
  config_Value_Option: string;
}

export interface IConfigItemBackend {
  PCID: number;
  PrdID: number;
  Config_Key: string;
  Config_Value: string;
  DataType: string;
  IsRequired: boolean;
  CreateBy: string;
  CreateDateTime: string;
  UpdateBy: string;
  UpdateDateTime: string;
  Config_Value_Option: string;
}

export interface IRtpTransactionDetailResponse {
  JxTran: IJXTrnAddEntity;
  PscuTran: IPscuPayXml1441Entity;
  JxTranMod: IJXTrnModEntity;
}

export interface IJXTrnModEntity {
           TxnID: number;
 RtpTxnID: number;
 RequestDateTime: string;
          Req_AccountType: string;
 Req_BatchNum: number;
 Req_SeqNum: number;
 Req_Dlt: string; 
 Req_TrnRcptId: string;
 ResponseDateTime: string;
 Rsp_RsStat: string;
 Erroneous: boolean;
 ErrorMessage: string;
 CreateDateTime: string;
}

export interface IJXTrnAddEntity {
  TxnID: number;
  RtpTxnID: number;
  RequestDateTime: string;
  Req_AccountType: string;
  Req_TrnInfoAmt: number;
  Req_TrnInfoTrnCodeCode: string;
  Req_TrnInfoSrcCode: string;
  Req_TrnInfoDrCr: string;
  Req_TrnInfoGLInterfaceCode: string;
  ResponseDateTime: string;
  Rsp_BatchNum: number;
  Rsp_SeqNum: number;
  Rsp_TrnRcptId: string;
  Rsp_RsStat: string;
  Erroneous: boolean;
  ErrorMessage: string;
  CreateDateTime: string;
}

export interface IPscuPayXml1441Entity {
  TxnID: number;
  RtpTxnID: number;
  RequestDateTime: string;
  ResponseDateTime: string;
  Erroneous: boolean;
  ErrorMessage: string;
  Req_RQID: string;
  Req_APPID: string;
  Req_APPLICATIONID: string;
  Req_REQUESTID: string;
  Req_FUNCTIONID: string;
  Req_CLIENTID: string;
  Req_MRCHNO: string;
  Req_VENDORID: string;
  Req_PYMTSOURCE: string;
  Req_PYMTYPE: string;
  Req_TRANAMT: string;
  Res_RESPONSE: string;
  Res_GUID: string;
  Res_REQUESTORID: string;
  Res_APPLICATIONID: string;
  Res_FUNCTIONID: string;
  Res_STATUSCODE: string;
  Res_EXCEPTION: string;
  Res_AR_E_ACTION_CODE: string;
  Res_AR_H_ADD_ACTION_IND: string;
  Res_AR_A_STAT: string;
  Res_AR_B_MSG_NMBR: string;
  Res_AR_C_SEVERITY: string;
  Res_AR_D_REF_NMBR: string;
  Res_AR_F_AUTH_NMBR: string;
  Res_AR_G_PHONE: string;
  Res_AR_I_TRANSFER_OPT: string;
  Res_AR_J_MSG_TEXT: string;
  CreateDateTime: string
}

// Service & Transaction Activity

export interface IServiceInstance {
  serviceId: string;
  name: string;
  serviceName: string;
}

export interface IProductActivitySearch {
  searchType?: string;
  serviceId?: string;
  ServiceName?: string;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  bin?: string;
  pan?: string;
  fiId?: any
}

export interface IProductRTPActivitySearch {
  SearchType?: string;
  ServiceId?: string;
  SearchStartDate?: moment.Moment;
  SearchEndDate?: moment.Moment;
  Bin?: string;
  Pan?: string;
  FiId?: number;
}

export interface ISearchRTPTxnDetailRequest {
  RtpTxnID: number;
}

export interface IProductActivitySearchResults {
  serviceId: string;
  fileServer: string;
  items: IProductActivity[];
}

export interface IProductActivityRTPSearchResults {
  RtpTxnID: number;
  FIID: number;
  BinNumber: string;
  CardNumberLast4Digit: string;
  MerchantNum: string;
  TapTranEligible: string;
  TapTranIneligibleReason: string;
  CreateDateTime: string;
  LifeCycleComplete: boolean;
  MainframeFIID: boolean;
  Req_Amt: number;
  Req_DrAcctId: number;
  Req_DrAcctType: string;
  Req_DrRtNum: string;
  Rsp_TrnRcptId: string;
  Rsp_RsStat: string;
  RequestDateTime: string;
  ResponseDateTime: string;
  Erroneous: boolean;
  ErrorMessage: string;
  CardNumber: string;
  Id: number;
}

export interface IProductActivity {
  id: number;
  fileName: string;
  text: string;
  timeStamp: string;
}


// Status Report

export interface IStatusReport {
  id: number;
  aba: string;
  value: string;
}


// GENERAL

export interface IContactDetails {
  contactId: number;
  productId: number;
  name: string;
  phone: string;
  email: string;
  contactType: string;
  isPrimary: boolean;
}

//export class UserDetailContext {
//  public UsrID?: number;
//  public FIID?: number;
//  public MainframeFIID?: number;
//  public Username?= '';
//  public FIName?= '';
//  public FirstName?= '';
//  public LastName?= '';

//  public Email?= '';
//  public Phone?= '';
//  public AfterHoursPhone?= '';
//  public ProductAssigned?= '';
//  public Role?= '';
//  constructor() { }
//}

export class RTPDashboardStats {
  public FiCount: number;
  public RTPTransactionCount: number;
}

export class ICardFeeRate {
   RateID: number;
   RateNumber: number;
   RateDescription: string;
   Rate: number;
  //  CreateBy: Date;
  //  CreateByTime: Date;
  //  UpdateBy: Date;
  //  UpdateByTime: Date;
   constructor () {

   }
  
}
export class ICardICA {
  ICAID: number;
  ICA: number;
  ICA_Description: string;
  ICA_Type: string;
  public DictKey? = '';
  public DictID?: number;
  public DictValue? = '';
  public DictDotNetDataType? = '';
  public DictDescription? = '';
  constructor () {
  }
}


export interface ICardFeeRates {
  data:ICardFeeRate[];
}

export interface ICardICAs {
  data:ICardICA[];
}

export class ICardFeeRateUpdateResponse {
  Add_Update: boolean;
  Tran_Type: string;
  Message: string;
}

export class ProductMenuFeature {
  public MenuID: number;
  public CreateBy = '';
  public CreateDateTime = '';
  public GroupName = '';
  public Name = '';
  public Url = '';
  public isGeneric = '';
  constructor() {
  }
}
export interface IProductMenuFeature {
  MenuID: number;
  CreateBy: string;
  CreateDateTime: string;
  GroupName: string;
  Name: string;
  Url: string;
  isGeneric: boolean;
}

export interface IAwardsErrorType {
  ID: string;
  value: string;
}