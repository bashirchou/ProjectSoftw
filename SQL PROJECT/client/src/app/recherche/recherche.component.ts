import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Animal } from '../../../../common/tables/Animal';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-recherche',
  templateUrl: './recherche.component.html',
  styleUrls: ['./recherche.component.css']
})
export class RechercheComponent implements OnInit {
  @ViewChild("name") name: ElementRef;
  public animals: Animal[] = [];
  public animalName:string;
  public duplicateError: boolean = false;
  public invalidHotelPK: boolean = false;

 
  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
      this.animalName = "placeholder";
  }

  public getAnimalsByName(): void {
    this.communicationService
      .getAnimalsByName(this.animalName)
      .subscribe((animals: Animal[]) => {
        this.animals = animals;
      });
  }
  
  public updateAnimalName() {
    this.animalName = (<HTMLInputElement>document.getElementById("name")).value;
 
   
    this.refresh();
  }

  private refresh() {
    this.getAnimalsByName();
  }
}
