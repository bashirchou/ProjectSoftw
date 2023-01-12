import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from '../socket-service.service';
import { UserService } from '../user-service/user.service';

@Injectable({
  providedIn: 'root'
})
export class CreateAccountService {

  constructor(private socketManager: SocketService, private User: UserService) {
  }

  createAccount(email: string, username: string, password: string, avatarId: number): Observable<any> {
    this.User.email = email;
    this.User.username = username;
    this.User.password = password;
    this.User.avatarId = avatarId;
    return this.socketManager.createAccount(this.User);
  }
}

