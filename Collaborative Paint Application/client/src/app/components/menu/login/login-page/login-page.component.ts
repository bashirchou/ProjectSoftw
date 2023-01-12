import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login-service/login.service';
import { LoginResponse } from '../../../../../../../server/app/classes/LoginResponse'

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
 public email:String;
 public password:String; 

 loginResult: any;
 
  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit() {
  }


  async goMenu() { // POUR LOGIN POUR LINSTANT!!! PEUT PAS LE FAIRE, MAIS C"EST ICI QUI VA NOUS LAISSER RENTRER DANS MENU. 
    this.loginService.validateLogin(this.email, this.password).subscribe(
      result => {
        if (result = LoginResponse.Success) {
          this.router.navigate(['/menu']);
        } // a gerer lorsque infos invalide ou deja connected 
      }
    );
  
  }
  goToMenu(){
    this.router.navigate(['/menu']);
  }

  createNewAccount(): void {
    this.router.navigate(['/create']);
  }
}
