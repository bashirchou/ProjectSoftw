import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { PathInfo } from '../../../../common/communication/PathInfo';
import { UserService } from './user-service/user.service';


export interface Message {
  user: string;
  message: string;
  date: string
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket = io('http://localhost:3000');
  
  constructor() {
    this.configureBaseSocketFeatures();
  }

 configureBaseSocketFeatures() {
  this.socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('connected!');
  });
  this.socket.on('createUserResult', (result: any) => {
    // eslint-disable-next-line no-console
    console.log(result);
  });
  this.socket.on('loginResult', (result: any) => {
    // eslint-disable-next-line no-console
    console.log(result);
  });
  this.socket.on('notificationOfRequestJoinAlbum', (albumId: number, email: string) => {
    // envoie une demande d'acces a un album de la part de email
  });
  this.socket.on('errorAddingComment', (idAlbum, idDrawing, author, grade, comment, isAnonymous, err) => {
    // erreur dans l'ajout d'un commentaire, vous pouvez informer le client
  });
  this.socket.on('succesJoinningRoom', (roomName, conversation) => {
    // le client a reussi a joindre le chatRoom
    // l'historique des messages se trouve dans conversation
  });
  this.socket.on('messageToClient', ( message: string, author: string, date: string, chatName: string) => {
    // le client recoit un nouveau message dans la room chatName
  });
  this.socket.on('joinRoomFailure', (albumId: number, drawingId: number, email: string) => {
    // le client n'a pas pu acceder a la room, avertir le client
  });
  this.socket.on('newDrawingModification', (albumId: number, drawingId: number, elementId: number, element: PathInfo) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid a ete modifie, element est le nouvelle element
  });
  this.socket.on('drawingModificationFailure', (albumId: number, drawingId: number, elementId: number, element: PathInfo) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid n'a pas ete modifie avec succes, informer le client
  });

  this.socket.on('newDrawingElementDeleted', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid a ete supprimer avec succes
  });
  this.socket.on('drawingElementDeletedFailure', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid n'a pas ete supprimer avec succes, informer le client
  });
  this.socket.on('newDrawingElementAdded', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid a ete ajouter avec succes
  });
  this.socket.on('drawingElementAddedFailure', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid n'a pas ete ajouter avec succes, informer le client
  });

  this.socket.on('canBeSelected', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid a ete selectionner avec succes
  });
  this.socket.on('drawingElementSelectionFailure', (albumId: number, drawingId: number, elementId: number) => {
    //dessin colaboratif
    // l'elementId du dessinId de l'albumid n'a pas ete selectionner avec succes, informer le client
  });

  this.socket.on('disconnect', () => {
    console.log('disconnected');
  });
  }

  createAccount(User: UserService): Observable<any> {
    this.socket.emit('createUser', User.email, User.username, User.password, User.avatarId, true);
    return new Observable<any>(observer => {
      this.socket.on('createUserResult', (result: any) => observer.next(result));
    });
  }

  validateLogin(email:String, password:String): Observable<any> {
    this.socket.emit('validateLogin', email, password);
    return new Observable<any>(observer => {
      this.socket.on('loginResult', (result: any) => observer.next(result));
    });
  }
  changeUserName(email:String, newUserName :String) {
    this.socket.emit('changeUsername',newUserName, email);
  }


}