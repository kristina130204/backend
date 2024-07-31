import { Server, Socket } from "socket.io";

import { ListEvent } from "../common/enums/enums";
import { Database } from "../data/database";
import { ReorderServiceProxy } from "../services/reorder.service";
import { ConcreteMemento } from "../memento/cardMemento";
import { List } from "../data/models/list";
import { Card } from "../data/models/card";

abstract class SocketHandler {
  protected db: Database;

  // PATTERN: Proxy
  protected reorderService: ReorderServiceProxy;

  protected io: Server;

  // PATTERN: Memento
  protected undoStack: ConcreteMemento[] = [];
  protected redoStack: ConcreteMemento[] = [];

  public constructor(io: Server, db: Database, reorderService: ReorderServiceProxy) {
    this.io = io;
    this.db = db;
    this.reorderService = reorderService;
  }

  public abstract handleConnection(socket: Socket): void;

  protected updateLists(): void {
    this.io.emit(ListEvent.UPDATE, this.db.getData());
  }

  // PATTERN: Memento
  protected saveState(): void {
    const state = this.db.getData();
    this.undoStack.push(new ConcreteMemento(JSON.parse(JSON.stringify(state))));
    this.redoStack = []; 
  }

  // PATTERN: Memento
  protected restoreState(memento: ConcreteMemento): void {
    const state = memento.getState();
    const recreatedState = state.map(listData => {
      const list = new List(listData.name);
      list.setCards(listData.cards.map(cardData => new Card(cardData.name, cardData.description)));
      return list;
    });
    this.db.setData(recreatedState);
    this.updateLists();
  }

  // PATTERN: Memento
  public undo(): void {
    if (this.undoStack.length > 0) {
      const currentState = new ConcreteMemento(this.db.getData());
      this.redoStack.push(currentState);

      const previousState = this.undoStack.pop();
      this.restoreState(previousState!);
    }
    
  }

  // PATTERN: Memento
  public redo(): void {
    if (this.redoStack.length > 0) {
      const currentState = new ConcreteMemento(this.db.getData());
      this.undoStack.push(currentState);

      const nextState = this.redoStack.pop();
      this.restoreState(nextState!);
    }
  }
}

export { SocketHandler };
