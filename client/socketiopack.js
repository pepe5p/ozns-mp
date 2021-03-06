
var socket = io();

socket.on('serverMsg', function(data){
    console.log(data.msg);
});
socket.on('showMeYourId', function(){passId();});
// socket.on('sendPing', function(){
//     console.log("ping");
//     socket.emit('sendPong');
// });

var pcid = getCookie("pcid");
if (pcid == null) {
    document.cookie = "pcid="+Math.random();
    var pcid = getCookie("pcid");
}
function passId(){
    socket.emit('passId',{
        pcid: pcid
    });
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}
passId();