import {io} from "socket.io-client";

const socket = io("http://localhost:8081", {
  auth: { /* token by jwt */ username: "bob" }
});

socket.on("connect", () => { console.log("Connected: ", socket.id);}); 

socket.on("private-message", (msg) => { console.log("from ", msg.from, " : ", msg.text);});

socket.on("user-not-found", (msg) => { console.log("User ", msg.to, " not found!");});


