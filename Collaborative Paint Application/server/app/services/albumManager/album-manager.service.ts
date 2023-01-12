import {Album} from '../../classes/Album';
import {Service} from 'typedi';
import {Status} from '../../classes/Status';
import {DatabaseService} from '@app/services/database.service';
import {Drawing} from '@app/classes/Drawing';
import {AlbumService} from '../albumService/album.service';
import {DrawingService} from '../drawingService/drawing.service';
import {CommentService} from '../commentService/comment.service';
@Service()
export class AlbumManager {
    albums: Map<number, Album>;// Key is id
    constructor (private database: DatabaseService, private albumService: AlbumService, private drawingService: DrawingService, private commentService: CommentService) {
        this.albums = new Map();
    }

    async populateFromDB () {
        for (const album of await this.database.getAllAlbums()) {
            this.albums.set(album.id, album);
        }
    }
    getDrawing (albumId: number, drawingId: number) {
        const album = this.getAlbum(albumId);
        if (!album.drawings.has(albumId)) {
            throw Error('drawing specified doesn\'t exist');
        }
        return album.drawings.get(drawingId) as Drawing;
    }
    getAlbum (albumId: number) {
        if (!this.albums.has(albumId)) {
            throw Error('Album does not exist');
        }
        return this.albums.get(albumId) as Album;
    }

    async addAlbum (name: string, creatorMail: string) {
        const id = await this.database.getNextDrawingId();
        const album = this.albumService.albumCreater(id, name, creatorMail);
        this.albums.set(id, album);
        return await this.database.addAlbum(album);
    }

    async deleteAlbum (id: number, userMail: string): Promise<boolean> {
        const album = this.getAlbum(id);
        if (userMail === album.ownerMail) {
            this.albums.delete(id);
            await this.database.deleteAlbum(id);
            return true;
        }
        return false;
    }
    async requestToJoinAlbum (idAlbum: number, mail: string) {
        const album = this.getAlbum(idAlbum);
        if (this.albumService.addUserRequestJoin(mail, album)) {
            await this.database.addUserRequestJoinAlbum(idAlbum, mail);
        }
    }
    async responseToRequestToJoinAlbum (idAlbum: number, mail: string, isAllowed: boolean) {
        if (this.albumService.userRequestResponseJoinAlbum(mail, isAllowed, this.getAlbum(idAlbum))) {
            await this.database.updateAlbum(this.getAlbum(idAlbum));
        }
    }

