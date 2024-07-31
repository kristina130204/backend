import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { Draggable } from "@hello-pangea/dnd";

import { type Card } from "../../common/types/types";
import { CardsList } from "../card-list/card-list";
import { DeleteButton } from "../primitives/delete-button";
import { Splitter } from "../primitives/styled/splitter";
import { Title } from "../primitives/title";
import { Footer } from "./components/footer";
import { Container } from "./styled/container";
import { Header } from "./styled/header";
import { CardEvent } from "../../common/enums/card-event.enum";
import { socket } from "../../context/socket";
import { ListEvent } from "../../common/enums/list-event.enum";
import { isFieldEmpty } from "../../common/helpers/checkValidField";

type Props = {
  listId: string;
  listName: string;
  cards: Card[];
  index: number;
};

export const Column = ({ listId, listName, cards, index }: Props) => {
  return (
    <Draggable draggableId={listId} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Container
          className="column-container"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Header
            className="column-header"
            isDragging={snapshot.isDragging}
            {...provided.dragHandleProps}
          >
            <Title
              aria-label={listName}
              title={listName}
              onChange={(listNewName) => {
                if (!isFieldEmpty(listNewName)) {
                  socket.emit(ListEvent.RENAME, listId, listNewName);
                }
              }}
              fontSize="large"
              width={200}
              isBold
            />
            <Splitter />
            <DeleteButton
              color="#FFF0"
              onClick={() => {
                socket.emit(ListEvent.DELETE, listId);
              }}
            />
          </Header>
          <CardsList listId={listId} listType="CARD" cards={cards} />
          <Footer
            onCreateCard={(cardName) => {
              socket.emit(CardEvent.CREATE, listId, cardName);
            }}
          />
        </Container>
      )}
    </Draggable>
  );
};
