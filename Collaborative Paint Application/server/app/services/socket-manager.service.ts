import * as http from 'http';
import * as io from 'socket.io';
import {Service} from 'typedi';
import {UserManager} from '@app/services/userManagement/user-manager.service';
import {ConversationsManager} from '@app/services/messageManager/conversations-manager.service';
import {Discussion} from '@app/classes/Discussion';
import {User} from '@app/classes/User';
import {Album} from '@app/classes/Album';
import {AlbumManager} from '@app/services/albumManager/album-manager.service';
import {Drawing} from '@app/classes/Drawing';
import {LoginResponse} from '@app/classes/LoginResponse';
import {UserStats} from '@app/classes/UserStats';
import {AccCreateResponse} from '@app/classes/AccCreateResponse';
import {Status} from '@app/classes/Status';
import {AlbumService} from './albumService/album.service';
import {DrawingService} from './drawingService/drawing.service';
import {UserService} from './userService/user.service';
import {MessageService} from './discussionService/message.service';

const IDROOMSTARTINDEX = 11;
@Service()
export class SocketManager {
    sio: io.Server;

    constructor (
        server: http.Server,
        private userManager: UserManager,
        private conversationManager: ConversationsManager,
        private albumManager: AlbumManager,
        private albumService: AlbumService,
        private drawingService: DrawingService,
        private userService: UserService,
        private messageService: MessageService
    ) {
        this.sio = new io.Server(server, {cors: {origin: '*', methods: ['GET', 'POST']}});
    }
    /*
        Les noms des rooms sont messageRoom0 pour la discussion avec l'identifiant 0
        Les noms des rooms sont drawingRoom1 pour le dessin avec l'identifiant 1
        attention ne pas changer on peut recuperer l'identifiant en splitant le string a partir du 11 carachteres
    */


    handleSockets (): void {
        this.sio.on('connection', (socket) => {

            socket.on('validateLogin', async (email, password, isHeavyClient) => {
                const loginResult = await this.userManager.logIn(email, password, socket.id, isHeavyClient);
                if (loginResult === LoginResponse.Success && this.userManager.users.has(email)){
                    const user = this.userManager.users.get(email) as User;
                    const time = Date.now().toLocaleString();
                    this.userManager.setUserSocketId(email, socket.id);
                    this.userManager.addConnexionTime(email, time);
                    // messageRoom0 is the public chat
                    await this.conversationManager.addUserInDiscussion(0, email);
                    socket.join('messageRoom0');
                    socket.to(this.userManager.getUser(email).socketId).emit('loginResult', loginResult, user.username, user.avatarId);
                } else {
                    socket.to(this.userManager.getUser(email).socketId).emit('loginResult', loginResult, '', -1);
                }
            });
            socket.on('getNotificationOfRequestJoinAlbum', (email) => {
                const requestMap = this.albumManager.getAlbumRequest(email);
                for (const albumId of requestMap.keys()) {
                    for (const mail of requestMap.get(albumId) as string[]) {
                        socket.to(this.userManager.getUser(email).socketId).emit('notificationOfRequestJoinAlbum', albumId, mail);
                    }
                }
            });
            socket.on('getUser', (email, password) => {
                try {
                    const user = this.userManager.getUser(email);
                    this.userService.validatePassword(password, user);
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserSucces', user);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserFailure', email, err);
                }
            });
            socket.on('getUserPreview', (email) => {
                try {
                    const user = this.userManager.getUser(email);
                    const userPreview = this.userService.getUserPreview(user);
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserSucces', userPreview);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserFailure', email, err);
                }
            });
            socket.on('getDiscussion', (email, discussionId) => {
                try {
                    const conversation = this.conversationManager.getDiscussion(discussionId);
                    socket.to(this.userManager.getUser(email).socketId).emit('getDiscussionSucces', conversation);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getDiscussionFailure', discussionId, err);
                }
            });
            socket.on('getDrawing', (drawingId, email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    const albumId = this.albumManager.findAlbumWithDrawingId(drawingId);
                    this.albumService.verifyAlbumAcces(email, this.albumManager.getAlbum(albumId));
                    const drawing = this.albumManager.getDrawing(albumId, drawingId);
                    socket.to(this.userManager.getUser(email).socketId).emit('getDrawingSucces', drawing);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getDrawingFailure', drawingId, email, err);
                }
            });

