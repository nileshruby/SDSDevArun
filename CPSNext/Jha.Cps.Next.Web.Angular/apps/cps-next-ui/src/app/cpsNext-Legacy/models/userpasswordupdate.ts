export interface UserPasswordUpdateRequest
{
    UsrID: number;
    NewPassword: string;
    UserName: string;
}

export interface UserPasswordUpdateResponse
{
    PasswordUpdated: boolean;
    HistoryRequirementFailed: boolean;
    IsPasswordPartofUserName: boolean;
    Message: string;
}
