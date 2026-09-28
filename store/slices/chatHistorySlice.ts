import {
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";

export interface ChatMessage {
    type: "incoming" | "outgoing";
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
    senderId?: string;
    senderName?: string;
    senderType?: string;
    senderContactName?: string;
    isForwarded?: boolean;
    isEdited?: boolean;
    isDeleted?: boolean;
    [key: string]: unknown;
}

interface ChatHistoryState {
    histories: Record<string, ChatMessage[]>;
}


const initialState: ChatHistoryState = {
    histories: {},
};

const mergeMessages = (
    current: ChatMessage[],
    incoming: ChatMessage[],
): ChatMessage[] => {

    const messages = new Map<string, ChatMessage>();


    for (const message of current) {

        if (!message.idMessage) {
            continue;
        }

        messages.set(
            message.idMessage,
            message
        );
    }


    for (const message of incoming) {

        if (!message.idMessage) {
            continue;
        }

        messages.set(
            message.idMessage,
            message
        );
    }


    return Array.from(messages.values());
};

const chatHistorySlice = createSlice({

    name: "chatHistory",

    initialState,

    reducers: {
        setChatHistory: (
            state,
            action: PayloadAction<{
                chatId: string;
                messages: ChatMessage[];
            }>
        ) => {

            const {
                chatId,
                messages,
            } = action.payload;


            const current =
                state.histories[chatId] || [];


            state.histories[chatId] =
                mergeMessages(
                    current,
                    messages
                );
        },

        addMessage: (
            state,
            action: PayloadAction<{
                chatId: string;
                message: ChatMessage;
            }>
        ) => {

            const {
                chatId,
                message,
            } = action.payload;


            const current =
                state.histories[chatId] || [];


            const exists =
                current.some(
                    item =>
                        item.idMessage ===
                        message.idMessage
                );


            if (exists) {
                return;
            }


            state.histories[chatId] = [
                message,
                ...current,
            ];
        },

        mergeChatHistory: (
            state,
            action: PayloadAction<{
                chatId: string;
                messages: ChatMessage[];
            }>
        ) => {

            const {
                chatId,
                messages,
            } = action.payload;


            const current =
                state.histories[chatId] || [];


            state.histories[chatId] =
                mergeMessages(
                    current,
                    messages
                );
        },

        clearChatHistory: (
            state,
            action: PayloadAction<string>
        ) => {

            delete state.histories[
                action.payload
                ];
        },

        clearAllHistory: (
            state
        ) => {

            state.histories = {};
        },
    },
});


export const {
    setChatHistory,
    addMessage,
    mergeChatHistory,
    clearChatHistory,
    clearAllHistory,
} = chatHistorySlice.actions;


export default chatHistorySlice.reducer;