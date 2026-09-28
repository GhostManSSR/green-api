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

        /**
         * Устанавливает первоначальную историю.
         *
         * В отличие от старого варианта здесь НЕТ:
         *
         * messages.slice(0, 10)
         *
         * потому что Redux должен хранить
         * все уже загруженные сообщения.
         */
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


        /**
         * Добавляет одно новое сообщение
         * из WebSocket.
         *
         * Если сообщение уже существует —
         * ничего не делает.
         */
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


        /**
         * Объединяет уже загруженную историю
         * с новой порцией сообщений.
         *
         * Например:
         *
         * Redux:
         * 1..10
         *
         * API:
         * 1..20
         *
         * Результат:
         * 1..20
         *
         * без дублей.
         */
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


        /**
         * Очищает историю конкретного чата.
         */
        clearChatHistory: (
            state,
            action: PayloadAction<string>
        ) => {

            delete state.histories[
                action.payload
                ];
        },


        /**
         * Очищает всю историю.
         */
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