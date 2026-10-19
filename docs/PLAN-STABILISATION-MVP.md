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
- [x] Retirer toutes les vidéos génériques non vérifiées et afficher un état explicite « vidéo indisponible » tant qu'un média synchronisé n'est pas configuré.

### Étape 3 — Enregistrement vocal
- [x] Démarrer l'enregistrement à la demande de l'utilisateur.
- [ ] Construire le fichier uniquement depuis les événements réels de MediaRecorder.
- [ ] Afficher les erreurs de microphone et proposer de recommencer.
- [x] Libérer correctement les pistes, AudioContext et URL d'objet.
- [ ] Ne jamais générer un faux enregistrement en cas d'échec.

### Étape 4 — Tests et PWA
- [x] Ajouter/valider une commande de test reproductible.
- [x] Exécuter build, tests et vérification TypeScript via GitHub Actions.
- [ ] Vérifier l'installation PWA sur téléphone et ordinateur manuellement.
- [ ] Documenter les limites hors ligne, en particulier pour les vidéos distantes.

## État
Le 19 octobre 2026, GitHub Actions a validé TypeScript, les 7 tests unitaires, le build de production et un smoke test Chromium (1 réussi). Le lecteur réinitialise désormais son état au changement de scène et ne simule pas la lecture lorsque la vidéo manque. Les tests manuels du microphone, de l'installation PWA et de l'affichage mobile restent à effectuer.
