const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const symbols = [
    "دارا یکم",
    "شپنا",
    "غزر",
    "بگیلان",
    "آبادا",
    "دماوند",
    "ساوه",
    "خودرو",
    "خساپا",
];
const descriptions = [
    "دارایی یک",
    "پالایش نفت",
    "غلات زر ماکارون",
    "برق گیلان",
    "آبادانیا",
    "آب معدنی دماوند",
    "سیمان ساوه",
    "ایران خودرو",
    "سایپا",
];

const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getOffers = () =>{
    let list = [];
    for(let i=0;i<10;i++){
        let item = {
            price: getRandom(100000,346520),
            volume: getRandom(3450000,7212350),
            count: getRandom(10,50),
            type: getRandom(1,3)===1 ? "buy" : "sell",

        };
        list.push(item);
    }
    return list;
};

const getChart = () =>{
    let list = [];
    for(let i=0;i<10;i++){
        let item = {
            price: getRandom(1,9)
        };
        list.push(item);
    }
    return list;
};

const getStocksList = () => {
    let list = [];
    for (let i = 0; i < 9; i++) {
        var item = {
            symbol: symbols[i],
            description: descriptions[i],
            volume: getRandom(10000, 59300),
            lastPrice: getRandom(134560, 659800),
            lastPricePercent: getRandom(-10, 11),
            offers: getOffers(),
            chart : getChart()
        };
        item.value = item.volume * item.lastPrice;
        list.push(item);
    }
    return list;
};

let sahamList = [];
setInterval(()=>{
    sahamList = getStocksList();
},4000);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },

});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.emit("balance", {
        balance: (Math.floor(Math.random() * 9000) + 1000) * 100,
        taKha: (Math.floor(Math.random() * 900) + 100) * 10,
    });
    const balanceInterval = setInterval(() => {
        socket.emit("balance", {
            balance: (Math.floor(Math.random() * 9000) + 1000) * 100,
            taKha: (Math.floor(Math.random() * 900) + 100) * 10,
        });
    }, 2000);


    socket.emit("takeStockList", {
        list: sahamList.map(item=> ({...item,offers : undefined,chart : undefined}))
    });
    const takeStockListInterval = setInterval(() => {
        socket.emit("takeStockList", {
            list: sahamList.map(item=> ({...item,offers : undefined,chart : undefined}))
        });
    }, 2000);


    socket.on("join",data=>{
        socket.join(data);
    });
    socket.on("left",data=>{
        socket.leave(data);
    });


    socket.on("disconnect", data => {
        console.log("Disconnected");
        clearInterval(takeStockListInterval);
        clearInterval(balanceInterval);
    });

});
server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});


setInterval(()=>{
    for (let i=0;i<sahamList.length;i++){
        let item = {
            symbol: sahamList[i].symbol,
            description: sahamList[i].description,
            volume: sahamList[i].volume,
            lastPrice: sahamList[i].lastPrice,
            lastPricePercent: sahamList[i].lastPricePercent,
            offers : sahamList[i].offers,
            chart : sahamList[i].chart,

        };

        item.value = item.lastPrice * item.volume;

        io.to(symbols[i]).emit("takeStockDetails",item)
    }
},2000);

