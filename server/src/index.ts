import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { lists } from "./assets/mock-data";
import { Database } from "./data/database";
import { CardHandler, ListHandler } from "./handlers/handlers";
import { ReorderService, ReorderServiceProxy } from "./services/reorder.service";
import { FileSubscriber } from "./logger/fileSubscribe";
import { ConsoleSubscriber } from "./logger/consoleSubscriber";
import { logger } from "./logger/logger";

const PORT = 3005;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const db = Database.Instance;
const reorderService = new ReorderService();
// PATTERN: Proxy
const reorderServiceProxy = new ReorderServiceProxy(reorderService)

if (process.env.NODE_ENV !== "production") {
  db.setData(lists);
}

const onConnection = (socket: Socket): void => {
  // PATTERN: Proxy
  new ListHandler(io, db, reorderServiceProxy).handleConnection(socket);
  new CardHandler(io, db, reorderServiceProxy).handleConnection(socket);
};

const fileSubscriber = new FileSubscriber("events.log");
const consoleSubscriber = new ConsoleSubscriber();

logger.subscribe(fileSubscriber);
logger.subscribe(consoleSubscriber);

io.on("connection", onConnection);

httpServer.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

export { httpServer };
