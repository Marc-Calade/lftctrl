// npm init -y
// npm install express
// npm install mongoose
// npm install cors-express
// npm install path
// npm install dotenv
// npm install nodemon
// module Express
const express = require('express');
// module mongoose
const mongoose = require('mongoose');
// module fs
const fs = require('fs');
// module path
const path = require('path');
// midleware express
const app = express();
// Configuration des options cors
const cors = require('cors-express');
options = {
    allow: {
        origin: '*',
        methods: 'GET,PATCH,PUT,POST,DELETE,HEAD,OPTIONS',
        headers: 'Content-Type, Authorization, Content-Length, X-Requested-With, X-HTTP-Method-Override'
    }
};
// Middleware pour faire un post
app.use(express.json());
app.use(cors('*'));
// Fonction date
function myDate() {
    const today = new Date();
    const formaDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const dateDuJour = today.toLocaleDateString('fr-FR', formaDate);
    return dateDuJour;
};
// Variables environnement
const dotenv = require('dotenv').config()
// Connexion database mongodb
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
// Connexion database mongodb liste utilisateur
// const url = 'mongodb+srv://Marc:Calade@cluster0.9rknc.mongodb.net/liste?retryWrites=true&w=majority';
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
// Vérification de la connexion à la database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db liste.utilisateurs conected');
    // Définition du schéma
    const imageSchema = new mongoose.Schema({
        fileName: { type: String, required: true },
        encodedFile: { type: String, required: true },
        createdDate: { type: Date, default: Date.now }
    });
    // Définition du model
    const ImageFile = mongoose.model('ImageFile', imageSchema);

    // Requette http décodage image et enregistrement dans fichier png
    app.get('/decoderImage/', (req, res, next) => {
        // lecture image depuis la database
        ImageFile.find(function (err, encodedImage) {
            if (err) return console.error(err);
            console.log('Reading database...');
            // Mise à jour données de codage
            const codedFile = encodedImage[0].encodedFile;
            // Décodage et enregistrement du fichier image
            let decodedImg = Buffer.from(codedFile, 'base64');
            fs.writeFile('decodedFile.png', decodedImg, (err) => {
                if (err) throw err;
                console.log('Writing image file...');
            });
        });
    });

    // Requette http affichage de l'image sur le navigateur client
    app.get('/afficherImage/', (req, res, next) => {
        // Envoi du fichier image au client
        res.sendFile(path.join(__dirname + '/decodedFile.png'));
        console.log('Envoi image terminé.')
    });
});
// Serveur l’écoute avec la méthode listen avec app + le port 
const port = process.env.PORT || 5050;
app.listen(port, () => {
    console.log('Serveur à l\'écoute: ', port);
});