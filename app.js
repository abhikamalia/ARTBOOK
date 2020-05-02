const express = require('express');
const appController = require('./controllers/appController');
const app = express();


app.set('view engine' , 'ejs');

app.use(express.static('./public'));

appController(app);


app.listen('3000' , () => console.log('Server running on port 3000...'));