            socket.on('getAlbum', (albumId, email) => {
                try {
                    const album = this.albumManager.getAlbum(albumId);
                    this.albumService.verifyAlbumAcces(email, album);
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumSucces', album);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumFailure', albumId, err);
                }
            });
            socket.on('getAlbumPreview', (albumId, email) => {
                try {
                    const albumPreview = this.albumService.getAlbumPreview(this.albumManager.getAlbum(albumId));
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumSucces', albumPreview);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumFailure', albumId, err);
                }
            });
            socket.on('getAlbumIdListNotAcces', (email: string) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    const listIdAlbum = this.albumManager.getListAlbumNotAcces(email);
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumIdListNotAccesSucces', listIdAlbum);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumIdListNotAccesFailure', email, err);
                }
            });
            socket.on('getAlbumIdListReadAcces', (email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    const albumIdList = this.albumManager.getAlbumIdListAcces(email);
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumIdListReadAccesSucces', albumIdList);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getAlbumIdListReadAccesFailure', email, err);
                }
            });

            socket.on('createUser', async (email, username, password, avatarId, isHeavyClient) => {
                const answer = await this.userManager.createUser(email, username, password, avatarId, socket.id, isHeavyClient);
                socket.to(socket.id).emit('createUserResult', answer);
                if (answer === AccCreateResponse.Success) {
                    await this.conversationManager.addUserInDiscussion(0, email);
                    // add user to public album
                    await this.albumManager.addUserToAlbum(0, email);
                    socket.join('messageRoom0');
                }
            });

            socket.on('changeUsername', (newUsername, email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.userManager.changeUsername(newUsername, email);
                    socket.to(this.userManager.getUser(email).socketId).emit('changeNameSucces', newUsername, email);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changeUsernameFailure', email, newUsername, err);
                }
            });
            socket.on('removeUserAlbumAccess', (albumId, email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.albumManager.removeUserToAlbum(albumId, email);
                    socket.to(this.userManager.getUser(email).socketId).emit('removeUserAlbumAccessSucces', albumId, email);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('removeUserAlbumAccessFailure', albumId, email, err);
                }
            });

            socket.on('changeAvatar', (avatarId, email) => {
                this.userManager.changeAvatar(avatarId, email);
            });
            socket.on('requestAcessToAlbum', (albumId, email) => {
                if (!this.albumManager.albums.has(albumId)) return;
                this.albumManager.requestToJoinAlbum(albumId, email);
                for (const mail of this.albumManager.getAlbum(albumId).userAccess) {
                    const user = this.userManager.getUser(mail);
                    if (user.connected) {
                        // user is connected
                        socket.to(user.socketId).emit('notificationOfRequestJoinAlbum', albumId, email);
                    }
                }
            });
            socket.on('responseToRequestJoinAlbum', (albumId, requestMail, isAllowed) => {
                if (!this.albumManager.albums.has(albumId)) return;
                this.albumManager.responseToRequestToJoinAlbum(albumId, requestMail, isAllowed);
            });
            socket.on('getUserStats', (email) => {
                try {
                    const nbCollaboratedDrawing = this.userManager.getNumberCollaboratedDrawing(email);
                    const nbOwnerDrawing = this.getNumberOfDrawingOwner(email);
                    const nbPrivateAlbumMember = this.albumManager.getNumberPrivateAlbumMember(email);
                    const averageDurationConnection = this.userService.calculateAverageDurationOfConnexion(this.userManager.getUser(email));
                    const historicConnexion = this.userManager.getUser(email).historicConnexion;
                    const historicDrawingModificationMade = (this.userManager.getUser(email) as User).listDrawingCollaborated;
                    const userStats: UserStats = {numberCollaboratedDrawing: nbCollaboratedDrawing, numberDrawingOwner: nbOwnerDrawing,
                        numberPrivateAlbumMember: nbPrivateAlbumMember, averageTimeOfConnection: averageDurationConnection,
                        historicOfConnexion: historicConnexion, historicDrawingModification: historicDrawingModificationMade};
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserStatsResponse', userStats);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('getUserStatsFailure');
                }
            });
            socket.on('leaveDrawingRoom', (drawingId, email) => {
                const albumid = this.albumManager.findAlbumWithDrawingId(drawingId);
                const roomName = 'drawingRoom' + drawingId;
                this.albumManager.removeCollaboratorToDrawing(albumid, drawingId, email);
                const drawingConversationid = this.albumManager.getDrawing(albumid, drawingId)?.discussionId;
                const discussionRoomName = 'messageRoom' + drawingConversationid;
                socket.leave(roomName);
                socket.leave(discussionRoomName);
                this.handleEmptyRoom();
            });
            socket.on('leaveChatRoom', (messageId, email) => {
                const roomName = 'messageRoom' + messageId;
                this.conversationManager.removeUserInDiscussion(messageId, email);
                socket.leave(roomName);
                this.handleEmptyRoom();
            });

            socket.on('manualDisconnect', async (email) => {
                this.deconexionOfClient(email, socket.id);
                this.handleEmptyRoom();
            });

            socket.on('disconnect', async () => {
                const email = this.userManager.emailFromSocket(socket.id);
                this.deconexionOfClient(email, socket.id);
                this.handleEmptyRoom();
            });

            socket.on('addComment', (idAlbum, idDrawing, author, grade, comment, isAnonymous, email) => {
                try {
                    this.albumManager.addCommentToDrawing(idAlbum, idDrawing, author, grade, comment, isAnonymous);
                    socket.to(this.userManager.getUser(email).socketId).emit('addCommentSucces', idAlbum, idDrawing, author, grade, comment, isAnonymous);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('addCommentFailure', idAlbum, idDrawing, author, grade, comment, isAnonymous, err);
                }
            });
            socket.on('createChatroom', async (nameOfDiscussion, email) => {
                const indexConversationId = await this.conversationManager.addConversation(nameOfDiscussion, email);
                if (!this.conversationManager.discussions.has(indexConversationId) || !this.userManager.users.has(email)) return;
                const conversation = this.conversationManager.discussions.get(indexConversationId) as Discussion;
                const roomName = 'messageRoom' + conversation.id;
                socket.join(roomName);
                this.conversationManager.addUserInDiscussion(indexConversationId, email);
                socket.to(this.userManager.getUser(email).socketId).emit('succesJoinningRoom', roomName, conversation);
            });

            socket.on('joinChatroom', (indexConversationId, email) => {
                if (!this.conversationManager.discussions.has(indexConversationId) || !this.userManager.users.has(email)) return;
                const conversation = this.conversationManager.discussions.get(indexConversationId) as Discussion;
                const roomName = 'messageRoom' + conversation.id;
                socket.join(roomName);
                this.conversationManager.addUserInDiscussion(indexConversationId, email);
                socket.to(this.userManager.getUser(email).socketId).emit('succesJoinningRoom', roomName, conversation);
            });

            socket.on('messageToServer', (id, email, messageContent) => {
                try {
                    const user = this.userManager.getUser(email);
                    const message = this.messageService.messageCreator(user.username, messageContent);
                    this.conversationManager.getDiscussion(id).messages.push(message);
                    this.sio.in('messageRoom' + id).emit('messageToClient', message.message, message.author, message.date, id);
                } catch (err) {
                    socket.to(socket.id).emit('messageToServerFailure', id, email, messageContent, err);
                }
            });
            socket.on('changeDrawingName', async (albumId, drawingId, email, newDrawingName) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    if (await this.albumManager.changeDrawingName(albumId, drawingId, email, newDrawingName)) {
                        socket.emit('changeDrawingNameSucces', albumId, drawingId, email, newDrawingName);
                    }
                    socket.to(this.userManager.getUser(email).socketId).emit('changeDrawingNameFailureNotOwner', albumId, drawingId, email, newDrawingName);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changeDrawingNameFailureDrawingDoNotExist', albumId, drawingId, email, newDrawingName, err);
                }
            });

            socket.on('changeDrawingAlbum', async (albumId, drawingId, email, status, newAlbumId, password) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.albumService.verifyAlbumAcces(email, this.albumManager.getAlbum(newAlbumId));
                    const drawing = this.albumManager.getDrawing(albumId, drawingId);
                    // must be owner of drawing to delete
                    await this.albumManager.deleteDrawing(albumId, drawingId, email);
                    this.drawingService.changePassword(email, password, drawing);
                    this.drawingService.changeStatus(email, status, drawing);
                    await this.albumManager.addDrawingThatExistToAlbum(newAlbumId, drawing);
                    socket.to(this.userManager.getUser(email).socketId).emit('changeDrawingAlbumSucces', albumId, drawingId, email, status, newAlbumId);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changeDrawingAlbumFailure', albumId, drawingId, email, status, newAlbumId, err);
                }
            });
            socket.on('deleteDrawing', (albumId: number, drawingId: number, email: string) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.deleteDrawing(albumId, drawingId, email);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('deleteDrawingFailure', albumId, drawingId, email, err);
                }
            });
            socket.on('deleteDiscussion', async (discussionId, email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    await this.conversationManager.deleteConversation(discussionId);
                    socket.to(this.userManager.getUser(email).socketId).emit('deleteDiscussionSucces', discussionId, email);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('deleteDiscussionFailure', discussionId, email, err);
                }
            });
            socket.on('deleteAlbum', async (albumId, email) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    if (await this.deleteAlbum(albumId, email)) {
                        socket.emit('deleteAlbumSucces', albumId, email);
                    }
                    socket.to(this.userManager.getUser(email).socketId).emit('deleteAlbumFailureNotOwner', albumId, email);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('deleteAlbumFailureAlbumOrUserNotExist', albumId, email, err);
                }
            });
            socket.on('createAlbum', (newAlbumName, email) => {
                this.albumManager.addAlbum(newAlbumName, email);
                socket.to(this.userManager.getUser(email).socketId).emit('createAlbumSucces', newAlbumName, email);
            });
            socket.on('changeAlbumName', async (albumId, email, newAlbumName) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    if (await this.albumManager.changeAlbumName(albumId, email, newAlbumName)) {
                        socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameSucces', albumId, email, newAlbumName);
                    }
                    socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameFailureNotAllowed', albumId, email, newAlbumName);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameFailureAlbumNotExist', albumId, email, newAlbumName, err);
                }
            });
            socket.on('changeDescriptionName', async (albumId, email, newAlbumDescription) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    if (await this.albumManager.changeAlbumDescription(albumId, email, newAlbumDescription)) {
                        socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameSucces', albumId, email, newAlbumDescription);
                    }
                    socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameFailureNotAllowed', albumId, email, newAlbumDescription);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changeAlbumNameFailureAlbumNotExist', albumId, email, newAlbumDescription, err);
                }
            });
            socket.on('changedrawingPassword', (albumId, drawingId, email, newPassword) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.albumManager.changeDrawingPassword(albumId, drawingId, email, newPassword);
                    socket.to(this.userManager.getUser(email).socketId).emit('changedrawingPasswordSucces', albumId, drawingId, email, newPassword);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('changedrawingPasswordFailure', albumId, drawingId, email, newPassword, err);
                }
            });


            // colaborative drawing
            /*
                on n'effectue pas les changements d'un dessins en cours sur mongo question de s'assurer
                que les delais de reponses sont courts et que c'est en temps reelle.
            */

            // if drawing is public -> albumId = 0;
            // passwordAlbum only important if drawing protected
            // always verify album acces and drawing acces
            socket.on('createDrawing', async (albumId, email, drawingName, height, length, status, passewordDrawing) => {
                try {
                    this.albumService.verifyAlbumAcces(email, this.albumManager.getAlbum(albumId));
                    this.userManager.verifyValidEmail(email);
                    const date = Date.now().toLocaleString();
                    const [drawing, discussionId] = await this.createNewDrawing(albumId, drawingName, height, length, date, email, status, passewordDrawing) as [Drawing, number];
                    this.userManager.addDrawingModification(email, albumId, drawing.id, date);
                    socket.join('drawingRoom' + drawing.id);
                    socket.join('messageRoom' + discussionId);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('createDrawingFailure', albumId, email, err);
                }
            });
            // password only important if in a protected or private album
            socket.on('joinDrawing', (albumId, drawingId, email, passewordDrawing) => {
                try {
                    this.userManager.verifyValidEmail(email);
                    this.albumService.verifyAlbumAcces(email, this.albumManager.getAlbum(albumId));
                    const drawing = this.albumManager.getDrawing(albumId, drawingId) as Drawing;
                    this.drawingService.verifyPasswordDrawing(email, passewordDrawing, drawing);
                    this.userManager.addDrawingModification(email, albumId, drawingId, Date.now().toLocaleString());
                    this.albumManager.addCollaboratorToDrawing(albumId, drawing.id, email);
                    socket.join('drawingRoom' + drawing.id);
                    socket.join('messageRoom' + drawing.discussionId);
                } catch (err) {
                    socket.to(this.userManager.getUser(email).socketId).emit('joinRoomFailure', albumId, drawingId, email, err);
                }
            });

            socket.on('drawingModification', (albumId, drawingId, elementId, element, mail, password) => {
                try {
                    this.userManager.verifyValidEmail(mail);
                    const drawing = this.albumManager.getDrawing(albumId, drawingId) as Drawing;
                    this.drawingService.verifyPasswordDrawing(mail, password, drawing);
                    if (!this.drawingService.isAllowedToSelect(elementId, mail, drawing) || !drawing?.elements.has(elementId)) return;
                    drawing?.elements.set(elementId, element);
                    socket.to('drawing' + drawingId).emit('newDrawingModification', albumId, drawingId, elementId, element, password);
                } catch (err) {
                    socket.to(this.userManager.getUser(mail).socketId).emit('drawingModificationFailure', albumId, drawingId, elementId, element, password, err);
                }
            });
            socket.on('drawingElementDeleted', (albumId, drawingId, elementId, mail) => {
                try {
                    this.userManager.verifyValidEmail(mail);
                    const drawing = this.albumManager.getDrawing(albumId, drawingId) as Drawing;
                    if (!this.drawingService.isAllowedToSelect(elementId, mail, drawing) || !drawing?.elements.has(elementId)) return;
                    drawing?.elements.delete(elementId);
                    socket.to('drawing' + drawingId).emit('newDrawingElementDeleted', albumId, drawingId, elementId);
                } catch (err) {
                    socket.to(this.userManager.getUser(mail).socketId).emit('drawingElementDeletedFailure', albumId, drawingId, elementId, err);
                }
            });
            // add element to selected map
            socket.on('drawingElementSelection', (albumId, drawingId, elementId, mail) => {
                try {
                    this.userManager.verifyValidEmail(mail);
                    const drawing = this.albumManager.getDrawing(albumId, drawingId) as Drawing;
                    if (!this.drawingService.isAllowedToSelect(elementId, mail, drawing)) {
                        throw Error('unvalid email or element already selected..');
                    }
                    drawing?.selectedElements.set(elementId, mail);
                    socket.to((this.userManager.users.get(mail) as User).socketId).emit('canBeSelected', albumId, drawingId, elementId);
                } catch (err){
                    socket.to(this.userManager.getUser(mail).socketId).emit('drawingElementSelectionFailure', albumId, drawingId, elementId, err);
                }
            });
        });
    }
    deconexionOfClient (email: string, socketId: string) {
        this.conversationManager.removeUserInDiscussion(0, email);
        const discussionRooms = this.conversationManager.getListOfDiscussionActiveMember(email);
        const drawingRooms = this.albumManager.getListOfDrawingActiveDrawingMember(email);
        for (const discussionId of discussionRooms) {
            this.conversationManager.removeUserInDiscussion(discussionId, email);
        }
        for (const drawingId of drawingRooms) {
            this.albumManager.removeCollaboratorToDrawing(this.albumManager.findAlbumWithDrawingId(drawingId), drawingId, email);
        }
        this.userManager.disconnect(socketId, Date.now().toLocaleString());
    }
    handleEmptyRoom () {
        for (const room of this.sio.sockets.adapter.rooms.keys()) {
            if (this.sio.sockets.adapter.rooms.get(room)?.size === 0){
                if (room.startsWith('drawing', 7)){
                    // room has become empty
                    const drawingId = Number(room.substring(IDROOMSTARTINDEX));
                    const albumId = this.albumManager.findAlbumWithDrawingId(drawingId);
                    if (albumId < 0) {
                        throw Error('Drawing not in any album..');
                    }
                    this.albumManager.saveUpdateDrawingOnMongo(albumId, ((this.albumManager.albums.get(albumId) as Album).drawings.get(drawingId)) as Drawing);
                } else if (room.startsWith('message', 7)) {
                    //save message room, message has become empty
                    const messageId = Number(room.substring(IDROOMSTARTINDEX));
                    if (!this.conversationManager.discussions.has(messageId)) {
                        throw Error('Conversation not found..');
                    }
                    this.conversationManager.updateConversationOnMongo(this.conversationManager.discussions.get(messageId) as Discussion);
                }
            }
        }
    }
    getNumberOfDrawingOwner (email:string) {
        const drawingList = this.userManager.getUser(email).listDrawingCollaborated;
        let numberDrawingOwner = 0;
        for (const id of drawingList.keys()) {
            const albumId = this.albumManager.findAlbumWithDrawingId(id);
            if (this.albumManager.getDrawing(albumId, id)?.ownerMail === email) {
                numberDrawingOwner += 1;
            }
        }
        return numberDrawingOwner;
    }
    async deleteDrawing (albumId: number, drawingId: number, email: string){
        await this.albumManager.deleteDrawing(albumId, drawingId, email);
        await this.userManager.updateDrawingCollaboratorAfterDeleteDrawing(drawingId);
    }
    async deleteAlbum (albumId: number, email: string){
        if (albumId < 1) {
            throw Error('Cannot delete the public album..');
        }
        const listDrawingId = this.albumManager.getListOfDrawingIdInAlbum(albumId);
        if (await this.albumManager.deleteAlbum(albumId, email)) {
            for (const id of listDrawingId) {
                this.userManager.updateDrawingCollaboratorAfterDeleteDrawing(id);
            }
            return true;
        }
        return false;
    }
    async createNewDrawing (albumId: number, drawingName: string, height: number, length: number, creationDate: string, ownerMail: string, status: Status, passeword: string){
        const discussionId = await this.conversationManager.addConversation(drawingName, ownerMail);
        return [await this.albumManager.addDrawing(albumId, discussionId, drawingName, height, length, creationDate, ownerMail, status, passeword), discussionId];
    }
}
