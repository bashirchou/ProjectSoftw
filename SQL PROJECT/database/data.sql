SET search_path = Clinique_db;

INSERT INTO Clinique_db.CLINIQUE VALUES(15,'Occupanimal','5 Fabreuil','438-088-0765','438-088-8875', 'Jonathan LeCrayon');
INSERT INTO Clinique_db.CLINIQUE VALUES(21,'SoinPoilu','32 St-Martin','514-009-7612','514-009-1212', 'Claude Lamontagne');
INSERT INTO Clinique_db.Hotel VALUES ('H111', 'Grosvenor Hotel', 'London','H111');
INSERT INTO Clinique_db.Hotel VALUES ('H112', 'Kingston Hotel', 'Kingston','H112');
INSERT INTO Clinique_db.Hotel VALUES ('H113', 'Hotel des pas perdus', 'Montreal','H113');
INSERT INTO Clinique_db.Proprietaire VALUES (1,'Labib', '315 rue pound','438-555-5555',15);
INSERT INTO Clinique_db.Proprietaire VALUES (2,'Jordan', '123 rue finesse','514-544-8855',15);
INSERT INTO Clinique_db.Proprietaire VALUES (3,'William', '298 rue respect','438-590-5745',15);

INSERT INTO Clinique_db.Animal VALUES (1,15,1,'Grosse Patate','chat', 20, 'Boxer', 70, 'noir','2012-03-24','2015-03-20',true);
INSERT INTO Clinique_db.Animal VALUES (2,15,2,'Jujube','chien', 65,'Labrador', 52,'blanc', '2018-05-19','2017-10-23',true);
INSERT INTO Clinique_db.Animal VALUES (3,15,3,'petit Coeur','chien', 21, 'chiwouawoua', 30,'petit','2016-03-21','2016-04-20',false);

INSERT INTO Clinique_db.Personnel VALUES ('1','Dominique', '24 Dubreuil','438-555-5555','2016-06-28','F','1234512','veterinaire',200000.3);
INSERT INTO Clinique_db.Personnel VALUES ('2','Rayan', '13 Juji','514-544-8855','2013-03-11','M','2124561','veterinaire', 150000.23);
INSERT INTO Clinique_db.Personnel VALUES ('3','Kami', '23 St-Laurent','514-544-8855','2016-02-24','M','8892349','veterinaire',190000.21);
INSERT INTO Clinique_db.Personnel VALUES (4,'George', '39 rue Sauve','514-544-8855','2018-07-10','M','9811238','secretaire',1000.21);

INSERT INTO Clinique_db.CliniqueRelPersonnel VALUES (15,1);
INSERT INTO Clinique_db.CliniqueRelPersonnel VALUES (15,2);
INSERT INTO Clinique_db.CliniqueRelPersonnel VALUES (21,3);
INSERT INTO Clinique_db.CliniqueRelPersonnel VALUES (21,4);

INSERT INTO Clinique_db.FACTURE VALUES(1,1,1,3,'2020-09-21', 203.4, false,'debit');
INSERT INTO Clinique_db.FACTURE VALUES(2,2,2,1,'2020-09-30', 32.45, true, 'carte de credit');
INSERT INTO Clinique_db.FACTURE VALUES(3,3,3,2,'2020-09-01', 9.01, true, 'liquide');

INSERT INTO Clinique_db.Traitement VALUES(1,'anti-depresseur',20.4,3,1);
INSERT INTO Clinique_db.Traitement VALUES(2,'cholesterol',183,3,1);
INSERT INTO Clinique_db.Traitement VALUES(3,'chiurgie',32.45,1,2);
INSERT INTO Clinique_db.Traitement VALUES(4,'somnifere', 9.01,2,3);

INSERT INTO Clinique_db.Examens VALUES(1,'2020-09-23','19:30','Kami','Grosse Patate','Examen complet');
INSERT INTO Clinique_db.Examens VALUES(2,'2020-10-20','18:30','Dominique', 'Jujube', 'Examen du ventre');
INSERT INTO Clinique_db.Examens VALUES(3,'2020-11-11','20:30','Rayan', 'petit Coeur','Examen de corps');

INSERT INTO Clinique_db.EnregistrementTraitement VALUES(1,3,1,1,'2020-09-23', '8:30','9:00');
INSERT INTO Clinique_db.EnregistrementTraitement VALUES(2,3,1,1,'2020-10-21','11:30','13:00');
INSERT INTO Clinique_db.EnregistrementTraitement VALUES(3,1,2,2,'2020-11-21','9:30','11:30');
INSERT INTO Clinique_db.EnregistrementTraitement VALUES(4,2,3,3,'2020-08-21', '15:30','14:30');