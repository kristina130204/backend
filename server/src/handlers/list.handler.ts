import type { Socket } from "socket.io";

import { ListEvent } from "../common/enums/enums";
import { List } from "../data/models/list";
import { SocketHandler } from "./socket.handler";
import { logger } from "../logger/logger";

class ListHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
    socket.on(ListEvent.RENAME, this.renameList.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
    // PATTERN: Memento
    socket.on("undo", this.undo.bind(this));
    socket.on("redo", this.redo.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    callback(this.db.getData());
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const reorderedLists = this.reorderService.reorder(
      lists,
      sourceIndex,
      destinationIndex
    );
    this.db.setData(reorderedLists);
    this.updateLists();
    // PATTERN: Observer
    logger.log(
      "info",
      `List reordered from ${sourceIndex} index to ${destinationIndex} index`
    );
  }

  private renameList(id: string, newName: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const list = lists.find((list) => list.id === id);
    list.name = newName;
    this.updateLists();
    // PATTERN: Observer
    logger.log("info", `List #"${id}" renamed to "${newName}"`);
  }

  private createList(name: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const newList = new List(name);
    this.db.setData(lists.concat(newList));
    this.updateLists();
    // PATTERN: Observer
    logger.log("info", `List "${name}" created"`);
  }

  private deleteList(id: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    this.db.setData(lists.filter((list) => list.id !== id));
    this.updateLists();
    // PATTERN: Observer
    logger.log("info", `List #"${id}" deleted`);
  }
}

export { ListHandler };
