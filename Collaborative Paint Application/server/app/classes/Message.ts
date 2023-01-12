export interface Message{
    message: string;
    author: string; // username
    date: string;
    deletedByEmails: string[];
    deletedGlobally: boolean;
}
