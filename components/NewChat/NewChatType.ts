

export type NewChatProps = {
    setCurrentChat: (chatId: string) => void;
}


export type CheckAccountResponse = {
    exist: boolean;
    chatId?: string;
    username?: string;
    phoneNumber?: number;
    fromCache?: boolean;
}


export type ContactInfoResponse = {
    avatar?: string;
    name?: string;
    contactName?: string;
    chatId?: string;
    username?: string;
    phoneNumber?: number;
}