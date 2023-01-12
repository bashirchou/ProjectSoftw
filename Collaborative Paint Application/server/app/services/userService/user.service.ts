import {Service} from 'typedi';
import {UserPreview} from '@app/classes/UserPreview';
import {User} from '@app/classes/User';
@Service()
export class UserService {

    userCreator (email: string, username:string, password: string, avatarId: number, socketId: string, isHeavyClient: boolean): User {
        return {historicConnexion: [[Date.now().toLocaleString()]], email: email, username: username, password: password, avatarId: avatarId, socketId: socketId,
            connected: true, isHeavyClient: isHeavyClient, listDrawingCollaborated: new Map<number, string[]>(), blockedEmails: []};
    }
    setSocketId (socketId: string, user: User) {
        user.socketId = socketId;
    }
    validatePassword (passeword: string, user: User) {
        if (passeword !== user.password) {
            throw Error('Wrong password...');
        }
    }
    setUsername (newUsername: string, user: User): void {
        user.username = newUsername;
    }
    setAvatarId (avatarId: number, user: User): void {
        user.avatarId = avatarId;
    }
    addDeconexionTime (time: string, user: User) {
        if (user.historicConnexion[user.historicConnexion.length - 1].length !== 1) {
            throw Error('Probleme with time stats..');
        }
        user.historicConnexion[user.historicConnexion.length - 1].push(time);
    }
    addConnexionTime (time: string, user: User) {
        if (user.historicConnexion[user.historicConnexion.length - 1].length !== 2) {
            throw Error('Probleme with time stats..');
        }
        user.historicConnexion.push([time]);
    }
    addDrawingModification (drawingId: number, time: string, user: User) {
        if (!user.listDrawingCollaborated.has(drawingId)) {
            user.listDrawingCollaborated.set(drawingId, [time]);
        } else {
            user.listDrawingCollaborated.get(drawingId)?.push(time);
        }
    }
    removeDrawingCollaboration (drawingId: number, user: User): boolean {
        if (!user.listDrawingCollaborated.has(drawingId)) return false;
        user.listDrawingCollaborated.delete(drawingId);
        return true;
    }
    calculateAverageDurationOfConnexion (user: User) {
        let average = 0;
        for (const time of user.historicConnexion) {
            if (time.length === 1) {
                average += Date.now().valueOf() - new Date(time[0]).valueOf();
            } else {
                average += new Date(time[1]).valueOf() - new Date(time[0]).valueOf();
            }
        }
        average /= user.historicConnexion.length;
        return average;
    }
    getUserPreview (user: User): UserPreview{
        return {username: user.username, email: user.email, connected: user.connected, socketId: user.socketId,
            avatarId: user.avatarId, isHeavyClient: user.isHeavyClient, historicConnexion: user.historicConnexion};
    }
}
