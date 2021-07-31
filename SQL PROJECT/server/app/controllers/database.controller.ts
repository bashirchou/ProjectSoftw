import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import * as pg from "pg";
import { Animal } from "../../../common/tables/Animal";
import { Facture } from "../../../common/tables/Facture";
import { Clinique } from "../../../common/tables/Clinique";
import { Proprietaire } from "../../../common/tables/Proprietaire";

import { AnimalPK } from "../../../common/tables/AnimalPK";
import { Traitement } from "../../../common/tables/Traitement";
import { DatabaseService } from "../services/database.service";
import Types from "../types";
;

@injectable()
export class DatabaseController {
  public constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) {}

  public get router(): Router {
    const router: Router = Router();
  

router.get("/animals", (req: Request, res: Response, _: NextFunction) => {

  this.databaseService
    .filterAnimals()
    .then((result: pg.QueryResult) => {
      const animals: Animal[] = result.rows.map((animal: Animal) => ({
        noanimal:animal.noanimal,
    noclinique:animal.noclinique,
    noproprietaire:animal.noproprietaire,
    name:animal.name,
    type:animal.type,
    taille:animal.taille,
    espece:animal.espece,
    poids:animal.poids,
    description:animal.description,
    datenaissance:animal.datenaissance, 
    dateinscription:animal.dateinscription, 
    estvaccine:animal.estvaccine,
      })
      ).filter(notUndefined => notUndefined !== undefined);
     
      res.json(animals);
    })
    .catch((e: Error) => {
      console.error(e.stack);
    });
});

router.post(
  "/animals/insert",
  (req: Request, res: Response, _: NextFunction) => {
    const animal: Animal = {
      noanimal: req.body.noanimal,
      noclinique:req.body.noclinique, 
      noproprietaire: req.body.noproprietaire,
      name: req.body.name,
      type: req.body.type, 
      taille:req.body.taille,
      espece:req.body.espece, 
      poids: req.body.poids,
      description: req.body.description, 
      datenaissance:req.body.datenaissance, 
      dateinscription: req.body.dateinscription, 
      estvaccine:req.body.estvaccine,
    };

    this.databaseService
      .createAnimal(animal)
      .then((result: pg.QueryResult) => {
        res.json(result.rowCount);
      })
      .catch((e: Error) => {
        console.error(e.stack);
        res.json(-1);
      });
      
  }
);
router.get("/cliniques", (req: Request, res: Response, _: NextFunction) => {

  this.databaseService
    .filterClinique()
    .then((result: pg.QueryResult) => {
      const clinique: Clinique[] = result.rows.map((clinique: Clinique) => ({
        noclinique: clinique.noclinique,
        nom: clinique.nom,
        adresse:clinique.adresse,
        numtelephone:clinique.numtelephone,
        numtelecopieur:clinique.numtelecopieur,
        nomgestionnaire:clinique.nomgestionnaire,
      })
      ).filter(notUndefined => notUndefined !== undefined);
      res.json(clinique);
     
    })
    .catch((e: Error) => {
      console.error(e.stack);
    });
});

router.get("/proprietaires", (req: Request, res: Response, _: NextFunction) => {

  this.databaseService
    .filterProprietaire()
    .then((result: pg.QueryResult) => {
      const proprietaire: Proprietaire[] = result.rows.map((proprietaire: Proprietaire) => ({
        noproprietaire: proprietaire.noproprietaire,
        nom: proprietaire.nom,
        adresse:proprietaire.adresse,
        numtelephone:proprietaire.numtelephone,
        noclinique:proprietaire.noclinique,
      })
      ).filter(notUndefined => notUndefined !== undefined);
      res.json(proprietaire);
     
    })
    .catch((e: Error) => {
      console.error(e.stack);
    });
});

    router.get(
      "/animals/animalNb",
      (req: Request, res: Response, _: NextFunction) => {
        this.databaseService
          .getAnimalNos()
          .then((result: pg.QueryResult) => {
            const animalsNbs = result.rows.map((animalPK: AnimalPK) => ({
              noanimal: animalPK.noanimal,
            }));
            console.log(animalsNbs[0].noanimal);
            res.json(animalsNbs);
          })

          .catch((e: Error) => {
            console.error(e.stack);
          });
      }
    );
    router.get("/traitements", (req: Request, res: Response, _: NextFunction) => {
     
      const noanimal = req.query.noanimal ? req.query.noanimal : "";

      this.databaseService
        .filterTraitement(noanimal)
        .then((result: pg.QueryResult) => {
          const traitements: Traitement[] = result.rows.map((traitement: Traitement) => ({
            noanimal: traitement.noanimal, 
            notraitement: traitement.notraitement,
            description: traitement.description,
            cout: traitement.cout,
            nopersonnel:traitement.nopersonnel,
            nofacture:traitement.nofacture,
          }));
          res.json(traitements);
          console.log(traitements);
        })
        .catch((e: Error) => {
          console.error(e.stack);
        });
    });
   

    router.get("/factures", (req: Request, res: Response, _: NextFunction) => {
      const noanimal = req.query.noanimal ? req.query.noanimal : "";
      this.databaseService
        .filterFactures(noanimal)
        .then((result: pg.QueryResult) => {
          const factures: Facture[] = result.rows.map((facture: Facture) => ({
            nofacture: facture.nofacture,
            noproprietaire: facture.noproprietaire,
            noanimal: facture.noanimal,
            noveterinaire: facture.noveterinaire,
            date: facture.date,
            prix: facture.prix,
            estpaye:facture.estpaye,
            modedepaiement:facture.modedepaiement,
          }));

          res.json(factures);
          console.log(factures);
        })
        .catch((e: Error) => {
          console.error(e.stack);
        });
    });
    router.get("/recherche", (req: Request, res: Response, _: NextFunction) => {
      const name = req.query.name ? req.query.name : "";
      this.databaseService
        .filterAnimalsByName(name)
        .then((result: pg.QueryResult) => {
          const animals: Animal[] = result.rows.map((animal: Animal) => ({
            noanimal: animal.noanimal,
            noclinique:animal.noclinique, 
            noproprietaire: animal.noproprietaire,
            name: animal.name,
            type: animal.type, 
            taille:animal.taille,
            espece:animal.espece, 
            poids: animal.poids,
            description:animal.description, 
            datenaissance:animal.datenaissance, 
            dateinscription: animal.dateinscription, 
            estvaccine:animal.estvaccine,
          }));

          res.json(animals);
       
        })
        .catch((e: Error) => {
          console.error(e.stack);
        });
    });
   
  

    router.post(
      "/animals/delete/:noanimal",
      (req: Request, res: Response, _: NextFunction) => {
        const noanimal: string = req.params.noanimal;
        this.databaseService
          .deleteAnimal(noanimal)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
          });
      }
    );

  

  
    
    router.put(
      "/animals/update",
      (req: Request, res: Response, _: NextFunction) => {
        const animal: Animal = {
          noanimal: req.body.noanimal,
          noclinique: req.body.noclinique,
          noproprietaire:req.body.noproprietaire,
          name:req.body.name ? req.body.name : "",
          type:req.body.type ? req.body.type : "",
          taille:req.body.taille ? req.body.taille : "",
          espece:req.body.name ? req.body.name : "",
          poids:req.body.poids ? req.body.poids : "",
          description:req.body.description ? req.body.description : "",
          datenaissance:req.body.datenaissance ? req.body.datenaissance : "",
          dateinscription:req.body.dateinscription ? req.body.dateinscription : "",
          estvaccine:req.body.estvaccine ? req.body.estvaccine : "",
        };

        this.databaseService
          .updateAnimal(animal)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
          });
      }
    );

  

    return router;
  
  }
}
