
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
    idInstance: string;
    apiTokenInstance: string;
}

const initialState: User = {
    idInstance: "",
    apiTokenInstance: ""
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<any>) => {
            state.idInstance = action.payload.idInstance;
            state.apiTokenInstance = action.payload.apiTokenInstance;
        },

        clearUser: (state) => {
            state.idInstance = "";
            state.apiTokenInstance = "";
        },
    },
});

export const {
    setUser,
    clearUser,
} = userSlice.actions;

export default userSlice.reducer;