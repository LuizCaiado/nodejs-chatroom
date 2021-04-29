const http = require('http');
const fs = require('fs');
const url = require('url');

const rooms = [];

function PostChats(req, res){
    
    //request body transfer and verification
    var body = '';
    req.on('data',function (data){
        body += data;
        if(body.lenght > 1000000)
            req.connection.destroy();

    });

    //user verifications and room creation/user push
    req.on('end',function(){
        var bodyJson = JSON.parse(body);

        const { nickname, room } = bodyJson;

        const index = rooms.findIndex((chat) => chat.room === room);

        //checks if the room exists, then if the nickname is already taken for the room input
        //nickname validation is only required if the room already exists
        if(index !== -1) {
            const checkIfUserAlreadyExists = rooms[index].users.find(
                (user) => user === nickname
              );
            if (checkIfUserAlreadyExists){
                res.writeHead(418);
                res.end("Usuário inválido");
            } else rooms[index].users.push(nickname); //username is added to the room
        } else rooms.push({room, users: Array(nickname), messages: Array() }); //new room is created
        
        res.writeHead(201);
        res.end();
    });
    
    
}

function GetChats(res) {

    //loads the chatroom screen
    fs.readFile('./chat.html',function(error,file) {
        if (error)
            return;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(file, "utf-8"); 
    });
}

function PostMessages(req, res) {

    //request body transfer and verification
    var body = '';
    req.on('data',function (data){
        body += data;
        if(body.lenght > 1000000)
            req.connection.destroy();

    });
    
    //builds message structure and pushes to messages array
    req.on('end',function(){
        var bodyJson = JSON.parse(body);

        const { nickname, room, message } = bodyJson;
  
        const index = rooms.findIndex((chat) => chat.room === room);

        const messageString = `${nickname}: ${message}`;

        rooms[index].messages.push(messageString); //message is posted on the users room
        
        res.writeHead(201);
        res.end();
    });
}

//updates the room chatbox with new messages (rooms[i].messages)
function GetMessages(req, res) {
    let paddr = url.parse(req.url, true);

    let room = paddr.query.room;

    const index = rooms.findIndex((chat) => chat.room === room);

    const messages = rooms[index].messages;

    messageString = messages.join('\n\n');

    res.writeHead(200);

    res.end(messageString);
}

//server structure
http.createServer(function(req,res) {
    var paddr = url.parse(req.url, true);

    //path and method distinction
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
    else { //loads home (index) page for any other path
        fs.readFile('./index.html',function(error,file) {
            if (error)
                return;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(file, "utf-8"); 
        });
    }

}).listen(8080)

