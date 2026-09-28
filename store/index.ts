import {
    configureStore,
    combineReducers,
} from "@reduxjs/toolkit";

import {
    persistStore,
    persistReducer,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

import chatsReducer from "./slices/chatsSlice";
import userReducer from "./slices/userSlice";
import chatHistoryReducer from "./slices/chatHistorySlice";
import chatProfilesReducer from "./slices/chatProfilesSlice";

const rootReducer =
    combineReducers({
        chats: chatsReducer,
        user: userReducer,
        chatHistory: chatHistoryReducer,
        chatProfiles: chatProfilesReducer,
    });


const persistConfig = {
    key: "root",
    storage,

    whitelist: [
        "user",
        "chats",
        "chatHistory",
        "chatProfiles",
    ],
};

const persistedReducer =
    persistReducer(
        persistConfig,
        rootReducer
    );


export const store = configureStore({
        reducer: persistedReducer,
        middleware:
            (getDefaultMiddleware) =>
                getDefaultMiddleware({

                    serializableCheck: {

                        ignoredActions: [
                            "persist/PERSIST",
                            "persist/REHYDRATE",
                            "persist/REGISTER",
                            "persist/PURGE",
                            "persist/PAUSE",
                            "persist/FLUSH",
                        ],
                    },
                }),
});


export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>;


export type AppDispatch = typeof store.dispatch;