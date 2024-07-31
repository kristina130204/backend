import { List } from "../data/models/list";
import { Memento } from "./memento";

// PATTERN: Memento
class ConcreteMemento implements Memento {
  private state: List[];

  constructor(state: List[]) {
    this.state = state;
  }

  public getState(): List[] {
    return this.state;
  }
}

export { ConcreteMemento }