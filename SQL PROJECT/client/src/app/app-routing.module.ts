import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


import { AnimalComponent } from "./animal/animal.component";
import { TraitementComponent } from "./traitement/traitement.component";
import { FactureComponent } from "./facture/facture.component";
import{RechercheComponent} from "./recherche/recherche.component";
const routes: Routes = [
  { path: "animals", component: AnimalComponent },
  { path: "traitements", component: TraitementComponent },
  { path: "factures", component: FactureComponent },
  { path: "recherches", component: RechercheComponent }
];
@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }