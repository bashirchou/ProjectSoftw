import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
// tslint:disable-next-line:ordered-imports
import { of, Observable, Subject } from "rxjs";
import { catchError } from "rxjs/operators";

import { Animal } from "../../../common/tables/Animal";
import { Clinique } from "../../../common/tables/Clinique";
import { AnimalPK } from "../../../common/tables/AnimalPK";
import { Proprietaire } from "../../../common/tables/Proprietaire";
import { Traitement } from "../../../common/tables/Traitement";
import { Facture } from "../../../common/tables/Facture";

@Injectable()
export class CommunicationService {
  private readonly BASE_URL: string = "http://localhost:3000/database";
  public constructor(private http: HttpClient) {}

  private _listners: any = new Subject<any>();

  public listen(): Observable<any> {
    return this._listners.asObservable();
  }

  public filter(filterBy: string): void {
    this._listners.next(filterBy);
  }

  
  public getAnimals(): Observable<Animal[]> {
    return this.http
      .get<Animal[]>(this.BASE_URL + "/animals")
      .pipe(catchError(this.handleError<Animal[]>("getAnimals")));
    
  }


public getClinique(): Observable<Clinique[]> {
  return this.http
    .get<Clinique[]>(this.BASE_URL + "/cliniques")
    .pipe(catchError(this.handleError<Clinique[]>("getClinique")));
}
public getProprietaire(): Observable<Proprietaire[]> {
  return this.http
    .get<Proprietaire[]>(this.BASE_URL + "/proprietaires")
    .pipe(catchError(this.handleError<Proprietaire[]>("getProprietaire")));
}

 
  public insertAnimal(animal: Animal): Observable<number> {
    return this.http
      .post<number>(this.BASE_URL + "/animals/insert", animal)
      .pipe(catchError(this.handleError<number>("insertAnimal")));
  }

 
  public updateAnimal(animal: Animal): Observable<number> {
    return this.http
      .put<number>(this.BASE_URL + "/animals/update", animal)
      .pipe(catchError(this.handleError<number>("updateAnimal")));
  }

  public deleteHotel(hotelNb: string): Observable<number> {
    return this.http
      .post<number>(this.BASE_URL + "/hotels/delete/" + hotelNb, {})
      .pipe(catchError(this.handleError<number>("deleteHotel")));
  }
  public deleteAnimal(noanimal: string): Observable<number> {
    return this.http
      .post<number>(this.BASE_URL + "/animals/delete/" + noanimal, {})
      .pipe(catchError(this.handleError<number>("deleteAnimal")));
  }

 
  public getAnimalPKs(): Observable<AnimalPK[]> {
    return this.http
      .get<AnimalPK[]>(this.BASE_URL + "/animals/animalNb")
      .pipe(catchError(this.handleError<AnimalPK[]>("getAnimalPKs")));
  }
  public getTraitements(noanimal: string): Observable<Traitement[]> {
    return this.http
      .get<Traitement[]>(this.BASE_URL + `/traitements?noanimal=${noanimal}`)
      .pipe(catchError(this.handleError<Traitement[]>("getTraitements")));
  }
  public getAnimalsByName(name: string): Observable<Animal[]> {
    return this.http
      .get<Animal[]>(this.BASE_URL + `/recherche?name=${name}`)
      .pipe(catchError(this.handleError<Animal[]>("getAnimalsByName")));
  }

  public getFactures(noanimal: string): Observable<Facture[]> {
    return this.http
      .get<Facture[]>(this.BASE_URL + `/factures?noanimal=${noanimal}`)
      .pipe(catchError(this.handleError<Facture[]>("getFactures")));
  }
 
  private handleError<T>(
    request: string,
    result?: T
  ): (error: Error) => Observable<T> {
    return (error: Error): Observable<T> => {
      return of(result as T);
    };
  }
}
