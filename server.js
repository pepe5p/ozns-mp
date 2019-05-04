
//KOLORKI
const red = "#ff6666";
const dred = "#882222";
const blue = "#6666ff";
const dblue = "#222288";
const green = "#559955";
const dgreen = "#225522";
const yellow = "rgb(179, 170, 54)";
const dyellow = "rgb(109, 105, 25)";
const pink = "rgb(185, 68, 146)";
const dpink = "rgb(100, 27, 76)";
const colors = [red, blue, green, yellow, pink];
const dcolors = [dred, dblue, dgreen, dyellow, dpink];
//

var PORT = process.env.PORT || 2000;
const express = require('express');
var app = require('express')();
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/homepage.html')
});
app.use('/', express.static(__dirname + '/client'));

serv.listen( PORT, function() {
    console.log( 'Node server is running on port ' + PORT);
});

var gamesArray = [];
function Game(p, player1, b, onz, color, combo, cards){
	this.pn = p;
	this.playersArray = [player1];
    this.board = parseInt(b);
    this.onz = onz;
    this.color = color;
    this.combo = combo;
    this.cards = cards;
}
function Player(id, name, c, dc, al, score){
    this.id = id;
    this.name = name;
    this.c = c;
    this.dc = dc;
    this.al = al;
    this.score = score;
}
function Tile(x, y, player, letter){
    this.x = x;
    this.y = y;
    this.p = player;
    this.l = letter;
}

function startGame(gameid){
    console.log('game '+gameid+" started");
    let g = gamesArray[gameid];

    g.endThisGame = false;
    g.whoStarts = 0;
    g.turn = 0;
    g.dotsMax = 4;
    g.move;
    g.moves;
    //TO JUŻ JEST I TYLKO DODAJESZ KOLORY 
    //-> g.playersArray = [];
    g.tilesArray = [];
    g.dotsArray = [];
    g.linesArray = [];

    //PRZYPISANIE KOLORÓW
    for(i=0; i<g.pn; i++){
        g.playersArray[i].c = colors[i%5];
        g.playersArray[i].dc = dcolors[i%5];
    }
    
    var y = 0;
    for(i=0; i<(g.board*g.board); i++){
        if((i%g.board)==0) y++;
        let x = i%g.board+1;
        g.tilesArray.push(new Tile(x, y, undefined, undefined));
    }

    g.init = function(){
        g.move = 0;
        g.moves = 0;
        for(i=0; i<(g.board*g.board); i++){
            g.tilesArray[i].p = undefined;
            g.tilesArray[i].l = undefined;
        }
    }
    g.writeLet = function(pindex, x, y){
        if(pindex==g.turn){
            var letter = g.playersArray[g.turn].al;
            let tileindex = x-1+((y-1)*g.board);
            let tiles = g.tilesArray;

            if(tiles[tileindex].l===undefined)
            {
                x = parseInt(x);
                y = parseInt(y);
                var check = [];
                let everythingOK = 0;

                //TOP
                if(tiles.indexOf(tiles[tileindex-g.board])>-1){
                    check[0] = tiles[tileindex-g.board].l;
                    if(check[0]===undefined) check[0] = "gitara";
                }
                //RIGHT
                if(tiles.indexOf(tiles[tileindex+1])>-1 && x<g.board){
                    check[1] = tiles[tileindex+1].l;
                    if(check[1]===undefined) check[1] = "gitara";
                }
                //BOTTOM
                if(tiles.indexOf(tiles[tileindex+g.board])>-1){
                    check[2] = tiles[tileindex+g.board].l;
                    if(check[2]===undefined) check[2] = "gitara";
                }
                //LEFT
                if(tiles.indexOf(tiles[tileindex-1])>-1 && x-1>0){
                    check[3] = tiles[tileindex-1].l;
                    if(check[3]===undefined) check[3] = "gitara";
                }

                //ANGLE ANTI BLOCK OR //BLOCK
                var ablockcheck = 0;
                for(i=0; i<4; i++){
                    if(check[i]==letter){
                        ablockcheck++;
                    }
                }
                if(ablockcheck>=3) everythingOK = 1;
                else if(ablockcheck==0) everythingOK = 1;
                else everythingOK = 0;

                //CIRCLE ANTI BLOCK
                var cbcheck = 0;
                var comlet = 0;
                for(i=0; i<4; i++){
                    comlet = check[i];
                    if(comlet=="S") cbcheck = cbcheck+1;
                    else if(comlet=="N") cbcheck = cbcheck+10;
                    else if(comlet=="Z") cbcheck = cbcheck+100;
                    else if(comlet=="O") cbcheck = cbcheck+1000;
                }
                if(cbcheck==1111) everythingOK = 1;

                //CHECK NUMBER OF MOVES
                if(g.move>0) everythingOK = 0;

                if(everythingOK == 1){
                    tiles[tileindex].l = letter;
                    tiles[tileindex].p = g.turn;
                    g.move++;
                    g.moves++;
                    for(var i in g.playersArray){
                        let socket = socketsList[g.playersArray[i].id];
                        let outOfMoves = false;
                        if(g.move>0 && i==g.turn) outOfMoves = true;
                        socket.emit('newLetter',{
                            l: letter,
                            c: g.playersArray[g.turn].c,
                            x: x,
                            y: y,
                            oom: outOfMoves
                        });
                    }
                }
            }
        }
    }
    g.nextTurn = function(pindex){
        if(pindex==g.turn && g.move==1){

            let nturn;
            if(g.turn+1==g.pn) g.turn = 0;
            else g.turn++;
            if(g.turn+1==g.pn) nturn = 0;
            else nturn = g.turn+1;
            
            g.dotsArray.length = g.dotsMax-4;
            g.move = 0;

            for(var i in g.playersArray){
                let socket = socketsList[g.playersArray[i].id];
                socket.emit('changeTurn',{
                    aturn: g.turn,
                    nturn: nturn
                });
            }

            if(g.moves==g.board*g.board || g.endThisGame==true) g.endGame();
        }
    }
    g.endGame = function(){
        g.endThisGame = false;
        g.dotsArray.length = 0;
        g.linesArray.length = 0;
        g.dotsMax = 4;
        g.whoStarts = (g.whoStarts+1)%g.pn;
        g.turn = g.whoStarts;
        for(var i in g.playersArray){
            let socket = socketsList[g.playersArray[i].id];
            socket.emit('endGame');
        }
        g.init();
    }

    g.init();
}

