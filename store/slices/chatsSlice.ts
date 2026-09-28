import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Chat {
    chatId: string;
    name: string;
    type: string;
    phoneNumber: number;
    username: string;
    lastMessage: string;
}

interface ChatsState {
    chats: Chat[];
    isAuth: boolean;
    loaded: boolean;
    loading: boolean;
    progress: number;
}

const initialState: ChatsState = {
    chats: [],
    isAuth: false,
    loaded: false,
    loading: false,
    progress: 0,
};

const chatsSlice = createSlice({
    name: "chats",

    initialState,

    reducers: {
        /*
         * Авторизация успешна
         */
        setAuth: (state) => {
            state.isAuth = true;
        },

        /*
         * Начинаем загрузку чатов
         */
        startLoadingChats: (state) => {
            state.loading = true;
            state.loaded = false;
            state.progress = 0;
        },

        /*
         * Сохраняем все полученные чаты
         */
        setChats: (
            state,
            action: PayloadAction<Chat[]>
        ) => {
            state.chats = action.payload;

            state.loading = false;
            state.loaded = true;
            state.progress = 100;
        },

        /*
         * Изменение прогресса
         */
        updateProgress: (
            state,
            action: PayloadAction<number>
        ) => {
            state.progress = action.payload;
        },

        /*
         * Полный выход из аккаунта
         */
        clearChats: (state) => {
            state.chats = [];

            state.isAuth = false;

            state.loaded = false;
            state.loading = false;
            state.progress = 0;
        },
    },
});

export const {
    setAuth,
    startLoadingChats,
    setChats,
    updateProgress,
    clearChats,
} = chatsSlice.actions;

export default chatsSlice.reducer;
