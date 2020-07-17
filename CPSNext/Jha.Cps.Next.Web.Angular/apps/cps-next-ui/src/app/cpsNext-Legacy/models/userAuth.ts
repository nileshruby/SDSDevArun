export interface UserAuthRequest
{
    Username: string;
    Password: string;
    SecurityAnswer: string;
}

export interface UserAuthResponse
{
    UsrID: number;
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
    LoginFailedAttempt: Number;
}
