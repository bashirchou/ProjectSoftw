import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketService } from '../socket-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  constructor(private socketManager: SocketService) { }

  validateLogin(email:String, password:String): Observable<any> {
    return this.socketManager.validateLogin(email, password);
  }
}
