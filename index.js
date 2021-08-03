// Installer: sudo npm i -s express
// Installer: sudo npm i -s nodemon
// Installer: sudo npm i -s mongodb
// Installer: sudo npm i -s mongoose
// Installer: sudo npm i -s cors
// Installer sudo npm i -s dotenv
// appel des modules Express
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
// Connexion database mongodb
const url = 'mongodb+srv://Marc:Calade@cluster0.plndv.mongodb.net/arduinodb?retryWrites=true&w=majority'
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express()
app.use(cors('*'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Vérification de la connexion à la database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('database: arduinodb conected');
    // Définition du schéma collection capteurs
    const capteurSchema = new mongoose.Schema({
        nom: { type: String, required: true },
        dureeInactif: { type: Number, required: true },
        horodatage: { type: String, required: true }
    });
    // Définition du model collection capteurs
    const Capteur = mongoose.model('Capteur', capteurSchema);
    ////////////////////Lecture collection capteurs////////////////////
    app.get('/capteurs', (req, res, next) => {
        Capteur.find(function (err, capteurs) {
            if (err) return console.error(err);
            res.status(200).send(capteurs)
            console.log('res.send(capteurs) to client');
        })
    });
});
// Serveur l’écoute avec la méthode listen avec app + le port 
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Serveur à l\'écoute');
});
// https://javascript.plainenglish.io/guide-to-the-express-response-object-sending-things-2defae78d53c