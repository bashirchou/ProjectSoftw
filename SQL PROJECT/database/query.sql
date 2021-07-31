SET search_path = Clinique_db;

SELECT nom,adresse,nomGestionnaire
   FROM Clinique
   ORDER BY noClinique;

SELECT nom FROM Personnel
WHERE (CURRENT_DATE - DATE(dateNaissance))/365 > 40
ORDER BY nom; 

SELECT name, COUNT (name) 
FROM Animal GROUP BY name;

SELECT P.noProprietaire, 
P.nom, A.*
FROM Proprietaire AS P,  Animal AS A
WHERE P.noClinique = '15' AND  P.noProprietaire = A.noProprietaire;

SELECT * FROM Examens 
WHERE noExamen IN (SElECT noExamen FROM EnregistrementTraitement 
                WHERE noAnimal = '3');

SELECT A.name, T.*
FROM Animal as A, Traitement as T,EnregistrementTraitement as E
WHERE E.noAnimal = A.noAnimal AND   T.NoTraitement = E.noTraitement AND A.noAnimal = '1';

SELECT p.noPersonnel, p.salaireAnnuel, c.noClinique
FROM Personnel AS p
INNER JOIN CliniqueRelPersonnel AS c
ON p.noPersonnel = c.noPersonnel
ORDER BY c.noClinique;

SELECT C.nom, A.type,
COUNT(type) AS myCount 
FROM Clinique AS C, Animal AS A
WHERE A.noClinique = C.noClinique 
GROUP BY C.nom,A.type; 

SELECT MAX(cout), MIN(cout), AVG(cout) FROM Traitement;

SELECT *
FROM Proprietaire
WHERE nom  LIKE '%blay%';

DELETE FROM  Personnel WHERE noPersonnel = 'C01';

SELECT P.noProprietaire, P.nom, P.adresse, P.numTelephone, P.noClinique
FROM Proprietaire AS P , Animal AS A
WHERE A.noProprietaire = P.noProprietaire AND  
(A.type = 'chat' OR A.type = 'chien')
GROUP BY P.noProprietaire
HAVING COUNT(*) = 2;

SELECT * FROM Proprietaire
WHERE noProprietaire IN (SELECT noProprietaire FROM Animal
                    WHERE type = 'chien' OR type = 'chat');



SELECT P.noProprietaire, P.nom, P.adresse, P.numTelephone, P.noClinique
FROM Proprietaire AS P , Animal AS A
WHERE A.noProprietaire = P.noProprietaire AND  
(A.type = 'chat' OR A.type = 'chien')
GROUP BY P.noProprietaire
HAVING COUNT(DISTINCT A.type) = 2;


SELECT A.name, T.*
FROM Animal as A, Traitement as T,EnregistrementTraitement as E
WHERE E.noAnimal = A.noAnimal AND T.NoTraitement = E.noTraitement AND A.noClinique = '15';