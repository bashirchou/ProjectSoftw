import {Service} from 'typedi';
import {User} from '@app/classes/User';
import {LoginResponse} from '@app/classes/LoginResponse';

@Service()
export class LogInValidation {

    validateLogin (email: string, password: string, users: Map<string, User>): LoginResponse {
        if (!users.has(email)) return LoginResponse.informationNotValid;
        if ((users.get(email) as User).connected) return LoginResponse.AlreadyConnected;
        if ((users.get(email) as User).password === password) {
            return LoginResponse.Success;
        }
        return LoginResponse.informationNotValid;
    }
}

