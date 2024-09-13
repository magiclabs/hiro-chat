import { Button } from "./ui/button";

const buttonMessages = [
  "What can you do?",
  "Can you transfer?",
  "Can you swap eth for usdc?",
  "Can you swap 1 ETH for USDC for address 0x1 the deadline is 3 days from now?",
  "Can you transfer token 0x25b from 0x1 to 0x2?",
];

export function CommonMessages({
  addMessage,
}: {
  addMessage: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return buttonMessages.map((message, index) => (
    <Button key={index} size="sm" onClick={addMessage}>
      {message}
    </Button>
  ));
}