var socketsList = [];
var io = require('socket.io')(serv);
io.sockets.on('connection', function(socket){
    //START
    socket.emit('serverMsg',{
        msg:'connect with server'
    });
    socket.on('passId',function(data){
        socket.id = data.pcid;
        socketsList[socket.id] = socket;
        console.log("socket connection id = "+socket.id);
    })
    socket.on('disconnect',function(){
        // setTimeout(function(){
        //     if(socketsList[socket.id][1]==) delete socketsList[socket.id];
        // },2000);
        // socket.removeAllListeners();
        console.log("socket disconnect id: "+socket.id);
    })

    //GAMES
    socket.on('createGame', function(data){
        gamesArray.push(new Game(data.p, new Player(socket.id, data.player1, undefined, undefined, "O", 0), data.board, data.onz, data.color, data.combo, data.cards));
        let gameindex = gamesArray.map(function(e) { return e.playersArray[0].id; }).indexOf(socket.id);
        
        socket.emit('getYoursGameId',{
			gameindex: gameindex
		});
        console.log("game successfully created with id: "+gameindex);
	});
	socket.on('joinGame', function(data){
        let g = gamesArray[data.gameid];
		g.playersArray.push(new Player(socket.id, data.newplayer, undefined, undefined, "O", 0));
        console.log("player joined to game: "+data.gameid);
        for(var i in g.playersArray){
            let socket = socketsList[g.playersArray[i].id];
            socket.emit('newPlayerInYourGame',{
                gameid: data.gameid,
                newplayer: data.newplayer
            });
        }
        if(g.playersArray.length==g.pn) startGame(data.gameid);
	});
	socket.on('showGames', function(data){
        if(data.all == true){
            socket.emit('getGames',{
                msg: gamesArray
            });
        } else {
            socket.emit('getGames',{
                msg: gamesArray[data.index]
            });
        }
    });
    socket.on('setLet', function(data){
        //UWAGA NA CHEATERÓW / DODAJ SE TU JESZCZE PLAYERID
        gamesArray[data.gameid].playersArray[data.pindex].al = data.letter;
    });
    socket.on('writeLet', function(data){
        //UWAGA NA CHEATERÓW
        gamesArray[data.gameid].writeLet(data.pindex, data.x, data.y);
    });
    socket.on('nextTurn', function(data){
        //UWAGA NA CHEATERÓW
        gamesArray[data.gameid].nextTurn(data.pindex);
    });
});