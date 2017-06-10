'use strict';

/*
Script NodeJs Adaptado por Juscilan Moreto
Responsavel por implementar rotas e socket.io server
2016 © - juscilan.com‎
*/

const express = require("express"),
    port = process.env.PORT || 3000,
    fs = require('fs'),
    app = express(),
    io = require('socket.io').listen(app.listen(port)),
    http = require('http'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
var request = require('request');

app.use(bodyParser.json());

let sessionState;

//Servir o html estático
app.get("/", (req, res) => {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        res.writeHead(200);
        res.end(data);
    });
});

//Post para gravar a session ID na variavel
app.post("/", (req, res) => {
    sessionState = JSON.stringify(req.body);
    res.writeHead(200);
    res.end('Set ok');
});

// GET /:id Resetar a Variavel sessionState
app.get("/:id", (req, res) => {
    if (req.params.id == 'reset') {
        sessionState = JSON.stringify({});
        res.writeHead(200);
        res.end('Reset ok');
    } else {
        res.writeHead(404);
        res.end('File not found');
    }
});

// Iniciando Socket Server
io.on('connection', (socket) => {

    // Manter estado das acoes
    socket.on('sendreq', (data) => {
        sessionState = JSON.stringify(data);
    });

    // Executa a ação
    socket.on('ExecAction', (data) => {
        sessionState = JSON.stringify(data);
        socket.broadcast.emit('ExecActionRes', data);
        //console.log("dt2 =" + sessionState);
        if (data.ledon){
            console.log("on =" + data.ledon);
            //request.post('http://rmalfer.ddns.net:3012/ledon', {form:{key:'value'}});
            request('http://rmalfer.ddns.net:3012/ledon', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) // Print the google web page.
                }
            });
         } else {
            console.log("off =" + data.ledon);
            //request.post('http://rmalfer.ddns.net:3012/ledoff', {form:{key:'value'}});
            request('http://rmalfer.ddns.net:3012/ledoff', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) // Print the google web page.
                }
            });    
        }
        
    });

    //Agum navegador entrou no socket? Envia page load
    if (sessionState) {
        socket.emit('isServer', JSON.parse(sessionState));
    } else {
        sessionState = JSON.stringify({});
        socket.emit('isServer', sessionState);
    }
});

console.log('Running port ' + port)
