import Box from '@mui/material/Box';
import { IContactConversation } from 'src/types/contact';
import Scrollbar from 'src/components/scrollbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import ContactMessageItem from './contact-message-item';

// ----------------------------------------------------------------------

type Props = {
  messages: IContactConversation | IContactConversation[] | null | undefined; // Single or array of messages
};

export default function ContactMessageList({ messages }: Props) {
  // If messages is a single message, wrap it in an array
  // const safeMessages = Array.isArray(messages) ? messages : messages ? [messages] : [];
  let safeMessages: IContactConversation[] = [];

  if (Array.isArray(messages)) {
    safeMessages = messages;
  } else if (messages != null) {
    safeMessages = [messages];
  }
  
  const slides = safeMessages
    .filter((message) => message.product != null)
    .map((message) => ({
      src: message.description || "default.jpg", // Provide a fallback for undefined descriptions
    }));

  // Handling the lightbox hook for single message
  const lightbox = useLightBox(slides);

  return (
    <>
      <Scrollbar sx={{ px: 3, py: 5, height: 1 }}>
        <Box>
          {/* Render the message using MessageItem */}
          {safeMessages.map((message) => (
            <ContactMessageItem
              key={message?.unique_key}
              message={message}
              onOpenLightbox={() => lightbox.onOpen(message?.description ?? "")}
            />
          ))}
        </Box>
      </Scrollbar>

      {/* Lightbox Component */}
      <Lightbox
        index={lightbox.selected}
        slides={slides} // Pass slides to the Lightbox
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
