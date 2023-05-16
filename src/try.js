require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoString = process.env.db_connect;
const { router } = require('./routes/routes');
const path = require('path');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');


mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
    console.log(mongoString)
})

const app = express();

app.use(cors());
app.use(express.json());

// app.use(express.static("public"));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/api', router);

app.use('*', (req, res) => {
    res.status(404);
})

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.log(err);
    res.status(err.status || 500);
    res.send('error');
});

const bcrypt = require('bcrypt')

const port = process.env.TOKEN_SERVER_PORT





