
///FUNCTIONS

function play(name, newdotsMax, points){
    if(points!=0){
        let thisp = playersArray[turn];
        thisp.score+=points;
        let pscore = thisp.score;
        $('#score').html(pscore);
        $('#p'+turn).html(thisp.name+': '+pscore);
    }

    dotsArray[dotsMax+newdotsMax-5].end = true;
    // if(combo===false) dotsArray[dotsMax+newdotsMax-5].end = true;
    // else dotsArray[dotsMax+newdotsMax-5].end = 'next';
    dotsMax+=newdotsMax;
    dotsArray.length = dotsMax-4;

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
}

//CANVAS
$(function() {
    var c = document.querySelector('canvas');
    var ctx = c.getContext('2d');
    c.width = 300;
    c.height = 300;
    let mouse = {
        x: 150,
        y: 150
    };

    $('#c').mousemove(function(e) {
        var rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    $('#c').click(function(e) {
        let w = 0;
        let c = 0
        if(mouse.y<=60) w = 1;
        else if(mouse.y<=120) w = 2;
        else if(mouse.y<=180) w = 3;
        else if(mouse.y<=240) w = 4;
        else w = 5;
        if(mouse.x<=60) c = 1;
        else if(mouse.x<=120) c = 2;
        else if(mouse.x<=180) c = 3;
        else if(mouse.x<=240) c = 4;
        else c = 5;

        if(dotsArray.length<dotsMax){
            let color = playersArray[turn].c;
            let tileId = (w-1)*board+c-1;
            dotsArray.push(new Dot(tileId, false, (c*60)-34, (w*60)-34, 8, color));

            if(onz==true && dotsArray.length==dotsMax-1){
                let id1 = dotsArray[dotsMax-4].tileId;
                let id2 = dotsArray[dotsMax-3].tileId;
                let id3 = dotsArray[dotsMax-2].tileId;
                //DOUBLE LINE BLOCK
                let lineBlock = false;
                for(i=0; i<linesArray.length; i++){
                    for(j=0; j<3; j++){
                        if(id1==linesArray[i][j%3] && id2==linesArray[i][(j+1)%3] && 
                        id3==linesArray[i][(j+2)%3]) lineBlock = true;
                    }
                }
                if(lineBlock==false){
                    let t1 = tilesArray[id1];
                    let t2 = tilesArray[id2];
                    let t3 = tilesArray[id3];
                    let xdistance = t1.c-t2.c;
                    let ydistance = t1.w-t2.w;
                    //3 W LINII CHECK
                    if(xdistance>=-1 && xdistance<=1 && ydistance >=-1 && ydistance<=1 &&
                    t2.c-xdistance==t3.c &&t2.w-ydistance==t3.w){
                        //ONZ CHECK
                        if(t1.l=="O" && t2.l=="N" && t3.l=="Z"){
                            console.log("ONZ");
                            linesArray.push([id1,id2,id3]);
                            play("onz", 3, 1);
                        }
                    }
                }
            } else if(dotsArray.length==dotsMax){
                let id1 = dotsArray[dotsMax-4].tileId;
                let id2 = dotsArray[dotsMax-3].tileId;
                let id3 = dotsArray[dotsMax-2].tileId;
                let id4 = dotsArray[dotsMax-1].tileId;
                let t1 = tilesArray[id1];
                let t2 = tilesArray[id2];
                let t3 = tilesArray[id3];
                let t4 = tilesArray[id4];
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
                    for(i=0; i<linesArray.length; i++){
                        if((id1==linesArray[i][0] && id2==linesArray[i][1] && 
                        id3==linesArray[i][2] && id4==linesArray[i][3]) ||
                        (id1==linesArray[i][3] && id2==linesArray[i][2] && 
                        id3==linesArray[i][1] && id4==linesArray[i][0])) lineBlock = true;
                    }
                    if(lineBlock==false){
                        //OZNS CHECK
                        if(t1.l=="O" && t2.l=="Z" && t3.l=="N" && t4.l=="S"){
                            console.log("OZNS");
                            linesArray.push([id1,id2,id3,id4]);
                            doubleDotsBlock = 0;
                            endThisGame = true;
                            let pletters = 1;
                            if(turn==t1.p) pletters++;
                            if(turn==t2.p) pletters++;
                            if(turn==t3.p) pletters++;
                            if(turn==t4.p) pletters++;
                            play("ozns", 4, pletters);
                        }
                        //KOLOR CHECK
                        if(color4==true && t1.p!==undefined && t2.p==t1.p && t3.p==t1.p && t4.p==t1.p){
                            console.log("COLOR");
                            linesArray.push([id1,id2,id3,id4]);
                            play("color", doubleDotsBlock, 1);
                        }
                    }
                }//COMBO CHECK
                else if(combo==true && xdistance>=-1 && xdistance<=1 && ydistance >=-1 && ydistance<=1 &&
                xdistance2>=-1 && xdistance2<=1 && ydistance2 >=-1 && ydistance2<=1 &&
                t1.c-xdistance2==t4.c && t1.w-ydistance2==t4.w){
                    //DOUBLE LINE BLOCK
                    let lineBlock = false;
                    for(i=0; i<linesArray.length; i++){
                        for(j=0; j<4; j++){
                            if((id1==linesArray[i][j%4] && id2==linesArray[i][(j+1)%4] && 
                            id3==linesArray[i][(j+2)%4] && id4==linesArray[i][(j+3)%4]) ||
                            (id1==linesArray[i][(j+3)%4] && id2==linesArray[i][(j+2)%4] && 
                            id3==linesArray[i][(j+1)%4] && id4==linesArray[i][j%4])) lineBlock = true;
                        }
                    }
                    if(lineBlock==false){
                        let cbcheck = 0;
                        let comlet = 0;
                        for(i=4; i>0; i--){
                            comlet = tilesArray[dotsArray[dotsMax-i].tileId].l;
                            if(comlet=="S") cbcheck = cbcheck+1;
                            else if(comlet=="N") cbcheck = cbcheck+10;
                            else if(comlet=="Z") cbcheck = cbcheck+100;
                            else if(comlet=="O") cbcheck = cbcheck+1000;
                        }
                        if(cbcheck==1111){
                            console.log("COMBO");
                            linesArray.push([id1,id2,id3,id4]);
                            move--;
                            play("combo", 4, 0);
                            $('#turn').css('background-color',background);
                        }
                    }
                }
            }
        } else dotsArray.length = dotsMax-4;
    });

    function Dot(tileId, end, x, y, w, c){
        this.tileId = tileId;
        this.end = end;
        this.x = x;
        this.y = y;
        this.w = w;
        this.color = c;
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
        ctx.clearRect(0, 0, c.width, c.height);

        for(var i = 0; i < dotsArray.length; i++){
            dotsArray[i].update();
            if(typeof dotsArray[i+1] !== 'undefined'){
                let x1 = dotsArray[i].x+5;
                let y1 = dotsArray[i].y+5;
                let x2 = dotsArray[i+1].x+5;
                let y2 = dotsArray[i+1].y+5;
                
                if((dotsArray[i].p == dotsArray[i+1].p)&&(dotsArray[i].end !== true)){
                    ctx.beginPath();
                    let color = dotsArray[i].color;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 4;
                    ctx.moveTo(x1-2, y1-2);
                    ctx.lineTo(x2-2, y2-2);
                    ctx.stroke();
                }
            }
        }
    }
    init();
    animate();
});