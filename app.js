var express = require("express"); //引用express模块
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var path = require("path");
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//模板引擎
app.set("view engine", "ejs");
//静态服务
app.use(express.static("./public"));
var Room = [];
var usr = 0;
var socketid = new Array(1000);
var roomnum = new Array(1000);
for (var i = 0; i < 1000; i++) {
    roomnum[i] = 0;
    Room[i] = i;
}

//确认登陆，检查此人是否有用户名，并且昵称不能重复
app.get("/add", function (req, res, next) {
    var room = parseInt(req.query.room);
    if (!room) {
        res.send("必须填写房间"+room);
        return;
    }
    if (room < 0 || room > 10000) {
        res.send("房间号应在0~1000之间");
        return;
    }
    if (Room.indexOf(room) == -1) {
        res.send("房间不存在");
        return;
    }
    if (roomnum[room] > 1) {
        res.send("房间已满");
        return;
    }
    Room.push(room);
    roomnum[room]++;
    //付给session
    req.session.usrname = usr;
    usr = usr + 1;
    req.session.room = room;
    res.redirect("/chat");
});
app.get("/chat", function (req, res, next) {
    if (!req.session.room) {
        res.redirect("/");
        return;
    }
    res.redirect("/chat.html");
});
app.get("/usr", function (req, res, next) {
    res.json({ 
        "room": req.session.room,   //游戏房间
        "usrname": req.session.usrname,     //房间中的用户名
        "roomnum": roomnum[req.session.room]    //当前在房间中的用户数量
    });
});

app.get("/check", function (req, res, next) {
    var Null = [];
    for (var m = 0; m < roomnum.length; m++) {
            Null.push(m);
    }
    res.json({
        "Null": Null
    });
});
server.listen("3000", function () {
    console.log("正在监听端口 3000");
});
var io = require('socket.io')(server);
//监听连接事件
io.on("connection", function (socket) {
    socket.on("hua", function (msg) {
        msg.roomnum = roomnum[msg.room];
        io.emit("huida", msg);
        console.log(msg);
    });
    socket.on("num", function (msg) {
        io.emit("num", msg);
    });
});
