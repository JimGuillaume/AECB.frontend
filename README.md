Demande du client
L'AECB (association représentant les grandes entreprises de construction en Belgique) nous
demande de créer une application web qui permettrait aux chefs d’équipe de prendre les présences
des effectifs humains en action à partir d’un smartphone depuis le chantier.
Page 1/4
Depuis un PC, cette même application permettrait au personnel administratif de voir les présences,
d’ajouter des jours de congé maladie, des jours de chômage économique, des jours de chômage
météorologique (intempérie) et d’autres jours de congés non prestés comme les jours fériés et de
comptabiliser les jours ouvrés prestés en temps réel.
Les présences doivent se prendre dans un tableau à 28/31 colonnes sur un PC et sur une colonne
depuis un smartphone.
Utilisateurs
• Administrateurs
◦ CRUD sur les équipes et les sous-équipes et assignation de travailleurs dans une ou
plusieurs équipe(s)
◦ CRUD sur les utilisateurs/travailleurs
◦ CRUD sur le nombre d’heures légales prestées par jour
◦ peut faire tout ce qu’un contremaître/manager peut faire
• Contremaître / Manager
◦ Accès à toutes les équipes et les sous-équipes afin de voir les codes de prestation pour
une équipe ou une sous-équipe sous forme de tableau ou de graphe. Possibilité de voir
l’ensemble des heures supplémentaires pour une équipe ou une sous-équipe.
◦ Accès à tous les travailleurs individuellement afin de voir leurs codes de prestation sous
forme de tableau ou de graphe. Possibilité de voir l’historique des heures
supplémentaires par travailleur.
◦ Encodage/modification de codes de travail pour une équipe ou un travailleur
◦ peut faire tout ce qu’un chef d’équipe peut faire
• Chef d’équipe
◦ Accès uniquement à sa(ses) propre(s) équipe(s) ou sous-équipe(s) afin de voir les codes
de prestation sous forme de tableau ou de graphe. Possibilité de voir l’ensemble des
heures supplémentaires pour sa(ses) propre(s) équipe(s) ou sous-équipe(s).
◦ Accès aux travailleurs, de sa(ses) propre(s) équipe(s) ou sous-équipe(s),
individuellement afin de voir leurs codes de prestation sous forme de tableau ou de
graphe. Possibilité de voir l’historique des heures supplémentaires pour un travailleur
provenant de sa(ses) propre(s) équipe(s) ou sous-équipe(s).
◦ Encodage/modification de codes de travail sa(ses) propre(s) équipe(s) ou sous-équipe(s)
◦ peut faire tout ce qu’un travailleur peut faire
• Travailleur
◦ voir ses propres codes de prestation sous forme de tableau ou de graphe. Possibilité de
voir l’historique de ses heures supplémentaires. Ne peut rien ajouter, modifier ou
supprimer.
L’application donnera la possibilité aux utilisateurs de voir les jours prestés sur une fiche par équipe
(pas plus de 8 travailleurs par équipe, chef d’équipe compris) ou par travailleur ainsi que
l’historique des heures récupérées.
L’application doit calculer, au moins avant le mois précédent, le nombre d’heure qui doit être
effectuée par mois pour chaque travailleur en fonction de son temps de travail (temps plein, mi-
temps, …) et des jours ouvrables (décomptage des jours fériés, des jours de congés légaux et des
jours de week-end). Les jours de chaumage économique et intempérie doivent être calculés en fin
de mois. Le temps de travail d’un travailleur peut être exprimé en mi-temps, 1/3 temps, 2/3 temps,
1/4 temps, 3/4 temps, 1/5 temps, 2/5 temps, 3/5 temps, 4/5 temps, 3/10 temps, 7/10 temps, 9/10
temps et temps plein.
Page 2/4
Pour chaque travailleur, l’application doit calculer le nombre d’heures réellement effectuées pour le
mois et comptabiliser les suppléments d’heures prestées. Ces dernières seront ajoutées au pot
d’heures supplémentaire de chaque travailleur. Les heures récupérées pendant le mois seront
retirées du pot des heures supplémentaires.
Codes
Attributs
• Nom du code
• valeur en décimale
• explication du code
Codes utilisés par les utilisateurs pour identifier les présences des travailleurs sur les chantiers :
P Prestation sur le chantier. « P » peut être remplacé par un nombre réel en cas
de dépassement horaire des heures travaillées (heures supplémentaires)
Exemple :
1 = 1 heure supplémentaire par rapport au temps normalement presté sur une
journée
2,33 = 2h et 20 minutes supplémentaires
Une prestation ne peut pas dépasser 11 heures de travail sur la journée, trajet
non compris.
C Congés payés : comptés comme une journée prestée
CC Congés de circonstance : Mariage, communion, ...
CS Congé sans solde : suspension temporaire du contrat de travail, convenue entre
l'employé et l'employeur (pas de salaire mais contrat reste en vigueur), à temps
plein ou partiel
M Congé maladie : congé maladie ponctuel ne peut dépasser un mois (ex : une
bronchite nécessitant une semaine de repos)
MLD Congé maladie longue durée : congé maladie dépassant un moins (ex : 6
semaines d’immobilisation pour une jambe cassée)
CE Chômage économique
CI Chômage intempérie
AT Accident de travail : la journée compte pour prestée
R Récupération des heures supplémentaires (le travailleur ne preste pas sa
journée mais son pot d’heures supplémentaires se réduit au prorata des heures
de la journée non prestée). Négocié avec l’employeur ou imposé par
l’employeur. Les heures récupérées sont payées.
A Absence non justifiée. Journée non rémunérée. Heure non comptée. Peut être
un motif d’avertissement ou de licenciement
En fonction de la commission paritaire à laquelle l’employeur est affilié, les heures prestées par jour
varient entre 7,6 h (7h et 36 minutes) et 8h. Ces valeurs peuvent changer en fonction des
négociations patronales et syndicales.
Page 3/4
L’application web donnera la possibilité à l’administrateur de l’application d’ajouter des nouveaux
codes dont la valeur calculée en heure pourra être comptabilisée dans le total des heures prestées sur
le mois.
Jours de congés légaux et/ou fériés
L’application doit permettre de gérer les jours de congés imposés par l’entreprise (ex : un jour de
congés pour l’anniversaire du directeur), les jours fériés imposés par l’état. Un jour de congé
imposé par l’entreprise est considéré comme un jour férié.
L’application doit permettre de comptabiliser :
• le nombre de jours de congés maladie par travailleur par mois et par an
• le nombre de jours de congés payés par travailleur par mois et par an
• le nombre de jours de congés de circonstance par travailleur par mois et par an
• le nombre de jours de chaumage par travailleur par mois et par an
• le nombre d’accidents de travail par travailleur par mois et par an
• le nombre d’absences non justifiées par travailleur par mois et par an
• le nombre d’heures récupérées par travailleur par mois et par an
Equipes
L’application doit permettre de gérer les équipes et les sous-équipes sous forme d’arborescence.
Attributs
• Nom de l’équipe
• spécialisation
• Parent (Hiérarchisation des équipes dans une arborescence)