import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  email:string;
  username: string;
  password: string;
  avatarId: number;

  constructor() {
    this.email = "";
    this.username = "";
    this.password = "";
    this.avatarId = 0;
  }

}
