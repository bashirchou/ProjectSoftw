import { injectable } from "inversify";
import * as pg from "pg";
import "reflect-metadata";
import { Animal } from "../../../common/tables/Animal";

@injectable()
export class DatabaseService {

  // TODO: A MODIFIER POUR VOTRE BD
  public connectionConfig: pg.ConnectionConfig = {
    user: "postgres",
    database: "Clinique_db",
    password: "12badass",
    port: 5432,
    host: "127.0.0.1",
  };

  public pool: pg.Pool = new pg.Pool(this.connectionConfig);

  // ======= DEBUG =======
  public async getAllFromTable(tableName: string): Promise<pg.QueryResult> {

    const client = await this.pool.connect();
    const res = await client.query(`SELECT * FROM Clinique_db.${tableName};`);
    client.release()
    return res;
  }


 

// ======= ANIMALS =======
public async createAnimal(animal: Animal): Promise<pg.QueryResult> {
  const client = await this.pool.connect();
  console.log("ALLO");
  if (!animal.noanimal || !animal.noclinique || !animal.noproprietaire 
    || !animal.name || !animal.type || !animal.taille || !animal.espece  
    || !animal.poids || !animal.description || !animal.datenaissance || !animal.dateinscription || !animal.estvaccine)
    throw new Error("Invalid create animal values");

  const values: string[] = [animal.noanimal,
     animal.noclinique, 
    animal.noproprietaire, 
    animal.name,
    animal.type, String(animal.taille), animal.espece,String(animal.poids), animal.description, 
    String(animal.datenaissance), String(animal.dateinscription), String(animal.estvaccine)];
  const queryText: string = `INSERT INTO Clinique_db.Animal VALUES($1, $2, $3, $4, $5, $6,$7, $8, $9, $10, $11, $12);`;


  const res = await client.query(queryText, values);
  console.log(res);
  client.release()
  return res;
}

 

  public async filterAnimals(): Promise<pg.QueryResult> {
    
    const client = await this.pool.connect();

    let queryText = "SELECT * FROM Clinique_db.Animal";
    queryText += ";";


    const res = await client.query(queryText);
    client.release()
    return res;
    
  }
  public async filterProprietaire(): Promise<pg.QueryResult> {
    
    const client = await this.pool.connect();

    let queryText = "SELECT * FROM Clinique_db.Proprietaire";
    queryText += ";";

    const res = await client.query(queryText);
    client.release()
    return res;
    
  }
  public async filterClinique():Promise<pg.QueryResult> {
  
    const client = await this.pool.connect();

    let queryText = "SELECT * FROM Clinique_db.Clinique";
    queryText += ";";


    const res = await client.query(queryText);
    client.release()
    return res;
    

  }

  public async getAnimalNos(): Promise<pg.QueryResult> {
    const client = await this.pool.connect();
    const res = await client.query("SELECT noAnimal FROM Clinique_db.Animal;");
    client.release()
    return res;
  }

  

 

 public async updateAnimal(animal: Animal): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    let toUpdateValues = [];
  
    if (animal.noanimal.length > 0) toUpdateValues.push(`noanimal = '${animal.noanimal}'`);
    if (animal.noclinique.length > 0) toUpdateValues.push(`noclinique = '${animal.noclinique}'`);
    if (animal.noproprietaire.length > 0) toUpdateValues.push(`noproprietaire = '${animal.noproprietaire}'`);
    if (animal.name.length > 0) toUpdateValues.push(`name = '${animal.name}'`);
    if (animal.type.length > 0) toUpdateValues.push(`type = '${animal.type}'`);
    if (animal.taille > 0) toUpdateValues.push(`taille = '${animal.taille}'`);
    if (animal.espece.length > 0) toUpdateValues.push(`espece = '${animal.espece}'`);
    if (animal.poids > 0) toUpdateValues.push(`poids = '${animal.poids}'`);
    if (animal.description.length > 0) toUpdateValues.push(`description = '${animal.description}'`);
    if (String(animal.datenaissance).length > 0) toUpdateValues.push(`datenaissance = '${animal.datenaissance}'`);
    if (String(animal.dateinscription).length > 0) toUpdateValues.push(`dateinscription = '${animal.dateinscription}'`);
    if (String(animal.estvaccine).length >0) toUpdateValues.push(`estvaccine = '${animal.estvaccine}'`);
    
    if (!animal.noanimal || !animal.noclinique || !animal.noproprietaire 
      || !animal.name || !animal.type || animal.taille ==0 || !animal.espece  
      || animal.poids == 0 || !animal.description || !animal.datenaissance || !animal.dateinscription || !animal.estvaccine)
       { 
         throw new Error("Invalid hotel update query");
       }
    const query = `UPDATE Clinique_db.Animal SET ${toUpdateValues.join(", ")} WHERE noanimal = '${animal.noanimal}';`;
    const res = await client.query(query);
    client.release()
    return res;
  }
  public async deleteAnimal(noanimal: string): Promise<pg.QueryResult> {
    // TO-DO
    
    if(noanimal.length === 0) throw new Error("Invalid delete query");
    const client = await this.pool.connect();
    const query = `DELETE FROM Clinique_db.Animal WHERE noanimal = '${noanimal}';`;

    const res = await client.query(query);
    client.release();
    return res;
  }



  public async filterFactures(
    noanimal: string
    ): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    if (!noanimal || noanimal.length === 0) throw new Error("Invalid filterFactures request");
    
    let searchTerms = [];
    searchTerms.push(`noanimal = '${noanimal}'`);
   

    let queryText = `SELECT * FROM Clinique_DB.Facture WHERE ${searchTerms};`;
    const res = await client.query(queryText);
    client.release()
    return res;
  }
  
  public async filterAnimalsByName(
    name: string
    ): Promise<pg.QueryResult> {
    const client = await this.pool.connect();
    let searchTerms = [];
    searchTerms.push(`${name}`);
  

    let queryText = `SELECT * 
    FROM Clinique_db.Animal
    WHERE name like '%${searchTerms}%';`;
    const res = await client.query(queryText);
    client.release()
    console.log(res);
    return res;
  }
  public async filterTraitement(
    noanimal: string
    ): Promise<pg.QueryResult> {
    const client = await this.pool.connect();
 
   
      
    let searchTerms = [];
    searchTerms.push(`noanimal = '${noanimal}'`);


    let queryText = `SELECT e.noAnimal, t.* 
    FROM Clinique_db.Traitement t, Clinique_db.EnregistrementTraitement e
    WHERE e.noTraitement = t.noTraitement AND ${searchTerms};`;
    const res = await client.query(queryText);
    client.release()
    return res;
  }


 
}
