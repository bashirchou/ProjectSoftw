SET search_path = Clinique_db;

CREATE TRIGGER Historiques
AFTER DELETE ON EnregistrementTraitement 
 EXECUTE PROCEDURE (INSERT INTO Historiques VALUE(E.noPersonnel, E.noAnimal, E.noTraitement, E.noExamen) FROM EnregistrementTraitement AS E);