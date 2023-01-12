import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAccountComponent } from '../menu/create-account/create-account.component';
import { LoginPageComponent } from '../menu/login/login-page/login-page.component';
import { NavigationMenuComponent } from '../menu/navigation-menu.component';
import { ViewComponent } from '../view/view.component';

export const routes: Routes = [
    { path: '', component: LoginPageComponent},
    { path: 'create', component: CreateAccountComponent},
    { path: 'menu', component: NavigationMenuComponent },
    { path: 'drawing', component: ViewComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
