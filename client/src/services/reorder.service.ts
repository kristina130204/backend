import type { DraggableLocation } from "@hello-pangea/dnd";

import { type Card, type List } from "../common/types/types";

export const reorderService = {
  removeCardFromList(cards: Card[], index: number): Card[] {
    return cards.slice(0, index).concat(cards.slice(index + 1));
  },

  addCardToList(cards: Card[], index: number, card: Card): Card[] {
    return cards.slice(0, index).concat(card).concat(cards.slice(index));
  },

  findCard(lists: List[], location: DraggableLocation) {
    return lists.find((list) => list.id === location.droppableId)?.cards || [];
  },

  reorderLists(items: List[], startIndex: number, endIndex: number): List[] {
    return this.reorderArray(items, startIndex, endIndex);
  },

  reorderArray<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const result = [...items];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  },

  reorderCards(
    lists: List[],
    source: DraggableLocation,
    destination: DraggableLocation
  ) {
    const current = this.findCard(lists, source);
    const next = this.findCard(lists, destination);
    const target = current[source.index];

    const isMovingInSameList = source.droppableId === destination.droppableId;

    const mapLists = (list: List, updatedCards: Card[]) =>
      list.id ===
      (isMovingInSameList ? source.droppableId : destination.droppableId)
        ? { ...list, cards: updatedCards }
        : list;

    if (isMovingInSameList) {
      const reordered = this.reorderArray(
        [...current],
        source.index,
        destination.index
      );
      return lists.map((list) => mapLists(list, reordered));
    }

    const updatedLists = lists.map((list) => {
      if (list.id === source.droppableId) {
        return mapLists(list, this.removeCardFromList(current, source.index));
      }

      if (list.id === destination.droppableId) {
        return mapLists(
          list,
          this.addCardToList(next, destination.index, target)
        );
      }

      return list;
    });

    return updatedLists;
  },
};
