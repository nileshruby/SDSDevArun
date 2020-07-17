export interface IUserEmailRequest
{
    UserName: string;
    UserEmail: string;
}

export interface IUserEmailResponse
{
    UsrId: number;
    Email: string;
    isUserExists: boolean;
}
