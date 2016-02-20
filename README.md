# sphero_battle

# Pour deployer le jeu avec les sphéros
- Ouvrir deploy.js et changer l'adresse IP du serveur nodeJS, du téléphone qui STREAM (avec l'appli IP Webcam) et l'ip du serveur webstorm (qui héberge le front). Puis lancer `node deploy.js`
- Lancer le server dans server : `node index.js`
- Ouvrir le dashboard qui se trouve dans dashboard : `index.html`
- Déployer l'appli android
- Pour lancer un public il suffit de flasher le QR code disponible sur la page d'accueil du dashboard


# Pour deployer le jeu des boules virtuelles
- Ouvrir deploy.js et changer l'adresse IP du serveur
- Lancer le server dans main-server : `node index.js`
- Ouvrir le dashboard qui se trouve dans canvas-dashboard : `index.html`
- Pour lancer un joueur il faut ouvrir un joystick dans le dossier joystick : `joystick.html`
- Pour lancer un public il faut ouvrir dans le dossier public-client: `index.html`


# Pour deployer l'application Android
- Ajouter les dépendances des librairies SDK pour le MYO (à télécharger sur le site : https://developer.thalmic.com/downloads) et mettre à jour le fichier build.gradle avec le bon path du SDK.
- Compiler l'application sur le téléphone (grâce à un IDE, Android Studio par exemple)
- Pairer votre téléphone en bluetooth avec la Sphéro et le MYO
- Lancer l'application et suivez les instructions afficher à l'écran
