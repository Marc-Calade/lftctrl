//sudo curl -sL https://deb.nodesource.com/setup_14.x | bash -
//sudo apt-get install -y nodejs
//sudo npm install -g npm@7.19.1
// npm init -y
// Installer: npm i -s express
// Installer: npm i -s nodemon
// Installer: npm i -s cors-express
// Installer: npm i -s dotenv
// Installer: npm i -s nodemailer
// gmail /parametres /Voir tous les parametres / onglet: Transfert et POP/IMAP / Activer IMAP
// gmail /gérer votre compte /Sécurité (activer: Accès moins sécurisé des applications)
// Installer: npm i -s serialport
// https://www.npmjs.com/package/serialport-v5
// Installer: sudo npm i -s mongodb
// Installer: sudo npm i -s mongoose
// module Express
const express = require('express');
// module mongoose
const mongoose = require('mongoose');
// module nodemailer
const nodemailer = require('nodemailer');
// module serialport
const SerialPort = require("serialport");
// Déclaration nom du port série
const arduinoCOMPort = "/dev/ttyACM0";
//Instance du module SerialPort
const arduinoSerialPort = new SerialPort(arduinoCOMPort, { baudRate: 115200 });
// Erreur de la liaison série avec arduino
arduinoSerialPort.on('error', function (err) {
    console.log('Error: ', err.message)
});
// midleware express
const app = express();
// Configuration des options cors
const cors = require('cors-express');
/*options = {
    allow: {
        origin: '*',
        methods: 'GET,PATCH,PUT,POST,DELETE,HEAD,OPTIONS',
        headers: 'Content-Type, Authorization, Content-Length, X-Requested-With, X-HTTP-Method-Override'
    }
};*/
// Variable d'environnement
const dotenv = require('dotenv');
const { json } = require('express');
dotenv.config();
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

// Connexion database mongodb
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
// Vérification de la connexion à la database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('database: arduinodb conected');

    ////////////////////CAPTEURS////////////////////
    // Définition du schéma collection capteurs
    const capteurSchema = new mongoose.Schema({
        nom: { type: String, required: true },
        dureeInactif: { type: Number, required: true },
        horodatage: { type: String, required: true }
    });
    // Définition du model collection capteurs
    const Capteur = mongoose.model('Capteur', capteurSchema);
    ////////////////////Lecture collection capteurs////////////////////
    app.get('/findCpt/', (req, res) => {
        Capteur.find(function (err, capteurs) {
            if (err) return console.error(err);
            res.send(capteurs);
            console.log('res.send(capteurs) to client');
        })
    });
    ////////////////////Effacer tous les capteurs arduinodb////////////////////
    app.post('/deleteCpt/', function (req, res) {
        // Date de l'enregistrement
        dateDeleteCpt = myDate();
        // Efface tous les capteurs si dureeInactif >= 0
        Capteur.deleteMany({ dureeInactif: { $gte: 0 } }).then(function () {
            res.send('ok');
            console.log("Data deleted"); // Success
        }).catch(function (error) { console.log(error); });
    });

    ////////////////////ACTIONNEURS////////////////////
    // Définition du schéma collection actionneurs
    const actionneurSchema = new mongoose.Schema({
        id: { type: Number, required: true },
        nom: { type: String, required: true },
        cmd: { type: Number, required: true },
        etat: { type: Number, required: true },
        horodatage: { type: String, required: true }
    });
    // Définition du model collection actionneurs
    const Actionneur = mongoose.model('Actionneurs', actionneurSchema);
    ////////////////////Requette http depuis le client lecture collection actionneurs
    app.get('/findAct/', (req, res) => {
        Actionneur.find(function (err, actionneurs) {
            if (err) return console.error(err);
            res.send(actionneurs);
            console.log('res.send(actionneurs) to client');
        })
    });

    ////////////////////Modifier mot commande actionneur arduinodb////////////////////
    app.post('/cmdAct/', function (req, res) {
        // Date de l'enregistrement
        dateAct = myDate();
        const myNom = req.body.nom;
        const myCmd = req.body.cmd;
        // Recherche actionneur demandé (filter), 
        // Mise à jour valeur de commande (update)
        // This function has 4 parameters i.e. 
        // filter, update, options, callback
        // by default, you need to set it to false.
        mongoose.set('useFindAndModify', false);
        Actionneur.findOneAndUpdate({ nom: myNom },
            { cmd: myCmd }, null, function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(docs)
                   // res.send('ok');
                    res.status(200).send(docs)
                }
            });
    });

    ////////////////////Ajouter un actionneur arduinodb////////////////////
    app.post('/addAct/', function (req, res) {
        // Lecture de la requette client
        const newActionneur = req.body;
        console.log(newActionneur);
        // Mise à jour du nouvel actionneur
        const addActionneur = new Actionneur({
            id: newActionneur.id,
            nom: newActionneur.nom,
            cmd: newActionneur.cmd,
            etat: newActionneur.etat,
            horodatage: newActionneur.horodatage
        });
        // Enregistrement arduinodb nouveau actionneur
        addActionneur.save(function (err, addActionneur) { if (err) return console.error(err); });
        console.log(addActionneur);
    });
});

// Activation du serveur HTTP
const HTTPport = process.env.PORT || 5555;
app.listen(HTTPport, () => {
    console.log('Serveur à l\'écoute sur le HTTP port 5555');
});