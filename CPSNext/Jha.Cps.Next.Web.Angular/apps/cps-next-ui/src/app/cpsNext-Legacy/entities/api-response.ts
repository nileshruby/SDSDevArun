
export interface IApiResponse {
  statusCode?:number;
  redirectTo?:string;
  data?:any;
  value?:string;
  expiration:Date;
  errorMessages:string[];
  flags: Map<string,boolean>[];
}

export interface IApiResponseBackend {
  StatusCode?:number;
  RedirectTo?:string;
  Data?:any;
  Value?:string;
  Expiration:Date;
  ErrorMessages:string[];
  Flags: Map<string,boolean>[];   
}
export interface IBinResponse {
  Message?:any;
  Resp_BinID: number;
  Tran_Type?:string;
}
export interface IBinSetupResponse {
  Message?:any;
  Tran_Type?:string;
}
export interface IApDeleteResponse {
  Message:string[];
  isDeleted: boolean;
}
export interface IApiResponsePasswordUpdated {
  PasswordUpdated: boolean;
  HistoryRequirementFailed: boolean;
  IsPasswordPartofUserName: boolean;
  Message:string[];
}
export interface IApiResponsePasswordValidate {
  IsAuthenticated: boolean;
}
