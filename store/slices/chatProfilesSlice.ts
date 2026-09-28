import {
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";

export interface ChatProfile {
    chatId: string;
    name: string;
    avatar: string;
}

interface ChatProfilesState {
    profiles: Record<string, ChatProfile>;
}

const initialState: ChatProfilesState = {
    profiles: {},
};

const chatProfilesSlice = createSlice({
    name: "chatProfiles",
    initialState,

    reducers: {
        setChatProfile: (
            state,
            action: PayloadAction<ChatProfile>
        ) => {
            const profile = action.payload;

            state.profiles[profile.chatId] = profile;
        },

        setChatProfiles: (
            state,
            action: PayloadAction<ChatProfile[]>
        ) => {
            for (const profile of action.payload) {
                state.profiles[profile.chatId] = profile;
            }
        },

        clearChatProfile: (
            state,
            action: PayloadAction<string>
        ) => {
            delete state.profiles[action.payload];
        },

        clearAllChatProfiles: (state) => {
            state.profiles = {};
        },
    },
});

export const {
    setChatProfile,
    setChatProfiles,
    clearChatProfile,
    clearAllChatProfiles,
} = chatProfilesSlice.actions;

export default chatProfilesSlice.reducer;