export interface IUser {
    Id: number;
    LoginName: string;
    Title: string;
    Email?: string;
    IsSiteAdmin: boolean;
    UserPrincipalName: string;
}