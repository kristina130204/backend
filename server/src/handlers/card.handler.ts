import type { Socket } from "socket.io";

import { CardEvent } from "../common/enums/enums";
import { Card } from "../data/models/card";
import { SocketHandler } from "./socket.handler";
import { logger } from "../logger/logger";
import { List } from "../data/models/list";

class CardHandler extends SocketHandler {

  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.RENAME, this.renameCard.bind(this));
    socket.on(
      CardEvent.CHANGE_DESCRIPTION,
      this.changeCardDescription.bind(this)
    );
    socket.on(CardEvent.DUPLICATE, this.duplicateCard.bind(this));
    // PATTERN: Memento
    socket.on("undo", this.undo.bind(this));
    socket.on("redo", this.redo.bind(this));
  }

  public createCard(listId: string, cardName: string): void {
    // PATTERN: Memento
    this.saveState();
    const newCard = new Card(cardName, "");
    const lists = this.db.getData();

    const updatedLists = lists.map((list: List) =>
      list.id === listId ? list.setCards(list.cards.concat(newCard)) : list
    );
    this.db.setData(updatedLists);
    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Card "${cardName}" created in list #"${listId}"`);
  }

  public deleteCard(listId: string, cardId: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();

    const updatedLists = lists.map((list: List) =>
      list.id === listId
        ? list.setCards(list.cards.filter((card) => card.id !== cardId))
        : list
    );
    this.db.setData(updatedLists);
    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Card #"${cardId}" deleted in list #"${listId}"`);
  }

  public changeCardDescription(
    listId: string,
    cardId: string,
    description: string
  ): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const list = lists.find((list: List) => list.id === listId);
    const card = list.cards.find((card) => card.id === cardId);

    card.description = description;

    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Card #"${cardId}" changed description in list #"${listId}"`);
  }

  public renameCard(listId: string, cardId: string, newName: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const list = lists.find((list: List) => list.id === listId);
    const card = list.cards.find((card) => card.id === cardId);

    card.name = newName;

    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Card #"${cardId}" changed name to ${newName} in list #"${listId}"`);
  }

  // PATTERN: Prototype
  public duplicateCard(listId: string, cardId: string): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const list: List = lists.find((list: List) => list.id === listId);
    const card = list.cards.find((card) => card.id === cardId)!;

    const duplicatedCard = new Card(card.name, card.description);
    
    const updatedLists = lists.map((list: List) =>
      list.id === listId
        ? list.setCards(list.cards.concat(duplicatedCard))
        : list
    );
    this.db.setData(updatedLists);

    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Card #"${cardId}" duplicated in list #"${listId}"`);
  }

  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    // PATTERN: Memento
    this.saveState();
    const lists = this.db.getData();
    const reordered = this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
    this.db.setData(reordered);
    this.updateLists();
    // PATTERN: Observer
    logger.log('info', `Cards in list #"${destinationListId}" reordered`);
  }
}

export { CardHandler };
