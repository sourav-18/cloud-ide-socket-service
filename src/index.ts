import { createServer } from 'node:http';
import serverEnv from "./config/serverEnv.config";
import express, { Request, Response, NextFunction } from "express";
import { Server } from 'socket.io';
import SocketServer from "./socketServer";
import redisConnection from './db/redis/connection.db';
redisConnection.getInstance();



const app = express();
const server = createServer(app);
new SocketServer(server);


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

server.listen(serverEnv.SERVER_PORT, () => {
    console.log(`Socket server listen on: ${serverEnv.SERVER_PORT}`);
});



