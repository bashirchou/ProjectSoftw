import {Service} from 'typedi';
import {AlbumPreview} from '@app/classes/AlbumPreview';
import {Drawing} from '@app/classes/Drawing';
import {Album} from '@app/classes/Album';
@Service()
export class AlbumService {

    albumCreater (uniqueId: number, nameAlbum: string, creatorMail: string): Album {
        return {id: uniqueId, name: nameAlbum, ownerMail: creatorMail, userAccess: [creatorMail], description: '', drawings: new Map<number, Drawing>(), userRequestJoin: []};
    }
    verifyAlbumAcces (email: string, album: Album) {
        if (album.id !== 0 && !(email in album.userAccess)) {
            throw Error('Acces rejected, not a member of this album..');
        }
    }

    findIndexUserRequest (mail: string, album: Album): number {
        for (let index = 0; index < album.userRequestJoin.length; index++) {
            if (mail === album.userRequestJoin[index]) return index;
        }
        return -1;
    }
    findIndexUserAcess (mail: string, album: Album): number {
        for (let index = 0; index < album.userAccess.length; index++) {
            if (mail === album.userAccess[index]) return index;
        }
        return -1;
    }
    hasAPendingRequest (mail: string, album: Album): boolean {
        for (const email of album.userRequestJoin) {
            if (email === mail) {
                return true;
            }
        }
        return false;
    }
    addUserRequestJoin (mail: string, album: Album): boolean{
        if (this.hasAPendingRequest(mail, album)) return false;
        album.userRequestJoin.push(mail);
        return true;
    }

    userRequestResponseJoinAlbum (mail: string, isAllowed: boolean, album: Album): boolean {
        const index = this.findIndexUserRequest(mail, album);
        if (index < 0) return false;
        album.userRequestJoin.splice(index, 1);
        if (isAllowed) {
            album.userAccess.push(mail);
            return true;
        }
        return false;
    }

    changeName (name:string, userMail: string, album: Album): boolean {
        if (userMail === album.ownerMail) {
            album.name = name;
            return true;
        }
        return false;
    }

    changeDescription (description:string, userMail: string, album: Album): boolean {
        if (userMail === album.ownerMail) {
            album.description = description;
            return true;
        }
        return false;
    }
    addUserAcces (mail: string, album: Album): boolean {
        this.verifyAlbumAcces(mail, album);
        album.userAccess.push(mail);
        return true;
    }
    removeUserAcces (email: string, album: Album) {
        if (email === album.ownerMail) return false;
        const index = this.findIndexUserAcess(email, album);
        if (index < 0) return false;
        for (const drawing of album.drawings.values()) {
            if (drawing.ownerMail === email) {
                drawing.ownerMail = album.ownerMail;
            }
        }
        album.userAccess.splice(index, 1);
        return true;
    }
    isMember (email: string, album: Album) {
        for (const mail of album.userAccess) {
            if (email === mail) return true;
        }
        return false;
    }
    deleteDrawing (email: string, drawingId: number, album: Album) {
        if (!album.drawings.has(drawingId) || email !== album.drawings.get(drawingId)?.ownerMail) {
            throw Error('enable to delete drawing with id : ' + drawingId);
        }
        album.drawings.delete(drawingId);
    }
    getListOfDrawingId (album: Album) {
        const list = [];
        for (const id of album.drawings.keys()) {
            list.push(id);
        }
        return list;
    }
    getAlbumPreview (album: Album) :AlbumPreview {
        return {id: album.id, name: album.name, description: album.description, ownerMail: album.ownerMail};
    }
}

