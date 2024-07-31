import { Card } from "../data/models/card";
import { List } from "../data/models/list";
import { logger } from "../logger/logger";

class ReorderService {
  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const card = items[startIndex];
    const listWithRemoved = this.remove(items, startIndex);
    const result = this.insert(listWithRemoved, endIndex, card);

    return result;
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    const target: Card = lists.find((list) => list.id === sourceListId)
      ?.cards?.[sourceIndex];

    if (!target) {
      return lists;
    }

    const newLists = lists.map((list) => {
      if (list.id === sourceListId) {
        list.setCards(this.remove(list.cards, sourceIndex));
      }

      if (list.id === destinationListId) {
        list.setCards(this.insert(list.cards, destinationIndex, target));
      }

      return list;
    });

    return newLists;
  }

  private remove<T>(items: T[], index: number): T[] {
    return [...items.slice(0, index), ...items.slice(index + 1)];
  }

  private insert<T>(items: T[], index: number, value: T): T[] {
    return [...items.slice(0, index), value, ...items.slice(index)];
  }
}

// PATTERN: Proxy
class ReorderServiceProxy {
  private reorderService: ReorderService;

  constructor(reorderService: ReorderService) {
    this.reorderService = reorderService;
  }

  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    logger.log(
      "info",
      `Calling method: "reorder" with parameters: ${JSON.stringify({
        items,
        startIndex,
        endIndex,
      })}`
    );
    return this.reorderService.reorder(items, startIndex, endIndex);
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    logger.log(
      "info",
      `Calling method: "reorderCards" with parameters: ${JSON.stringify({
        lists,
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      })}`
    );
    return this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
  }
}

export { ReorderService, ReorderServiceProxy };
