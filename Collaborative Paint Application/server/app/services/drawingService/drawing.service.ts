import {Comment} from '@app/classes/Comment';
import {Drawing} from '@app/classes/Drawing';
import {PathInfo} from '@app/classes/PathInfo';
import {Status} from '@app/classes/Status';
import {Service} from 'typedi';
@Service()
export class DrawingService {

    drawingCreator (id: number, discussionUniqueid: number, drawingName: string, height: number, length: number, creationDate: string, ownerMail: string, status: Status, password: string): Drawing {
        return {name: drawingName, discussionId: discussionUniqueid, color: 'blanc',
            size: [length, height], nextElementNumber: 0, selectedElements: new Map<number, string>(), elements: new Map<number, PathInfo>(),
            collaboratorMails: [ownerMail], creationDate: creationDate, ownerMail: ownerMail, id: id, password: password, status: status, comments: []};
    }
    verifyPasswordDrawing (email: string, passeword: string, drawing: Drawing) {
        if (email !== drawing.ownerMail && drawing.status === Status.Protected && passeword !== drawing.password) {
            throw Error('Wrong password');
        }
        return true;
    }
    addSelectedItem (itemId: number, selectedByUser: string, drawing: Drawing) {
        if (drawing.selectedElements.has(itemId)) return;
        drawing.selectedElements.set(itemId, selectedByUser);
    }
    removeSelectedItem (itemId: number, drawing: Drawing): void {
        if (drawing.selectedElements.has(itemId)) return;
        drawing.selectedElements.delete(itemId);
    }
    isAllowedToSelect (itemId: number, selectedByUser: string, drawing: Drawing): boolean {
        if (!drawing.selectedElements.has(itemId)) return true;
        if (drawing.selectedElements.get(itemId) === selectedByUser) return true;
        return false;
    }
    addCollaborator (userMail: string, drawing: Drawing): void {
        if (this.findCollaboratorIndex(userMail, drawing) >= 0) return;
        drawing.collaboratorMails.push(userMail);
    }
    findCollaboratorIndex (userMail: string, drawing: Drawing) {
        for (let index = 0; index < drawing.collaboratorMails.length; index++){
            if (userMail === drawing.collaboratorMails[index]) {
                return index;
            }
        }
        return -1;
    }
    removeCollaborator (userMail: string, drawing: Drawing): void {
        const index = this.findCollaboratorIndex(userMail, drawing);
        if (index < 0) return;
        drawing.collaboratorMails.splice(index, 1);
    }

    changeOwner (userMail: string, drawing: Drawing): void {
        drawing.ownerMail = userMail;
    }

    changeName (name: string, userMail: string, drawing: Drawing): boolean {
        if (userMail === drawing.ownerMail) {
            drawing.name = name;
            return true;
        }
        return false;
    }
    addComment (comment: Comment, drawing: Drawing) {
        drawing.comments.push(comment);
    }
    changePassword (email: string, newPassword: string, drawing: Drawing) {
        if (email !== drawing.ownerMail) {
            throw Error('Only owner can change the password..');
        }
        drawing.password = newPassword;
    }
    changeStatus (email: string, newStatus: Status, drawing: Drawing) {
        if (email !== drawing.ownerMail) {
            throw Error('Only owner can change the visibility of drawing..');
        }
        drawing.status = newStatus;
    }

}
