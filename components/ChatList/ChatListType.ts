
type Chat = {
    chatId: string;
    name: string;
    type: string;
    phoneNumber: number;
    username: string;
}

type ChatListType = {
    setCurrentChat: (chatId: string) => void,
    currentChat: string,
}

type LastMessageType =  {
    type: | "incoming" | "outgoing";
    idMessage: string;
    timestamp: number;
    typeMessage: string;
    chatId: string;
    chatType?: string;
    textMessage?: string;
    extendedTextMessage?: {
        text?: string;
    };
    caption?: string;
    fileName?: string;
    downloadUrl?: string;
}

type GreenApiChat = {
    chatId: string;
    name: string;
    type: | "user" | "group" | "supergroup" | "channel";
    phoneNumber: number;
    username: string;
}