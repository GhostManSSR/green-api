import {FC} from "react";
import Link from "next/link";

import {HeaderProps} from "@/components/layout/Header/HeaderType";
import "./Header.less";

import {Button} from "@/components/layout/Button";

import {useAppDispatch, useAppSelector} from "@/store/hooks";

import {clearUser} from "@/store/slices/userSlice";
import {clearChats} from "@/store/slices/chatsSlice";

import {
    clearAllHistory,
} from "@/store/slices/chatHistorySlice";

import {
    clearAllChatProfiles,
} from "@/store/slices/chatProfilesSlice";

import {persistor} from "@/store";

export const Header: FC<HeaderProps> = () => {
    const user = useAppSelector(
        state => state.user.idInstance,
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
                <Link
                    href="/"
                    className="header__logo"
                    aria-label="На главную страницу"
                >
                    <span
                        className="header__logo-icon"
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                        >
                            <path
                                d="M21.4 3.6L18.3 20c-.2 1.2-.9 1.5-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L5.8 13.6 1 12.1c-1.1-.3-1.1-1 .2-1.5L20 3.3c.9-.3 1.7.2 1.4 1.3Z"
                                fill="currentColor"
                            />
                        </svg>
                    </span>

                    <span className="header__logo-text">
                        <span className="header__logo-title">
                            Telegram
                        </span>

                        <span className="header__logo-subtitle">
                            GREEN-API Messenger
                        </span>
                    </span>
                </Link>
            </div>

            <div className="header__column">
                {user && (
                    <>
                        <div className="header__account">
                            <span className="header__account-label">
                                Подключено
                            </span>

                            <span className="header__account-id">
                                ID {user}
                            </span>
                        </div>

                        <Button
                            type="button"
                            onClick={handleLogout}
                            classList={[
                                "header__logout",
                            ]}
                        >
                            <span
                                className="header__logout-icon"
                                aria-hidden="true"
                            >
                                ⇥
                            </span>

                            <span>
                                Выйти
                            </span>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
};