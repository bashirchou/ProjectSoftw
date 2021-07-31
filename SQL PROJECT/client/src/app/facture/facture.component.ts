import { Component, OnInit} from '@angular/core';
import { AnimalPK } from '../../../../common/tables/AnimalPK';
import { Facture } from '../../../../common/tables/Facture';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.css']
})
export class FactureComponent implements OnInit {


  public animalPK: AnimalPK[] = [];
  public factures: Facture[] = [];
  public duplicateError: boolean = false;
  public invalidHotelPK: boolean = false;
  public selectedAnimal: AnimalPK = {
    noanimal: "-1",
  };

  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.communicationService.getAnimalPKs().subscribe((animalPK: AnimalPK[]) => {
      this.animalPK = animalPK;
      this.selectedAnimal = this.animalPK[0];
      this.getFactures();
    });
  }

  public updateSelectedAnimal(animalID: any) {
    this.selectedAnimal = this.animalPK[animalID];
    this.getFactures();
    this.refresh();
  }

  public getFactures(): void {
    this.communicationService
      .getFactures(this.selectedAnimal.noanimal)
      .subscribe((factures: Facture[]) => {
        this.factures = factures;
      });
  }

  private refresh() {
    this.getFactures();
  }

  

  }

