export interface IsSecurityTokenValidRequest
{
    Token: string;
    IsResetSecurityQuestion?: boolean;
}

export interface IsSecurityTokenValidResponse
{
    IsRecordExist: boolean;
    UsrId: number;
    IsSecurityQuestionConfigured: boolean;
    UserName: string;
    SeqId: number;
    SecurityAnswer: string;
    SecurityQuestion: string;
    IsFirstTimeLogin: boolean;
    IsTokenExpired: boolean;
    IsResetSecurityQuestion: boolean;
}
