import {Service} from 'typedi';
import {User} from '@app/classes/User';
import {NewAccountValidation} from '@app/services/userManagement/new-account-validation.service';
import {AccCreateResponse} from '@app/classes/AccCreateResponse';
import {LogInValidation} from '@app/services/userManagement/login-validation.service';
import {DatabaseService} from '@app/services/database.service';
import {LoginResponse} from '@app/classes/LoginResponse';
import {UserService} from '../userService/user.service';

@Service()
export class UserManager {
    users: Map<string, User>; // email and User
    constructor (private newAccountValidation: NewAccountValidation, private loginValidation: LogInValidation, private database: DatabaseService, private userService: UserService) {
        this.users = new Map<string, User>();
    }

    async populateFromDB () : Promise<void> {
        for (const user of await this.database.getAllProfiles()) {
            this.users.set(user.email, user);
        }
    }
    setUserSocketId (email: string, socket: string) {
        this.userService.setSocketId(socket, this.getUser(email));
    }
    verifyValidEmail (email: string) {
        if (!this.users.has(email)) {
            throw Error('user not registered...');
        }
        return true;
    }
    getUser (mail: string) {
        this.verifyValidEmail(mail);
        return this.users.get(mail) as User;
    }

    async createUser (email: string, username:string, password: string, avatarId: number, socketId: string, isHeavyClient: boolean): Promise<AccCreateResponse> {
        const userCreationResult = this.newAccountValidation.validateNewUser(email, username, password, this.users);
        if (userCreationResult === AccCreateResponse.Success) {
            const user = this.userService.userCreator(email, username, password, avatarId, socketId, isHeavyClient);
            this.users.set(email, user);
            await this.database.addProfile(user);
        }
        return userCreationResult;
    }

    async logIn (email: string, password: string, socketId: string, isHeavyClient: boolean): Promise<LoginResponse> {
        const loginResponse = this.loginValidation.validateLogin(email, password, this.users);
        if (loginResponse === LoginResponse.Success) {
            (this.users.get(email) as User).connected = true;
            (this.users.get(email) as User).socketId = socketId;
            (this.users.get(email) as User).isHeavyClient = isHeavyClient;
            await this.database.updateProfile(this.users.get(email) as User);
        }
        return loginResponse;
    }

    async disconnect (socketId: string, time: string): Promise<void> {
        const email = this.emailFromSocket(socketId);
        if (this.users.has(email)) {
            (this.users.get(email) as User).connected = false;
            this.userService.addDeconexionTime(time, (this.users.get(email) as User));
            await this.database.updateProfile(this.users.get(email) as User);
        }
    }

    emailFromSocket (socketId: string): string {
        for (const [email, user] of this.users) {
            if (user.socketId === socketId) {
                return email;
            }
        }
        return '';
    }

    async changeUsername (newUsername: string, email: string): Promise<boolean> {
        if (!this.newAccountValidation.validateUsername(newUsername)) return false;
        if (!this.newAccountValidation.verifyUsernameUnique(newUsername, this.users)) return false;
        if (!this.users.has(email)) return false;
        this.userService.setUsername(newUsername, (this.users.get(email) as User));
        await this.database.updateProfile(this.users.get(email) as User);
        return true;
    }
    getNumberCollaboratedDrawing (email: string) {
        if (!this.users.has(email)) {
            throw Error('No user has this email...');
        }
        return (this.users.get(email) as User).listDrawingCollaborated.size;
    }

    async changeAvatar (avatarId: number, email: string): Promise<boolean> {
        if (!this.users.has(email)) return false;
        this.userService.setAvatarId(avatarId, (this.users.get(email) as User));
        await this.database.updateProfile(this.users.get(email) as User);
        return true;
    }
    async addConnexionTime (email: string, time: string) {
        this.userService.addConnexionTime(time, this.getUser(email));
        return await this.database.updateProfile(this.getUser(email));
    }
    async addDrawingModification (mail: string, albumId: number, drawingId: number, time: string) {
        this.userService.addDrawingModification(drawingId, time, (this.getUser(mail) as User));
        return await this.database.updateProfile(this.getUser(mail));
    }
    async updateDrawingCollaboratorAfterDeleteDrawing (drawingId: number) {
        for (const user of this.users.values()) {
            if (this.userService.removeDrawingCollaboration(drawingId, user)) {
                await this.database.updateProfile(user);
            }
        }
    }

}
