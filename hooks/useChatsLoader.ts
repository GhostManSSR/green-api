"use client";

import {useEffect} from "react";
import {HttpProvider} from "@/HttpProvider";
import {API_PATH} from "@/utils/api";
import {queuedRequest} from "@/utils/requestQueue";
import {startLoadingChats, setChats, updateProgress} from "@/store/slices/chatsSlice";
import {setChatProfile} from "@/store/slices/chatProfilesSlice";
import {setChatHistory} from "@/store/slices/chatHistorySlice";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import type {Chat} from "@/store/slices/chatsSlice";
import {getMessageText} from "@/utils/getMessageText";


export const useChatsLoader = () => {
    const dispatch = useAppDispatch();
    const idInstance = useAppSelector((state) => state.user.idInstance);
    const apiTokenInstance = useAppSelector((state) => state.user.apiTokenInstance);
    const loaded = useAppSelector((state) => state.chats.loaded);
    const profiles = useAppSelector((state) => state.chatProfiles.profiles);

    useEffect(() => {
        if (!idInstance || !apiTokenInstance) {
            return;
        }

        if (loaded) {
            return;
        }

        let stopped = false;

        const loadChats = async () => {
            try {
                dispatch(startLoadingChats());

                const http = new HttpProvider(API_PATH);
                const response = await queuedRequest(
                    () =>
                        http.get<GreenApiChat[]>(
                            `/waInstance${idInstance}/getChats/${apiTokenInstance}`
                        ),
                    "getChats"
                );


                if (stopped) {
                    return;
                }


                if (!Array.isArray(response)) {
                    console.error("getChats вернул некорректный ответ:", response);

                    return;
                }


                if (response.length === 0) {
                    dispatch(updateProgress(100));
                    dispatch(setChats([]));

                    return;
                }

                let totalOperations = 0;


                for (const chat of response) {
                    const profile = profiles[chat.chatId];

                    if (profile) {
                        totalOperations += 1;
                    } else if (chat.chatId.includes("-")) {
                        totalOperations += 3;
                    } else {
                        totalOperations += 2;
                    }
                }

                totalOperations += 1;

                let completedOperations = 1;

                dispatch(updateProgress(Math.round((completedOperations / totalOperations) * 100)));

                const completeOperation = () => {
                    completedOperations++;
                    const progress = Math.min(100, Math.round((completedOperations / totalOperations) * 100));
                    dispatch(updateProgress(progress));
                };

                const result: Chat[] = [];

                for (const chat of response) {
                    if (stopped) {
                        return;
                    }

                    let profile = profiles[chat.chatId];

                    if (!profile) {
                        try {
                            let name = chat.name || chat.chatId;

                            let avatar = "";

                            if (!chat.chatId.includes("-")) {
                                const info =
                                    await queuedRequest(
                                        () =>
                                            http.post<any>(
                                                `/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
                                                {
                                                    chatId: chat.chatId,
                                                }
                                            ),
                                        "getContactInfo"
                                    );

                                name = info?.name || info?.contactName || chat.name || chat.chatId;
                                avatar = info?.avatar || "";
                                completeOperation();
                            }

                            else {
                                const info =
                                    await queuedRequest(
                                        () =>
                                            http.post<any>(
                                                `/waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
                                                {
                                                    chatId: chat.chatId,
                                                }
                                            ),
                                        "getGroupData"
                                    );

                                name = info?.subject || chat.name || chat.chatId;
                                completeOperation();

                                try {
                                    const avatarResponse =
                                        await queuedRequest(
                                            () =>
                                                http.post<any>(
                                                    `/waInstance${idInstance}/getAvatar/${apiTokenInstance}`,
                                                    {
                                                        chatId: chat.chatId,
                                                    }
                                                ),
                                            "getAvatar"
                                        );


                                    avatar = avatarResponse?.urlAvatar || "";

                                } catch (error) {
                                    console.error(
                                        `Ошибка получения аватара ${chat.chatId}:`,
                                        error
                                    );
                                }

                                completeOperation();
                            }


                            profile = {
                                chatId: chat.chatId,
                                name,
                                avatar,
                            };


                            dispatch(setChatProfile(profile));

                        } catch (error) {
                            console.error(
                                `Ошибка получения профиля ${chat.chatId}:`,
                                error
                            );


                            profile = {
                                chatId: chat.chatId,
                                name: chat.name || chat.chatId,
                                avatar: "",
                            };

                            completeOperation();
                        }
                    }

                    let lastMessage = "";
                    let lastMessageId = "";
                    let lastMessageTimestamp = 0;


                    try {
                        const history =
                            await queuedRequest(
                                () =>
                                    http.post<LastMessageType[]>(
                                        `/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
                                        {
                                            chatId: chat.chatId,
                                            count: 10
                                        }
                                    ),
                                "getChatHistory"
                            );


                        if (Array.isArray(history)) {
                            dispatch(
                                setChatHistory({chatId: chat.chatId, messages: history})
                            );


                            if (history.length > 0) {
                                const latestMessage =
                                    history.reduce(
                                        (latest, current) =>
                                            (current.timestamp || 0) >
                                            (latest.timestamp || 0)
                                                ? current
                                                : latest,
                                        history[0]
                                    );


                                lastMessage = getMessageText(latestMessage);


                                lastMessageId = latestMessage.idMessage || "";


                                lastMessageTimestamp = latestMessage.timestamp || 0;
                            }
                        }

                    } catch (error) {
                        console.error(
                            `Ошибка получения истории ${chat.chatId}:`,
                            error
                        );
                    }

                    completeOperation();

                    result.push({
                        chatId: chat.chatId,
                        name: profile?.name || chat.name || chat.chatId,
                        type: chat.type || "",
                        phoneNumber: chat.phoneNumber || 0,
                        username: chat.username || "",
                        lastMessage,
                        lastMessageId,
                        lastMessageTimestamp,
                    });
                }

                if (!stopped) {
                    dispatch(updateProgress(100));
                    dispatch(setChats(result));
                }

            } catch (error) {
                console.error(
                    "Ошибка загрузки чатов:",
                    error
                );
            }
        };

        void loadChats();

        return () => {
            stopped = true;
        };

    }, [idInstance, apiTokenInstance, loaded, dispatch,]);
};