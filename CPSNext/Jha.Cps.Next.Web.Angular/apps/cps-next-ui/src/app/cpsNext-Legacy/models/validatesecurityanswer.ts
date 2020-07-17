export interface ValidateSecurityAnswerRequest
{
    UsrID: number;
    SecurityAnswer: string;
}

export interface ValidateSecurityAnswerResponse
{
    ValidAnswer: boolean;
    UserLocked: boolean;
    AttemptsExceeded: boolean;    
}
