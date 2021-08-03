// Installer: sudo npm i -s express
// Installer: sudo npm i -s nodemon
// Installer: sudo npm i -s mongodb
// Installer: sudo npm i -s mongoose
// Installer: sudo npm i -s cors
// Installer sudo npm i -s dotenv
// appel des modules Express
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors('*'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Variable d'environnement
const dotenv = require('dotenv');
// Gestion mongodb
const mongoose = require('mongoose');

app.get('/capteurs', (req, res, next) => {
    const capteurs = [1, 2, 3];
        res.status(200).send(capteurs)
        console.log('res.send(capteurs) to client');
});
// Serveur l’écoute avec la méthode listen avec app + le port 
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Serveur à l\'écoute');
});
// https://javascript.plainenglish.io/guide-to-the-express-response-object-sending-things-2defae78d53c