const http = require('http');
const fs = require('fs');
const url = require('url');

const rooms = [];


function PostChats(req, res){
    
    var body = '';
    req.on('data',function (data){
        body += data;
        if(body.lenght > 1000000)
            req.connection.destroy();

        console.log(JSON.parse(body));
    });


    req.on('end',function(){
        var bodyJson = JSON.parse(body);

        const { nickname, room } = bodyJson;

    
        const index = rooms.findIndex((chat) => chat.room === room);

        console.log(index);

        if(index !== -1) {
            const checkIfUserAlreadyExists = rooms[index].users.find(
                (user) => user === nickname
              );
            if (checkIfUserAlreadyExists){
                res.writeHead(418);
                res.end("Usuário já existe");
            } else rooms[index].users.push(nickname);
        } else rooms.push({room, users: Array(nickname), messages: Array() });
        
        res.writeHead(201);
        res.end(room);
    });
    
    
}

function GetChats(res) {
    fs.readFile('./chat.html',function(error,file) {
        if (error)
            return;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(file, "utf-8"); 
    });
}

function PostMessages(req, res) {
    var body = '';
    req.on('data',function (data){
        body += data;
        if(body.lenght > 1000000)
            req.connection.destroy();

        console.log(JSON.parse(body));
    });
    
    req.on('end',function(){
        var bodyJson = JSON.parse(body);

        const { nickname, room, message } = bodyJson;

    
        const index = rooms.findIndex((chat) => chat.room === room);

        console.log(index);

        const messageString = `${nickname}: ${message}`;

        rooms[index].messages.push(messageString);
        
        res.writeHead(201);
        res.end();
    });
}

function GetMessages(req, res) {
    let paddr = url.parse(req.url, true);

    let room = paddr.query.room;

    const index = rooms.findIndex((chat) => chat.room === room);

    const messages = rooms[index].messages;

    //messages.push("user: message");

    messageString = messages.join('\n\n');

    res.writeHead(200);

    res.end(messageString);
}

http.createServer(function(req,res) {
    var paddr = url.parse(req.url, true);

    if(paddr.pathname === '/chats'){
        if(req.method === 'GET'){
            GetChats(res);
        } else if (req.method ==='POST'){
            PostChats(req,res);
        }
    } else if(paddr.pathname === '/messages'){
        if(req.method === 'GET'){
            GetMessages(req, res);
        } else if (req.method ==='POST'){
            PostMessages(req, res);
        }
    } 
    else {
        fs.readFile('./index.html',function(error,file) {
            console.log("Inicio");
            if (error)
                return;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(file, "utf-8"); 
        });
    }

}).listen(8080)

