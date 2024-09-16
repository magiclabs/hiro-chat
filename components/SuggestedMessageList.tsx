import { Button } from "./ui/button";

const buttonMessages: string[] = [
  "What can you do?",
  "Can you transfer?",
  "Can you swap eth for usdc?",
  "Can you swap 1 ETH for USDC for address 0x1 the deadline is 3 days from now?",
  "Can you transfer token 0x25b from 0x1 to 0x2?",
];

/**
 * Renders a list of button components with suggested messages for your convience.
 * Each button, when clicked, will trigger the `addMessage` callback.
 *
 * @function CommonMessages
 * @param {Object} props - The props for the CommonMessages component.
 * @param {string[]} [props.suggestedMessages=buttonMessages] - An optional array of suggested messages to display as buttons. Defaults to a predefined array `buttonMessages`.
 * @param {function(React.MouseEvent<HTMLButtonElement>): void} props.addMessage - A callback function to handle the button click event, receives the click event object as its argument.
 *
 * @returns {JSX.Element[] | null} A list of Button components, each displaying a message, or null if there are no messages to display.
 */
export function SuggestedMessageList({
  suggestedMessages = buttonMessages,
  addMessage,
}: {
  suggestedMessages?: string[];
  addMessage: (msg: string) => void;
}) {
  if (!suggestedMessages || !suggestedMessages.length) return null;
  return suggestedMessages.map((message, index) => (
    <Button
      key={index}
      size="sm"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        addMessage(e.currentTarget.innerHTML)
      }
    >
      {message}
    </Button>
  ));
}
