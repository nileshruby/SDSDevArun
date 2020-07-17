export interface IUserAuthNRequest
{
    Username: String;
    Password: String;
    SecurityAnswer: String;
}

export interface IUserAuthNResponse
{
    UsrID: Number;
    IsAuthenticated: Boolean;
    Email: String;
    Phone: String;
    Username: String;
    SecurityAnswer: String;
    PasswordStatus: String;
    IsLocked: Boolean;
    IsMFAEnabled: Boolean;
    IsMFALocked: Boolean;
    IsSysAdmin: Boolean;
    LoginFailedAttempt: number;
}
