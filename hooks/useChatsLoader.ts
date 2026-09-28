"use client";

import { useEffect } from "react";

import { HttpProvider } from "@/HttpProvider";
import { API_PATH } from "@/utils/api";
import { queuedRequest } from "@/utils/requestQueue";

import {
    startLoadingChats,
    setChats,
    updateProgress,
} from "@/store/slices/chatsSlice";

import {
    setChatProfile,
} from "@/store/slices/chatProfilesSlice";

import {
    setChatHistory,
} from "@/store/slices/chatHistorySlice";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import type { Chat } from "@/store/slices/chatsSlice";

import { getMessageText } from "@/utils/getMessageText";

export const useChatsLoader = () => {
    const dispatch = useAppDispatch();

    const idInstance = useAppSelector(
        (state) => state.user.idInstance
    );

    const apiTokenInstance = useAppSelector(
        (state) => state.user.apiTokenInstance
    );

    const loaded = useAppSelector(
        (state) => state.chats.loaded
    );

    const loading = useAppSelector(
        (state) => state.chats.loading
    );

    const profiles = useAppSelector(
        (state) => state.chatProfiles.profiles
    );

    useEffect(() => {
        if (!idInstance || !apiTokenInstance) {
            return;
        }

        /**
         * Уже загрузили.
         */
        if (loaded) {
            return;
        }

        /**
         * Загрузка уже идёт.
         *
         * Это особенно важно при React StrictMode
         * и повторном mount компонента.
         */
        if (loading) {
            return;
        }

        const loadChats = async () => {
            try {
                dispatch(startLoadingChats());

                const http = new HttpProvider(API_PATH);

                const response = await queuedRequest(() =>
                    http.get<GreenApiChat[]>(
                        `/waInstance${idInstance}/getChats/${apiTokenInstance}`
                    )
                );

                if (!Array.isArray(response)) {
                    console.error(
                        "getChats вернул некорректный ответ:",
                        response
                    );

                    dispatch(setChats([]));

                    return;
                }

                if (response.length === 0) {
                    dispatch(setChats([]));

                    return;
                }

                const total = response.length;

                const result: Chat[] = [];

                for (let i = 0; i < response.length; i++) {
                    const chat = response[i];

                    let profile =
                        profiles[chat.chatId];

                    /*
                     * ==========================
                     * PROFILE
                     * ==========================
                     */

                    if (!profile) {
                        try {
                            let name =
                                chat.name ||
                                chat.chatId;

                            let avatar = "";

                            if (
                                !chat.chatId.includes("-")
                            ) {
                                const info =
                                    await queuedRequest(() =>
                                        http.post<any>(
                                            `/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
                                            {
                                                chatId:
                                                chat.chatId,
                                            }
                                        )
                                    );

                                name =
                                    info?.name ||
                                    info?.contactName ||
                                    chat.name ||
                                    chat.chatId;

                                avatar =
                                    info?.avatar ||
                                    "";
                            } else {
                                const info =
                                    await queuedRequest(() =>
                                        http.post<any>(
                                            `/waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
                                            {
                                                chatId:
                                                chat.chatId,
                                            }
                                        )
                                    );

                                name =
                                    info?.subject ||
                                    chat.name ||
                                    chat.chatId;

                                try {
                                    const avatarResponse =
                                        await queuedRequest(() =>
                                            http.post<any>(
                                                `/waInstance${idInstance}/getAvatar/${apiTokenInstance}`,
                                                {
                                                    chatId:
                                                    chat.chatId,
                                                }
                                            )
                                        );

                                    avatar =
                                        avatarResponse?.urlAvatar ||
                                        "";
                                } catch (error) {
                                    console.error(
                                        `Ошибка получения аватара ${chat.chatId}:`,
                                        error
                                    );
                                }
                            }

                            profile = {
                                chatId:
                                chat.chatId,
                                name,
                                avatar,
                            };

                            dispatch(
                                setChatProfile(profile)
                            );

                        } catch (error) {
                            console.error(
                                `Ошибка получения профиля ${chat.chatId}:`,
                                error
                            );

                            profile = {
                                chatId:
                                chat.chatId,
                                name:
                                    chat.name ||
                                    chat.chatId,
                                avatar: "",
                            };
                        }
                    }

                    /*
                     * ==========================
                     * HISTORY
                     * ==========================
                     */

                    let lastMessage = "";

                    try {
                        const history =
                            await queuedRequest(() =>
                                http.post<LastMessageType[]>(
                                    `/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
                                    {
                                        chatId:
                                        chat.chatId,
                                        count: 10,
                                    }
                                )
                            );

                        if (Array.isArray(history)) {
                            dispatch(
                                setChatHistory({
                                    chatId:
                                    chat.chatId,
                                    messages:
                                    history,
                                })
                            );

                            if (
                                history.length > 0
                            ) {
                                lastMessage =
                                    getMessageText(
                                        history[0]
                                    );
                            }
                        }

                    } catch (error) {
                        console.error(
                            `Ошибка получения истории ${chat.chatId}:`,
                            error
                        );
                    }

                    /*
                     * ==========================
                     * CHAT
                     * ==========================
                     */

                    result.push({
                        chatId:
                        chat.chatId,

                        name:
                            profile?.name ||
                            chat.name ||
                            chat.chatId,

                        type:
                            chat.type ||
                            "",

                        phoneNumber:
                            chat.phoneNumber ||
                            0,

                        username:
                            chat.username ||
                            "",

                        lastMessage,
                    });

                    /*
                     * ==========================
                     * PROGRESS
                     * ==========================
                     */

                    dispatch(
                        updateProgress(
                            Math.round(
                                ((i + 1) /
                                    total) *
                                100
                            )
                        )
                    );
                }

                /*
                 * Только здесь loaded = true
                 */
                dispatch(setChats(result));

            } catch (error) {
                console.error(
                    "Ошибка загрузки чатов:",
                    error
                );

                dispatch(setChats([]));
            }
        };

        loadChats();

    }, [
        idInstance,
        apiTokenInstance,
        loaded,
        loading,
        dispatch,
    ]);
};