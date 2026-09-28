import { FC } from "react";
import { HeaderProps } from "@/components/layout/Header/HeaderType";
import "./Header.less";

import { Button } from "@/components/layout/Button";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { clearUser } from "@/store/slices/userSlice";
import { clearChats } from "@/store/slices/chatsSlice";
import {
    clearAllHistory,
} from "@/store/slices/chatHistorySlice";

import {
    clearAllChatProfiles,
} from "@/store/slices/chatProfilesSlice";

import { persistor } from "@/store";

export const Header: FC<HeaderProps> = ({ ...props }) => {
    const user = useAppSelector(
        (state) => state.user.idInstance
    );

    const dispatch = useAppDispatch();

    const handleLogout = async () => {
        await persistor.pause();
        dispatch(clearUser());
        dispatch(clearChats());
        dispatch(clearAllHistory());
        dispatch(clearAllChatProfiles());

        await persistor.flush();
        await persistor.purge();
        persistor.persist();
    };

    return (
        <header className="header">
            <div className="header__column">
                <a
                    href="/"
                    className="header__logo"
                >
                    Telegram transition message
                </a>
            </div>

            <div className="header__column">
                {user?.length > 0 && (
                    <Button
                        onClick={handleLogout}
                        classList={["button__log"]}
                    >
                        Выйти
                    </Button>
                )}
            </div>
        </header>
    );
};