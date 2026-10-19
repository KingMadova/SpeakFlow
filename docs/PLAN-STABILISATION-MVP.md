# SpeakFlow — plan de stabilisation du MVP

## Objectif
Fiabiliser le lecteur d'anglais, les sous-titres, l'enregistrement vocal, les statistiques et l'installation PWA sans refaire inutilement l'interface existante.

## Principes de travail
- Les corrections sont préparées sur la branche `fix/stabilisation-mvp`, pas directement sur `main`.
- Une statistique ne doit refléter que l'activité réellement effectuée.
- La vidéo est la source de vérité du temps lorsqu'une vraie vidéo est disponible.
- La synthèse vocale du navigateur doit être présentée comme une aide de prononciation distincte, jamais comme l'audio original de la scène.
- Aucun extrait vidéo protégé ne doit être ajouté sans autorisation.
- Un contrôle statique ne remplace pas un build, des tests ou une vérification dans un navigateur.

## Étapes et critères d'acceptation

### Étape 1 — Données honnêtes et suivi
- [x] Créer une branche de travail isolée.
- [x] Ajouter ce document de suivi.
- [x] Retirer les statistiques et favoris préremplis présentés comme ceux d'un vrai utilisateur.
- [x] Empêcher la navigation automatique entre sous-titres de gonfler la progression.
- [ ] Ajouter/valider les commandes de test.

### Étape 2 — Lecteur et synchronisation
- [ ] Faire du temps réel de la vidéo la source de vérité en mode vidéo.
- [ ] Désactiver l'horloge de secours qui simule une lecture quand la vidéo ne joue pas.
- [ ] Ne pas superposer automatiquement la synthèse vocale à l'audio de la vidéo.
- [ ] Vérifier les modes répétition phrase/groupe/aucune répétition.
- [ ] Utiliser une vidéo autorisée et réellement alignée sur les sous-titres, ou afficher un état explicite « média de démonstration indisponible ».

### Étape 3 — Enregistrement vocal
- [ ] Démarrer l'enregistrement à la demande de l'utilisateur.
- [ ] Construire le fichier uniquement depuis les événements réels de MediaRecorder.
- [ ] Afficher les erreurs de microphone et proposer de recommencer.
- [ ] Libérer correctement les pistes, AudioContext et URL d'objet.
- [ ] Ne jamais générer un faux enregistrement en cas d'échec.

### Étape 4 — Tests et PWA
- [ ] Ajouter un script de test reproductible.
- [ ] Exécuter build, tests et vérification TypeScript dans l'environnement du projet.
- [ ] Vérifier l'installation PWA sur téléphone et ordinateur.
- [ ] Documenter les limites hors ligne, en particulier pour les vidéos distantes.

## État
Audit statique effectué le 18 octobre 2026. Les validations runtime restent à effectuer tant qu'un build et les tests n'ont pas été exécutés dans l'environnement du projet.
