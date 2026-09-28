

export type ChatItemProps = {
    chatId: string;
    name: string;
    lastMessage: string;
    setCurrentChat: (chatId: string) => void;
    currentChat: string;
    avatar: string;
}