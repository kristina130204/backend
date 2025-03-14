import type {
  DraggableLocation,
  DroppableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import React, { useContext, useEffect, useState } from "react";

import { CardEvent, ListEvent } from "../common/enums/enums";
import { type List } from "../common/types/types";
import { Column } from "../components/column/column";
import { ColumnCreator } from "../components/column-creator/column-creator";
import { SocketContext } from "../context/socket";
import { reorderService } from "../services/reorder.service";
import { Container } from "./styled/container";

export const Workspace = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  const socket = useContext(SocketContext);

  // PATTERN: Memento
  const handleKeydownEvent = (e: globalThis.KeyboardEvent) => {
    keysPressed.add(e.key);
    setKeysPressed(keysPressed);
    if(keysPressed.has('Control') && keysPressed.has('z')){
      socket.emit("undo");
    }
    if(keysPressed.has('Control') && keysPressed.has('y')){
      socket.emit("redo");
    }
  };

  // PATTERN: Memento
  const handleKeyupEvent = (e: globalThis.KeyboardEvent) => {
    keysPressed.delete(e.key);
    setKeysPressed(keysPressed);
  };

  // PATTERN: Memento
  const handleKeyboard = () => {
    document.addEventListener("keydown", (e) => handleKeydownEvent(e));
    document.addEventListener("keyup", (e) => handleKeyupEvent(e));
  };

  // PATTERN: Memento
  const removeEventListeners = () => {
    document.removeEventListener("keydown", (e) => handleKeydownEvent(e));
    document.removeEventListener("keyup", (e) => handleKeyupEvent(e));
  };

  useEffect(() => {
    socket.emit(ListEvent.GET, (lists: List[]) => setLists(lists));
    socket.on(ListEvent.UPDATE, (lists: List[]) => setLists(lists));
    handleKeyboard();
    return () => {
      socket.removeAllListeners(ListEvent.UPDATE).close();
      removeEventListeners();
    };
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const source: DraggableLocation = result.source;
    const destination: DraggableLocation = result.destination;

    const isNotMoved =
      source.droppableId === destination.droppableId &&
      source.index === destination?.index;

    if (isNotMoved) {
      return;
    }

    const isReorderLists = result.type === "COLUMN";

    if (isReorderLists) {
      setLists(reorderService.reorderLists(lists, source.index, destination.index));
      socket.emit(ListEvent.REORDER, source.index, destination.index);

      return;
    }

    setLists(reorderService.reorderCards(lists, source, destination));
    socket.emit(CardEvent.REORDER, {
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });
  };

  return (
    <React.Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Container
              className="workspace-container"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lists.map((list: List, index: number) => (
                <Column
                  key={list.id}
                  index={index}
                  listName={list.name}
                  cards={list.cards}
                  listId={list.id}
                />
              ))}
              {provided.placeholder}
              <ColumnCreator
                onCreateList={(listName) => {
                  socket.emit(ListEvent.CREATE, listName);
                }}
              />
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </React.Fragment>
  );
};
