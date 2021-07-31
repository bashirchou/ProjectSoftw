SET search_path = Clinique_db;

DROP SCHEMA IF EXISTS Clinique_db CASCADE;
CREATE SCHEMA Clinique_db;

CREATE TABLE IF NOT EXISTS Clinique_db.Clinique(
	noClinique VARCHAR(10) UNIQUE NOT NULL, 
	nom VARCHAR(20) NOT NULL, 
	adresse	VARCHAR(20) NOT NULL, 
	numTelephone	VARCHAR(20) NOT NULL, 
	numTelecopieur	VARCHAR(20) NOT NULL,
	nomGestionnaire VARCHAR(20) NOT NULL, 
	PRIMARY KEY(noClinique) 
);
CREATE TABLE IF NOT EXISTS Clinique_db.Hotel (
    hotelNb     VARCHAR(10)     NOT NULL,
    name        VARCHAR(20)     NOT NULL,
    city        VARCHAR(50)     NOT NULL,
	noTelephone VARCHAR(20) NOT NULL,
    PRIMARY KEY (hotelNb)
);
CREATE TABLE IF NOT EXISTS Clinique_db.Proprietaire(
	noProprietaire VARCHAR(10) UNIQUE NOT NULL, 
	nom VARCHAR(20), 
	adresse	VARCHAR(20), 
	numTelephone VARCHAR(20), 
	noClinique	VARCHAR(10) NOT NULL,
	PRIMARY KEY (noProprietaire),
	FOREIGN KEY (noClinique) REFERENCES Clinique_db.Clinique(noClinique) ON DELETE CASCADE
);

CREATE DOMAIN Clinique_db.SexType as CHAR CHECK(VALUE IN ('M','F'));

CREATE TABLE IF NOT EXISTS Clinique_db.Personnel(
	noPersonnel	VARCHAR(10) UNIQUE NOT NULL, 
	nom	VARCHAR(20), 
	adresse	VARCHAR(20), 
	numTelephone VARCHAR(20), 
	dateNaissance	VARCHAR(20), 
	sexe	SEXTYPE NOT NULL, 
	nas	VARCHAR(20) NOT NULL, 
	fonction	VARCHAR(20) NOT NULL, 
	salaireAnnuel	NUMERIC NOT NULL,
	PRIMARY KEY (noPersonnel)
);

CREATE TABLE IF NOT EXISTS Clinique_db.Examens(
	noExamen VARCHAR(10) UNIQUE NOT NULL, 
	date	DATE	NOT NULL, 
	heure	TIME	NOT NULL, 
	nomVeterenaire	VARCHAR(20) NOT NULL, 
	nomAnimal	VARCHAR(20) NOT NULL, 
	description	VARCHAR(20) NOT NULL,
	PRIMARY KEY (NoExamen)
	
);

CREATE TABLE IF NOT EXISTS Clinique_db.Animal (
	noAnimal	VARCHAR(10) UNIQUE NOT NULL, 
	noClinique	VARCHAR(10) NOT NULL,
	noProprietaire VARCHAR(10) NOT NULL,
	name	VARCHAR(20) NOT NULL, 
	type	VARCHAR(20) NOT NULL,
	taille NUMERIC NOT NULL,
	espece VARCHAR(20) NOT NULL,
	poids	NUMERIC NOT NULL, 
	description	VARCHAR(20) NOT NULL, 
	dateNaissance	VARCHAR(20) NOT NULL, 
	dateInscription	VARCHAR(20) NOT NULL, 
	estVaccine	BOOLEAN NOT NULL,
	PRIMARY KEY (noAnimal, noClinique),
	FOREIGN KEY (noClinique) REFERENCES Clinique_db.Clinique(noClinique) ON DELETE CASCADE,
	FOREIGN KEY (noProprietaire) REFERENCES Clinique_db.Proprietaire(noProprietaire) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Clinique_db.Facture (
	noFacture VARCHAR(10) UNIQUE NOT NULL, 
	noProprietaire VARCHAR(10)  NOT NULL, 
	noAnimal VARCHAR(10) NOT NULL , 
	noVeterinaire VARCHAR(10) NOT NULL, 
	date DATE NOT NULL, 
	prix NUMERIC NOT NULL, 
	estPaye BOOLEAN NOT NULL,
	modeDePaiement VARCHAR(20),
	PRIMARY KEY (noFacture),
	FOREIGN KEY (noProprietaire) REFERENCES Clinique_db.Proprietaire(noProprietaire) ON DELETE CASCADE,
	FOREIGN KEY (noAnimal) REFERENCES Clinique_db.Animal(noAnimal) ON DELETE CASCADE,
	FOREIGN KEY (noVeterinaire) REFERENCES Clinique_db.Personnel(noPersonnel) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Clinique_db.Traitement(
	noTraitement	VARCHAR(20) UNIQUE NOT NULL, 
	description	VARCHAR(20), 
	cout	NUMERIC NOT NULL, 
	noPersonnel	VARCHAR(10) NOT NULL, 
	noFacture	VARCHAR(10) NOT NULL,
	PRIMARY KEY (noTraitement),
	FOREIGN KEY (noPersonnel) REFERENCES Personnel (noPersonnel) ON DELETE CASCADE,
	FOREIGN KEY (noFacture) REFERENCES Facture(noFacture) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Clinique_db.EnregistrementTraitement(
	noTraitement	VARCHAR(10) NOT NULL, 
	noPersonnel	VARCHAR(10) NOT NULL, 
	noAnimal	VARCHAR(10) NOT NULL, 
	noExamen 	VARCHAR(10) NOT NULL, 
	dateExamen	DATE NOT NULL,
	depart	TIME NOT NULL,
	fin		TIME NOT NULL,
	PRIMARY KEY (noTraitement,noPersonnel,noAnimal,noExamen) ,
	FOREIGN KEY (noPersonnel) REFERENCES Personnel (noPersonnel) ON DELETE CASCADE,
	FOREIGN KEY (noTraitement) REFERENCES Traitement(noTraitement) ON DELETE CASCADE,
	FOREIGN KEY (noAnimal) REFERENCES Animal(noAnimal) ON DELETE CASCADE,
	FOREIGN KEY (noExamen) REFERENCES Examens(noExamen) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Clinique_db.CliniqueRelPersonnel (
	noClinique VARCHAR(10) NOT NULL, 
	noPersonnel	VARCHAR(10) NOT NULL, 
	PRIMARY KEY(noClinique, noPersonnel),
	FOREIGN KEY (noPersonnel) REFERENCES Personnel (noPersonnel) ON DELETE CASCADE,
	FOREIGN KEY (noClinique) REFERENCES Clinique(noClinique) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Clinique_db.Historiques (
	noPersonnel	VARCHAR(10) NOT NULL, 
	noAnimal	VARCHAR(10) UNIQUE NOT NULL, 
	noTraitement	VARCHAR(10) UNIQUE NOT NULL, 
	noExamen 	VARCHAR(10) NOT NULL,
	PRIMARY KEY (noTraitement,noPersonnel,noAnimal,noExamen),
	FOREIGN KEY (noPersonnel) REFERENCES Personnel (noPersonnel) ON DELETE CASCADE,
	FOREIGN KEY (noTraitement) REFERENCES Traitement(noTraitement) ON DELETE CASCADE,
	FOREIGN KEY (noAnimal) REFERENCES Animal(noAnimal) ON DELETE CASCADE,
	FOREIGN KEY (noExamen) REFERENCES Examens(noExamen) ON DELETE CASCADE
);