    async addUserToAlbum (albumId: number, mail: string) {
        const album = this.getAlbum(albumId) as Album;
        if (this.albumService.addUserAcces(mail, album)) {
            await this.database.updateAlbum(this.getAlbum(albumId));
        }
    }
    async removeUserToAlbum (albumId: number, email: string) {
        if (albumId < 1) {
            throw Error('Cannot leave public album');
        }
        if (this.albumService.removeUserAcces(email, this.getAlbum(albumId))) {
            await this.database.updateAlbum(this.getAlbum(albumId));
        }
    }
    async addDrawing (albumId: number, discussionId: number, drawingName: string, height: number, length: number, creationDate: string, ownerMail: string, status: Status, passeword: string) {

        const idDrawing = await this.database.getNextDrawingId();
        const drawing = this.drawingService.drawingCreator(idDrawing, discussionId, drawingName, height, length, creationDate, ownerMail, status, passeword);
        this.getAlbum(albumId).drawings.set(idDrawing, drawing);
        // add to mongo
        await this.database.updateOrAddDrawing(albumId, drawing);
        return drawing;
    }
    async addDrawingThatExistToAlbum (albumId: number, drawing: Drawing) {
        this.getAlbum(albumId).drawings.set(drawing.id, drawing);
        // add to mongo
        await this.database.updateOrAddDrawing(albumId, drawing);
        return drawing;
    }
    findAlbumWithDrawingId (drawingId: number): number {
        for (const id of this.albums.keys()) {
            if (this.albums.get(id)?.drawings.has(drawingId)) return id;
        }
        return -1;
    }
    async saveUpdateAlbumOnMongo (album: Album) {
        await this.database.updateAlbum(album);
    }
    async saveUpdateDrawingOnMongo (albumId: number, drawing: Drawing) {
        await this.database.updateOrAddDrawing(albumId, drawing);
    }
    getAlbumRequest (mail: string) {
        const requestMap = new Map<number, string[]>();
        for (const album of this.albums.values()) {
            if (mail in album.userAccess) {
                requestMap.set(album.id, album.userRequestJoin);
            }
        }
        return requestMap;
    }
    async addCommentToDrawing (idAlbum: number, idDrawing: number, author: string, grade: number, comment: string, isAnonymous: boolean) {
        const newComment = this.commentService.commentCreator(author, grade, comment, isAnonymous);
        // adding it on server
        this.drawingService.addComment(newComment, this.getDrawing(idAlbum, idDrawing));
        // update on mongo
        return await this.database.updateAlbum(this.getAlbum(idAlbum));
    }
    getNumberPrivateAlbumMember (email: string) {
        let numberAlbumMember = 0;
        for (const album of this.albums.values()) {
            if (album.id !== 0 && this.albumService.isMember(email, album)) {
                numberAlbumMember += 1;
            }
        }
        return numberAlbumMember;
    }
    async addCollaboratorToDrawing (albumId: number, drawingId: number, email: string) {
        this.drawingService.addCollaborator(email, this.getDrawing(albumId, drawingId));
        return await this.database.updateOrAddDrawing(albumId, this.getDrawing(albumId, drawingId) as Drawing);
    }
    async removeCollaboratorToDrawing (albumId: number, drawingId: number, email: string) {
        this.drawingService.removeCollaborator(email, this.getDrawing(albumId, drawingId));
        return await this.database.updateOrAddDrawing(albumId, this.getDrawing(albumId, drawingId) as Drawing);
    }
    async deleteDrawing (albumId: number, drawingId: number, email: string) {
        this.albumService.deleteDrawing(email, drawingId, this.getAlbum(albumId));
        return await this.database.updateAlbum(this.albums.get(albumId) as Album);
    }
    async changeDrawingName (albumId: number, drawingId: number, email: string, newDrawingName: string) {
        if (this.drawingService.changeName(newDrawingName, email, (this.getDrawing(albumId, drawingId) as Drawing))) {
            await this.database.updateOrAddDrawing(albumId, this.getDrawing(albumId, drawingId) as Drawing);
            return true;
        }
        return false;
    }
    async changeDrawingPassword (albumId: number, drawingId: number, email: string, newDrawingPassword: string) {
        this.drawingService.changePassword(email, newDrawingPassword, (this.getDrawing(albumId, drawingId) as Drawing));
        await this.database.updateOrAddDrawing(albumId, this.getDrawing(albumId, drawingId) as Drawing);
    }

    getListOfDrawingIdInAlbum (albumId: number) {
        return this.albumService.getListOfDrawingId(this.getAlbum(albumId));
    }
    async changeAlbumName (albumId: number, email: string, newName: string) {
        if (this.albumService.changeName(newName, email, this.getAlbum(albumId))) {
            await this.database.updateAlbum(this.getAlbum(albumId));
            return true;
        }
        return false;
    }
    async changeAlbumDescription (albumId: number, email: string, description: string) {
        if (this.albumService.changeDescription(description, email, this.getAlbum(albumId))) {
            await this.database.updateAlbum(this.getAlbum(albumId));
            return true;
        }
        return false;
    }
    getListOfDrawingActiveDrawingMember (email: string) {
        const listDrawingId = [];
        for (const album of this.albums.values()) {
            for (const drawing of album.drawings.values()) {
                if (email in drawing.collaboratorMails.keys()) {
                    listDrawingId.push(drawing.id);
                }
            }
        }
        return listDrawingId;
    }
    getListAlbumNotAcces (email: string) {
        const listAlbumId = [];
        for (const album of this.albums.values()) {
            if (album.id !== 0 && !this.albumService.isMember(email, album)) {
                listAlbumId.push(album.id);
            }
        }
        return listAlbumId;
    }
    getAlbumIdListAcces (email: string) {
        const albumIdList = [];
        for (const album of this.albums.values()) {
            if (album.id === 0 || this.albumService.isMember(email, album)) {
                albumIdList.push(album.id);
            }
        }
        return albumIdList;
    }

}
