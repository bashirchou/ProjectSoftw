import { Component,OnInit} from '@angular/core';
import { AnimalPK } from '../../../../common/tables/AnimalPK';
import { Traitement } from '../../../../common/tables/Traitement';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-traitement',
  templateUrl: './traitement.component.html',
  styleUrls: ['./traitement.component.css']
})
export class TraitementComponent implements OnInit {
  public animalsPK: AnimalPK[] = [];
  public traitements: Traitement[] = [];
  public duplicateError: boolean = false;
  public invalidAnimalPK: boolean = false;
  public selectedAnimal:AnimalPK= {
    noanimal : "-1",
  }

  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.communicationService.getAnimalPKs().subscribe((animalPK: AnimalPK[]) => {
          this.animalsPK = animalPK;
        
      this.selectedAnimal = this.animalsPK[0];
      this.getTraitements();
    });
  }

  public updateSelectedAnimal(animalPK: any) {
    this.selectedAnimal = this.animalsPK[animalPK];
    this.getTraitements();
  }

  public getTraitements(): void {
    this.communicationService
      .getTraitements(this.selectedAnimal.noanimal)
      .subscribe((traitements: Traitement[]) => {
        this.traitements = traitements;
      });
  }




}
