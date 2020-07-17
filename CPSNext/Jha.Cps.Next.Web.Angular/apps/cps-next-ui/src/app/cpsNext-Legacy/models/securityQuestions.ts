export interface ISecurityQuestionRequest
{
    SeqId?: Number;
}

export interface ISecurityQuestionResponse
{
    QuestionId: Number;
    Question: String;
}

export interface ISecurityQuestionResponses extends Array<ISecurityQuestionResponse>{}
