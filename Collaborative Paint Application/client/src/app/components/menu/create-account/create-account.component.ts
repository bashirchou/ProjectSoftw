import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateAccountService } from 'src/app/services/create-account/create-account.service';
import { AccCreateResponse } from '../../../../../../server/app/classes/AccCreateResponse';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {

  email: string;
  username: string;
  password: string;
  avatarId: number;

  avatars: Array<any> = [
    {value: 1},
    {value: 2},
    {value: 3},
    {value: 4},
    {value: 5},
    {value: 6}
  ];

  constructor(private router: Router, private createAccService: CreateAccountService) { }

  ngOnInit() {
  }

  goBackToLogin(): void {
    this.router.navigate([''])
  }

  createAccount(): void {
    this.createAccService.createAccount(this.email, this.username, this.password, this.avatarId).subscribe(
      result => {
        if (result = AccCreateResponse.Success) {
          this.router.navigate(['menu']);
        } // a gerer erreurs plus tard
      }
    )
  }

}
