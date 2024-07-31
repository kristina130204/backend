import { List } from "../data/models/list";

// PATTERN: Memento
interface Memento {
  getState(): List[];
}

export { Memento }