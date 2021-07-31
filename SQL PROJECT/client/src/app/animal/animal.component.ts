import { OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from "@angular/core";
import { Animal } from "../../../../common/tables/Animal";
import { Clinique } from "../../../../common/tables/Clinique";
import {Proprietaire} from "../../../../common/tables/Proprietaire";
import { CommunicationService } from "./../communication.service";

@Component({
  selector: 'app-animal',
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.css']
})
export class AnimalComponent implements OnInit {

  @ViewChild("newNoAnimal") newNoAnimal: ElementRef;
  @ViewChild("newNumberClinic") newNumberClinic: ElementRef;
  @ViewChild("newNumberOwner") newNumberOwner: ElementRef;
  @ViewChild("newName") newName: ElementRef;
  @ViewChild("newType") newType: ElementRef;
  @ViewChild("newSize") newSize: ElementRef;
  @ViewChild("newSpecies") newSpecies: ElementRef;
  @ViewChild("newWeight") newWeight: ElementRef;
  @ViewChild("newDescription") newDescription: ElementRef;
  @ViewChild("newBirth") newBirth: ElementRef;
  @ViewChild("newInscription") newInscription: ElementRef;
  @ViewChild("newVaccinated") newVaccinated: ElementRef;


  public animals: Animal[] = [];
  public cliniques : Clinique[] = []; 
  public proprietaires: Proprietaire[] = [];
  public duplicateError: boolean = false;
  public clinicID:string = "123";
  public ownerID:string = "1";

  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.getAnimals();
    this.getCliniques();
    this.getProprietaires();
  }

  public getAnimals(): void {
    this.communicationService.getAnimals().subscribe((animals:Animal[]) => {
      this.animals = animals;
    });
  }
  public getCliniques(): void {
    this.communicationService.getClinique().subscribe((cliniques:Clinique[]) => {
      this.cliniques = cliniques;
     
    });
  }
  public getProprietaires(): void {
    this.communicationService.getProprietaire().subscribe((proprietaires:Proprietaire[]) => {
      this.proprietaires = proprietaires;
     
    });
  }
  
  // public insertHotel(): void {
  //   const hotel: any = {
  //     hotelnb: this.newHotelNb.nativeElement.innerText,
  //     name: this.newHotelName.nativeElement.innerText,
  //     city: this.newHotelCity.nativeElement.innerText,
  //     notelephone: this.newTelephone.nativeElement.innerText,
  //   };

  //   this.communicationService.insertHotel(hotel).subscribe((res: number) => {
  //     if (res > 0) {
  //       this.communicationService.filter("update");
  //     }
  //     this.refresh();
  //     this.duplicateError = res === -1;
  //   });
  // }
 public updateSelectedClinic(clinicID:any){
  this.clinicID = this.cliniques[clinicID].noclinique; 
 }
 public updateSelectedOwner(ownerID:any){
  this.ownerID = this.proprietaires[ownerID].noproprietaire; 
 }
  public insertAnimal(): void {
    const animal: any = {
      noanimal : this.newNoAnimal.nativeElement.innerText,
      noclinique :this.clinicID,
      noproprietaire : this.ownerID,
      name :  this.newName.nativeElement.innerText,
      type : this.newType.nativeElement.innerText,
      taille : this.newSize.nativeElement.innerText,
      espece : this.newSpecies.nativeElement.innerText,
      poids :  this.newWeight.nativeElement.innerText,
      description : this.newDescription.nativeElement.innerText,
      datenaissance : this.newBirth.nativeElement.innerText,  
      dateinscription :this.newInscription.nativeElement.innerText, 
      estvaccine :  this.newVaccinated.nativeElement.innerText,
    };
  
    this.communicationService.insertAnimal(animal).subscribe((res: number) => {
      if (res > 0) {
        this.communicationService.filter("update");
      }
      this.refresh();
      this.duplicateError = res === -1;
    });
  }

  private refresh() {

    this.getAnimals();
    
    this.newNoAnimal.nativeElement.innerText = "";
    this.newName.nativeElement.innerText = "";
        this.newType.nativeElement.innerText = "";
        this.newSize.nativeElement.innerText = "";
       this.newSpecies.nativeElement.innerText = "";
        this.newWeight.nativeElement.innerText = "";
       this.newDescription.nativeElement.innerText="";
        this.newBirth.nativeElement.innerText=""; 
     this.newInscription.nativeElement.innerText=""; 
      this.newVaccinated.nativeElement.innerText="";
  }

  public deleteHotel(HotelNb: string) {
     this.communicationService.deleteHotel(HotelNb).subscribe((res: any) => {
      // this.refresh();
     });
   }

  public deleteAnimal(animalNb: string) {
    this.communicationService.deleteAnimal(animalNb).subscribe((res: any) => {
      this.refresh();
    });
  }

  public changeName(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].name = editField;
  }

  public changeType(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].type = editField;
  }
  public changeSize(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].taille = editField;
  }

  public changeSpecies(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].espece = editField;
  }

  public changeWeight(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].poids = editField;
  }
  public changeDateBirth(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].datenaissance = editField;
  }
  public changeDescription(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].description = editField;
  }
  public changeDateinscription(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].dateinscription = editField;
  }
  public changeIsVaccinated(event: any, i:number){
    const editField = event.target.textContent;
    this.animals[i].estvaccine = editField;
  }
  public updateAnimal(i: number) {
    this.communicationService.updateAnimal(this.animals[i]).subscribe((res: any) => {
      this.refresh();
    });
  }
}
