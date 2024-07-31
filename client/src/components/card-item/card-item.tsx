import type { DraggableProvided } from "@hello-pangea/dnd";

import { type Card } from "../../common/types/types";
import { CopyButton } from "../primitives/copy-button";
import { DeleteButton } from "../primitives/delete-button";
import { Splitter } from "../primitives/styled/splitter";
import { Text } from "../primitives/text";
import { Title } from "../primitives/title";
import { Container } from "./styled/container";
import { Content } from "./styled/content";
import { Footer } from "./styled/footer";
import { socket } from "../../context/socket";
import { CardEvent } from "../../common/enums/card-event.enum";
import { isFieldEmpty } from "../../common/helpers/checkValidField";

type Props = {
  card: Card;
  isDragging: boolean;
  provided: DraggableProvided;
  listId: string;
};

export const CardItem = ({ card, isDragging, provided, listId }: Props) => {
  return (
    <Container
      className="card-container"
      isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-is-dragging={isDragging}
      data-testid={card.id}
      aria-label={card.name}
    >
      <Content>
        <Title
          onChange={(cardName) => {
            const isCardNameEmpty = isFieldEmpty(cardName);
            if (!isCardNameEmpty) {
              socket.emit(CardEvent.RENAME, listId, card.id, cardName);
            }
          }}
          title={card.name}
          fontSize="large"
          isBold
        />
        <Text
          text={card.description}
          onChange={(description) => {
            socket.emit(
              CardEvent.CHANGE_DESCRIPTION,
              listId,
              card.id,
              description
            );
          }}
        />
        <Footer>
          <DeleteButton
            onClick={() => {
              socket.emit(CardEvent.DELETE, listId, card.id);
            }}
          />
          <Splitter />
          <CopyButton
            onClick={() => {
              socket.emit(CardEvent.DUPLICATE, listId, card.id);
            }}
          />
        </Footer>
      </Content>
    </Container>
  );
};
