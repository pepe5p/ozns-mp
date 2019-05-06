
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

var canvwidth = 300;
var dotwidth = 8;

var PORT = process.env.PORT || 2000;
const express = require('express');
var app = require('express')();
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/homepage.html')
});
app.use('/', express.static(__dirname + '/client'));

serv.listen( PORT, function() {
    console.log('\x1b[33m%s\x1b[0m', 'Node server is running on port '+PORT);
});

var gamesArray = [];
function Game(p, player1, b, onz, color4, combo, cards){
    this.status = "queue init";
	this.pn = p;
	this.playersArray = [player1];
    this.board = parseInt(b);
    this.onz = onz;
    this.color4 = color4;
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
function Dot(tileId, end, x, y, p, w){
    this.tileId = tileId;
    this.end = end;
    this.x = x;
    this.y = y;
    this.p = p;
    this.w = w;
}
function startGame(gameindex){
    console.log('\x1b[0m%s%s\x1b[34m%s\x1b[0m', 'game with index: ', gameindex, " started");
    let g = gamesArray[gameindex];

    g.status = "game init";
    g.endThisGame = false;
    g.whoStarts = 0;
    g.turn = 0;
    g.dotsMax = 4;
    g.tilewidth = canvwidth/g.board;
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
    g.play = function(name, newdotsMax, points){
        if(points!=0 && name!="combo"){
            g.playersArray[g.turn].score+=points;
            // if(combo===false) dotsArray[dotsMax+newdotsMax-5].end = true;
            // else dotsArray[dotsMax+newdotsMax-5].end = 'next';
        }
        g.dotsArray[g.dotsMax+newdotsMax-5].end = true;
        g.dotsMax+=newdotsMax;
        g.dotsArray.length = g.dotsMax-4;

        for(var i in g.playersArray){
            let socket = socketsList[g.playersArray[i].id];
            socket.emit('newPlay', {
                name: name,
                newdotsMax: newdotsMax,
                points: points
            });
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

    //CONNECTION
    socket.emit('serverMsg',{
        msg:'connect with server'
    });
    //SETTIMEOUT JAK NIE DOSTANIESZ ID TO SAM EMIT ŻEBY DAŁ
    socket.on('passId',function(data){
        // if(connected==false){
            socket.myid = data.pcid;
            socketsList[socket.myid] = socket;
            console.log('\x1b[0m%s\x1b[36m%s\x1b[0m', "socket connection id: ", socket.myid);
        // }
    })
    socket.on('disconnect', (reason) => {
        setTimeout(function(){
            if(socketsList[socket.myid]){
                if(socketsList[socket.myid].connected==false){
                    if(reason=="transport close") console.log('\x1b[0m%s\x1b[35m%s\x1b[0m', "socket disconnect id: ", socket.myid);
                    else console.log('\x1b[0m%s\x1b[31m%s\x1b[0m%s\x1b[31m%s\x1b[0m', "socket disconnect id: ", socket.myid, " ,because ", reason);
                    delete socketsList[socket.myid];
                    socket.removeAllListeners();
                }
            }
            let found = false;
            let gameindex;
            for(i=0; (found==false && i<100); i++){
                gameindex = gamesArray.map(function(e) {
                    if(e.playersArray[i]) return e.playersArray[i].id;
                    else return -1;
                }).indexOf(socket.myid);
                if(gameindex>-1) found = true;
            }
            let g = gamesArray[gameindex];
            // if(found==true){
            //     if(g.status=="queue" || g.status=="started"){
            //         for(var i in g.playersArray){
            //             if(g.playersArray[i].id!=socket.myid){
            //                 let gamesocket = socketsList[g.playersArray[i].id];
            //                 gamesocket.emit('closeGame');
            //             }
            //         }
            //         g.status = "closed";
            //         g.playersArray = [];
            //         console.log('\x1b[0m%s%s\x1b[31m%s\x1b[0m', "game with index: ", gameindex, " was aborted");
            //     }
            //     if(g.playersArray[0]){
            //         if(g.playersArray[0].id==socket.myid && g.status=="queue init") g.status = "queue";
            //     }
            //     if(g.status=="qame init") g.status = "started";
            // }
        },3000);
    })

    //GAMES
    socket.on('createGame', function(data){
        gamesArray.push(new Game(data.p, new Player(socket.myid, data.player1, undefined, undefined, "O", 0), data.board, data.onz, data.color, data.combo, data.cards));
        let gameindex = gamesArray.map(function(e) {
            if(e.playersArray[0]) return e.playersArray[0].id; 
        }).indexOf(socket.myid);
        
        socket.emit('getYoursGameIndex',{
			gameindex: gameindex
		});
        console.log('\x1b[0m%s%s\x1b[33m%s\x1b[0m', 'game with index: ', gameindex, " created");
	});
	socket.on('joinGame', function(data){
        let g = gamesArray[data.gameindex];
        if(g.playerArray!=[]){
            g.playersArray.push(new Player(socket.myid, data.newplayer, undefined, undefined, "O", 0));
            console.log('\x1b[0m%s%s\x1b[32m%s\x1b[0m', 'game with index: ', data.gameindex, " has new player");
            for(var i in g.playersArray){
                let socket = socketsList[g.playersArray[i].id];
                socket.emit('newPlayerInYourGame',{
                    gameindex: data.gameindex,
                    newplayer: data.newplayer
                });
            }
            if(g.playersArray.length==g.pn) startGame(data.gameindex);
        }
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
        gamesArray[data.gameindex].playersArray[data.pindex].al = data.letter;
    });
    socket.on('writeLet', function(data){
        //UWAGA NA CHEATERÓW
        gamesArray[data.gameindex].writeLet(data.pindex, data.x, data.y);
    });
    socket.on('nextTurn', function(data){
        //UWAGA NA CHEATERÓW
        gamesArray[data.gameindex].nextTurn(data.pindex);
    });
    socket.on('writeDot', function(data){
        //UWAGA NA CHEATERÓW
        let g = gamesArray[data.gameindex]

        if(g.turn==data.pindex){
            let x = data.x;
            let y = data.y;
            if(g.dotsArray.length<g.dotsMax){
                let tileId = (y-1)*g.board+x-1;
                let correction = (g.tilewidth/2)+(dotwidth/2)
                let canvx = (x*g.tilewidth)-correction;
                let canvy = (y*g.tilewidth)-correction;
                g.dotsArray.push(new Dot(tileId, false, canvx, canvy, g.turn, dotwidth));
                //EMIT
                for(var i in g.playersArray){
                    let socket = socketsList[g.playersArray[i].id];
                    socket.emit('newDot', {
                        end: false,
                        x: canvx,
                        y: canvy,
                        c: g.playersArray[g.turn].c,
                        w: dotwidth
                    });
                }

                let l = g.linesArray;
                if(g.onz==true && g.dotsArray.length==g.dotsMax-1){
                    let id1 = g.dotsArray[g.dotsMax-4].tileId;
                    let id2 = g.dotsArray[g.dotsMax-3].tileId;
                    let id3 = g.dotsArray[g.dotsMax-2].tileId;
                    //DOUBLE LINE BLOCK
                    let lineBlock = false;
                    for(i=0; i<l.length; i++){
                        for(j=0; j<3; j++){
                            if(id1==l[i][j%3] && id2==l[i][(j+1)%3] && id3==l[i][(j+2)%3]) lineBlock = true;
                        }
                    }
                    if(lineBlock==false){
                        let t1 = g.tilesArray[id1];
                        let t2 = g.tilesArray[id2];
                        let t3 = g.tilesArray[id3];
                        let xdistance = t1.c-t2.c;
                        let ydistance = t1.w-t2.w;
                        //3 W LINII CHECK
                        if(xdistance>=-1 && xdistance<=1 && ydistance >=-1 && ydistance<=1 &&
                        t2.c-xdistance==t3.c &&t2.w-ydistance==t3.w){
                            //ONZ CHECK
                            if(t1.l=="O" && t2.l=="N" && t3.l=="Z"){
                                console.log("ONZ");
                                g.linesArray.push([id1,id2,id3]);
                                play("onz", 3, 1);
                            }
                        }
                    }
                } else if(g.dotsArray.length==g.dotsMax){
                    let id1 = g.dotsArray[g.dotsMax-4].tileId;
                    let id2 = g.dotsArray[g.dotsMax-3].tileId;
                    let id3 = g.dotsArray[g.dotsMax-2].tileId;
                    let id4 = g.dotsArray[g.dotsMax-1].tileId;
                    let t1 = g.tilesArray[id1];
                    let t2 = g.tilesArray[id2];
                    let t3 = g.tilesArray[id3];
                    let t4 = g.tilesArray[id4];
                    let xdistance = t1.c-t2.c;
                    let ydistance = t1.w-t2.w;
                    //DLA COMBA
                    let xdistance2 = t2.c-t3.c;
                    let ydistance2 = t2.w-t3.w;
                    //4 W LINII CHECK
                    if(xdistance>=-1 && xdistance<=1 && ydistance >=-1 && ydistance<=1 &&
                    t2.c-xdistance==t3.c && t2.w-ydistance==t3.w && t3.c-xdistance==t4.c && 
                    t3.w-ydistance==t4.w && (xdistance!=0 || ydistance !=0)){
                        let doubleDotsBlock = 4;
                        //DOUBLE LINE BLOCK
                        let lineBlock = false;
                        for(i=0; i<l.length; i++){
                            if((id1==l[i][0] && id2==l[i][1] && id3==l[i][2] && id4==l[i][3]) ||
                            (id1==l[i][3] && id2==l[i][2] && id3==l[i][1] && id4==l[i][0])) lineBlock = true;
                        }
                        if(lineBlock==false){
                            //OZNS CHECK
                            if(t1.l=="O" && t2.l=="Z" && t3.l=="N" && t4.l=="S"){
                                console.log("OZNS");
                                g.linesArray.push([id1,id2,id3,id4]);
                                doubleDotsBlock = 0;
                                g.endThisGame = true;
                                let pletters = 1;
                                if(g.turn==t1.p) pletters++;
                                if(g.turn==t2.p) pletters++;
                                if(g.turn==t3.p) pletters++;
                                if(g.turn==t4.p) pletters++;
                                play("ozns", 4, pletters);
                            }
                            //KOLOR CHECK
                            if(g.color4==true && t1.p!==undefined && t2.p==t1.p && t3.p==t1.p && t4.p==t1.p){
                                console.log("COLOR");
                                g.linesArray.push([id1,id2,id3,id4]);
                                play("color", doubleDotsBlock, 1);
                            }
                        }
                    }//COMBO CHECK
                    else if(g.combo==true && xdistance>=-1 && xdistance<=1 && ydistance >=-1 && ydistance<=1 &&
                    xdistance2>=-1 && xdistance2<=1 && ydistance2 >=-1 && ydistance2<=1 &&
                    t1.c-xdistance2==t4.c && t1.w-ydistance2==t4.w){
                        //DOUBLE LINE BLOCK
                        let lineBlock = false;
                        for(i=0; i<l.length; i++){
                            for(j=0; j<4; j++){
                                if((id1==l[i][j%4] && id2==l[i][(j+1)%4] && id3==l[i][(j+2)%4] && id4==l[i][(j+3)%4]) ||
                                (id1==l[i][(j+3)%4] && id2==l[i][(j+2)%4] && id3==l[i][(j+1)%4] && id4==l[i][j%4])) lineBlock = true;
                            }
                        }
                        if(lineBlock==false){
                            let cbcheck = 0;
                            let comlet = 0;
                            for(i=4; i>0; i--){
                                comlet = g.tilesArray[dotsArray[dotsMax-i].tileId].l;
                                if(comlet=="S") cbcheck = cbcheck+1;
                                else if(comlet=="N") cbcheck = cbcheck+10;
                                else if(comlet=="Z") cbcheck = cbcheck+100;
                                else if(comlet=="O") cbcheck = cbcheck+1000;
                            }
                            if(cbcheck==1111){
                                console.log("COMBO");
                                g.linesArray.push([id1,id2,id3,id4]);
                                g.move--;
                                play("combo", 4, 0);
                                $('#turn').css('background-color', background);
                            }
                        }
                    }
                }
            } else {
                g.dotsArray.length = g.dotsMax-4;
                for(var i in g.playersArray){
                    let socket = socketsList[g.playersArray[i].id];
                    socket.emit('breakDots');
                }
            }
        }
    });
});