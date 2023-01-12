import {Service} from 'typedi';
import {AccCreateResponse} from '@app/classes/AccCreateResponse';
import {User} from '@app/classes/User';
@Service()
export class NewAccountValidation {
    validateNewUser (email: string, username:string, password: string, users: Map<string, User>): number {
        if (!this.validateEmail(email)) return AccCreateResponse.EmailNotValid;
        else if (!this.validateUsername(username)) return AccCreateResponse.UsrNotValid;
        else if (!this.verifyEmailUnique(email, users)) return AccCreateResponse.EmailExists;
        else if (!this.verifyUsernameUnique(username, users)) return AccCreateResponse.UsrExists;
        else if (!this.validatePassword(password)) return AccCreateResponse.PwdNotValid;
        else return AccCreateResponse.Success;
    }
    validateEmail (email: string): boolean {
        const emailRegex = new RegExp('^([a-zA-Z0-9]+@{1}[a-z]+\\.{1}[a-z]+)$');
        return (emailRegex.test(email) && email.length <= 254);
    }

    validateUsername (username: string): boolean {
        const usernameRegex = new RegExp('^([a-zA-Z0-9]+)$');
        return (usernameRegex.test(username) && username.length <= 32 && username.length >= 6);
    }

    verifyEmailUnique (email: string, users: Map<string, User>): boolean {
        return !users.has(email);
    }

    verifyUsernameUnique (username: string, users: Map<string, User>): boolean {
        return !users.has(username);
    }
    validatePassword (password: string): boolean {
        const passwordRegex = new RegExp('^(?=.*?[0-9].*[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$');
        return passwordRegex.test(password);
    }
}
