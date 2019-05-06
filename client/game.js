
var writelet;

$(function() {
    //INIT
    const background = "rgb(3, 0, 10)";

    var gameGot = false;
    var pindex;
    var gameindex = getCookie("gameindex");
    if (gameindex == null) window.location = "homepage.html";
    var g;
    var tilewidth;

    var canvas = false;
    var c = document.querySelector('canvas');
    var ctx = c.getContext('2d');
    c.width = 300;
    c.height = 300;
    let mouse = {
        x: 150,
        y: 150
    };

    //SOCKET.IO
    socket.emit('showGames',{
        all: false,
        index: gameindex
    });
    socket.on('getGames', function(data){
        g = data.msg;
        tilewidth = c.width/g.board;
        let players = g.playersArray;
        let board = g.board;

        var y = 0;
        for(i=0; i<(board*board); i++){
            if((i%board)==0) y++;
            let x = (i%board)+1;
            let tilelet = g.tilesArray[i].l;
            $("#board > .flexbox").append('<div class="tile" name="x'+x+'y'+y+'" onclick="writelet('+x+','+y+')"></div>');
            if(tilelet!==undefined) {
                let t = $("[name='x"+x+"y"+y+"']");
                t.html(tilelet);
                t.css('color', g.playersArray[g.tilesArray[i].p].c);
            }
        }
        
        $('.aplayer').html(players[g.turn].name);
        $('.aplayer').css('color', players[g.turn].c);
        if(g.turn+1==g.pn) nturn = 0;
        else nturn = g.turn+1;
        $('.nplayer').html(players[nturn].name);
        $('.nplayer').css('color', players[nturn].c);

        for(i=0; i<players.length; i++){
            $('.players').append('<div class="tablerow">'
            +'<div class="rowname" style="color: '+players[i].c+'">'+players[i].name+'</div>'
            +'<div id="p'+i+'" class="rowvalue" style="color: '+players[i].c+'">'+players[i].score+'</div>'
            +'</div>');

            if(players[i].id==pcid) {
                pindex = i;
                $('.letters').css('background-color', players[i].c);
                $('#score').html(players[i].score);
            }
        }

        if(g.onz==true) $('input[name="onz"]').prop("checked", true);
        if(g.color4==true) $('input[name="color"]').prop("checked", true);
        if(g.combo==true) $('input[name="combo"]').prop("checked", true);
        if(g.cards==true) $('input[name="cards"]').prop("checked", true);

        gameGot = true;
    });
    socket.on('newLetter', function(data){
        g.move++;
        let tile = $('.tile[name="x'+data.x+'y'+data.y+'"]');
        tile.html(data.l);
        tile.css('color', data.c);
        if(data.oom==true && g.move==1) $('#turn').css('background-color', g.playersArray[pindex].c);
    });
    socket.on('newDot', function(data){
        g.dotsArray.push(new Dot(data.end, data.x, data.y, data.c, data.w));
    });
    socket.on('breakDots', function(){
        g.dotsArray.length = g.dotsMax-4;
    });
    socket.on('changeTurn', function(data){
        $('#turn').css('background-color', background);
        $('.aplayer').html(g.playersArray[data.aturn].name);
        $('.aplayer').css('color', g.playersArray[data.aturn].c);
        $('.nplayer').html(g.playersArray[data.nturn].name);
        $('.nplayer').css('color', g.playersArray[data.nturn].c);
        
        g.turn = data.aturn;
        g.move = 0;
        g.dotsArray.length = g.dotsMax-4;

        if(data.aturn==pindex) play("yourturn", 0, 0);
    });
    socket.on('newPlay', function(data){
        play(data.name, data.newdotsMax, data.points);
    });
    socket.on('combo', function(){
        g.move--;
        $('#turn').css('background-color', background);
    });
    socket.on('endGame', function(data){
        g.dotsArray.length = 0;
        g.turn = data.turn;
        $("#board > .flexbox").children(".tile").empty();
    });
    socket.on('closeGame', function(){
        window.location = "homepage.html";
    });

    //FUNCTIONS
    function showcanv(){
        if(canvas==true) {
            $('#canv').css('background-color', background);
            $('#canvbox').css('display', 'none');
            canvas = false;
        } else {
            $('#canv').css('background-color', g.playersArray[pindex].c);
            $('#canvbox').css('display', 'block');
            canvas = true;
        }
    }
    function setlet(e){
        let l = $(e).text();
        if(l=="O" || l=="Z" || l=="N" || l=="S"){
            socket.emit('setLet',{
                pindex: pindex,
                gameindex: gameindex,
                letter: l
            });
            $('.letters').css('background-color', g.playersArray[pindex].c);
            $(e).css('background-color', g.playersArray[pindex].dc);
        }
    }
    writelet = function(x, y){
        socket.emit('writeLet',{
            pindex: pindex,
            gameindex: gameindex,
            x: x,
            y: y
        });
    }
    function nextturn(){
        socket.emit('nextTurn',{
            pindex: pindex,
            gameindex: gameindex
        });
    }
    function play(name, newdotsMax, points){

        let box = $('#pngbox');
        box.html('<img class="ycbox" src="img/'+name+'.png">');
        setTimeout(function(){
            box.css({'z-index': '90', 'transform': 'translate(-50%, -50%) scale(1)'});
            setTimeout(function(){
                box.css('transform', 'translate(-50%, -50%) scale(0.05)');
                setTimeout(function(){
                    box.html('');
                    box.css('z-index', '-1');
                },100);
            },1500);
        },100);

        if(points!=0){
            let thisp = g.playersArray[g.turn];
            thisp.score+=points;
            let pscore = thisp.score;
            if(g.turn==pindex) $('#score').html(pscore);
            $('#p'+g.turn).html(pscore);
        }
        if(name!="yourturn"){
            g.dotsArray[g.dotsMax+newdotsMax-5].end = true;
            // if(combo===false) g.dotsArrayArray[dotsMax+newdotsMax-5].end = true;
            // else g.dotsArrayArray[dotsMax+newdotsMax-5].end = 'next';
            g.dotsMax+=newdotsMax;
            g.dotsArray.length = g.dotsMax-4;
        }
    }
    function Dot(end, x, y, c, w){
        this.end = end;
        this.x = x;
        this.y = y;
        this.color = c;
        this.w = w;
        this.update = function(){
            this.draw();
        };
        this.draw = function(){
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y ,this.w, this.w);
        };
    }
    function animate(){
        requestAnimationFrame(animate);
        if(gameGot==true){
            ctx.clearRect(0, 0, c.width, c.height);
            for(var i = 0; i < g.dotsArray.length; i++){
                g.dotsArray[i].update();
                if(typeof g.dotsArray[i+1] !== 'undefined'){
                    let x1 = g.dotsArray[i].x+5;
                    let y1 = g.dotsArray[i].y+5;
                    let x2 = g.dotsArray[i+1].x+5;
                    let y2 = g.dotsArray[i+1].y+5;
                    
                    if((dots[i].p == g.dotsArray[i+1].p)&&(dots[i].end !== true)){
                        ctx.beginPath();
                        let color = g.dotsArray[i].color;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 4;
                        ctx.moveTo(x1-2, y1-2);
                        ctx.lineTo(x2-2, y2-2);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    //EVENT LISTENERS
    $(".letters").click(function(){
        setlet(this);
    });
    $("#canv").click(showcanv);
    $("#turn").click(nextturn);
    $('#c').mousemove(function(e) {
        var rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    $('#c').click(function(e) {
        let x = Math.ceil((mouse.x)/tilewidth);
        let y = Math.ceil((mouse.y)/tilewidth);
        socket.emit('writeDot',{
            x: x,
            y: y,
            pindex: pindex,
            gameindex: gameindex
        });
    });
    
    animate();
});