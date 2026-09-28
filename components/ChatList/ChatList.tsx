"use client";

import { FC, useEffect } from "react";
import "./ChatList.less";
import { ChatItem } from "@/components/ChatItem/ChatItem";
import { Loading } from "@/components/layout/Loading";
import { HttpProvider } from "@/HttpProvider";
import { API_PATH } from "@/utils/api";
import { queuedRequest } from "@/utils/requestQueue";
import {setChatProfile,} from "@/store/slices/chatProfilesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {setChats, startLoadingChats, updateProgress } from "@/store/slices/chatsSlice";

import type { Chat } from "@/store/slices/chatsSlice";
import {setChatHistory} from "@/store/slices/chatHistorySlice";
import {getMessageText} from "@/utils/getMessageText";

export const ChatList: FC<ChatListType> = ({...props}) => {
    const dispatch = useAppDispatch();

    const chats = useAppSelector((state) => state.chats.chats);
    const loaded = useAppSelector((state) => state.chats.loaded);
    const profiles = useAppSelector((state) => state.chatProfiles.profiles);
    const loading = useAppSelector((state) => state.chats.loading);
    const histories = useAppSelector((state) => state.chatHistory.histories);
    const progress = useAppSelector((state) => state.chats.progress);
    const idInstance = useAppSelector((state) => state.user.idInstance);
    const apiTokenInstance = useAppSelector((state) => state.user.apiTokenInstance);

    const dataReady = chats.length > 0 && chats.every((chat) => {
            const hasProfile = Boolean(profiles[chat.chatId]);
            const hasHistory = Object.prototype.hasOwnProperty.call(histories, chat.chatId);
            return hasProfile && hasHistory;
    });

    useEffect(() => {
        if (!idInstance || !apiTokenInstance) {
            return;
        }

        if (loaded && dataReady) {
            return;
        }

        let cancelled = false;

        const loadChats = async () => {
            try {
                dispatch(startLoadingChats());
                const http = new HttpProvider(API_PATH);

                const response = await queuedRequest(() =>
                    http.get<GreenApiChat[]>(
                        `/waInstance${idInstance}/getChats/${apiTokenInstance}`
                    )
                );

                if (cancelled) {
                    return;
                }

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

                    if (cancelled) {
                        return;
                    }

                    const chat = response[i];
                    let profile = profiles[chat.chatId];

                    if (!profile) {
                        try {
                            let name = chat.name || chat.chatId;
                            let avatar = "";

                            if (!chat.chatId.includes("-")) {

                                const info =
                                    await queuedRequest(() =>
                                        http.post<any>(
                                            `/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
                                            {
                                                chatId: chat.chatId,
                                            }
                                        )
                                    );

                                if (cancelled) {
                                    return;
                                }

                                name = info?.name || info?.contactName || chat.name || chat.chatId;
                                avatar = info?.avatar || "";
                            }

                            else {

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

                                if (cancelled) {
                                    return;
                                }

                                name = info?.subject || chat.name || chat.chatId;

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

                                    if (cancelled) {
                                        return;
                                    }

                                    avatar = avatarResponse?.urlAvatar || "";

                                } catch (avatarError) {
                                    console.error(
                                        `Ошибка получения аватара ${chat.chatId}:`,
                                        avatarError
                                    );

                                }
                            }

                            profile = {
                                chatId: chat.chatId,
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
                                chatId: chat.chatId,
                                name: chat.name || chat.chatId,
                                avatar: "",
                            };
                        }
                    }

                    let lastMessage = "";

                    try {
                        const history =
                            await queuedRequest(() =>
                                http.post<LastMessageType[]>(
                                    `/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
                                    {
                                        chatId: chat.chatId,
                                        count: 10,
                                    }
                                )
                            );

                        if (cancelled) {
                            return;
                        }

                        if (Array.isArray(history)) {
                            dispatch(
                                setChatHistory({
                                    chatId: chat.chatId,
                                    messages: history,
                                })
                            );

                            if (history.length > 0) {
                                lastMessage = getMessageText(history[0]);
                            }
                        }

                    } catch (error) {

                        console.error(
                            `Ошибка получения истории ${chat.chatId}:`,
                            error
                        );

                    }

                    const newChat: Chat = {
                        chatId:
                        chat.chatId,
                        name: profile?.name || chat.name || chat.chatId,
                        type: chat.type || "",
                        phoneNumber: chat.phoneNumber || 0,
                        username: chat.username || "",
                        lastMessage,
                    };

                    result.push(newChat);

                    const currentProgress =
                        Math.round(
                            ((i + 1) /
                                total) *
                            100
                        );

                    dispatch(
                        updateProgress(
                            currentProgress
                        )
                    );
                }

                if (cancelled) {return;}

                dispatch(
                    setChats(result)
                );

            } catch (error) {
                if (cancelled) {
                    return;
                }
                console.error(
                    "Ошибка загрузки чатов:",
                    error
                );
                dispatch(setChats([]));
            }
        };

        loadChats();

        return () => {cancelled = true;};
    }, [idInstance, apiTokenInstance, loaded, chats.length, dispatch]);

    if (loading) {
        return (
            <div className="list_chat_loading">
                <Loading />
                <div className="list_chat_loading__text">
                    Загрузка чатов...{" "}{progress}%
                </div>
                <div className="list_chat_loading__bar">
                    <div
                        className="list_chat_loading__progress"
                        style={{
                            width:
                                `${progress}%`,
                        }}
                    />
                </div>
            </div>
        );
    }

    if (!chats.length) {
        return (
            <div className="list_chat_empty">
                Список чатов пуст
            </div>
        );
    }

    return (
        <div className="list_chat">
            {chats.map(
                (chat) => (
                    <ChatItem
                        setCurrentChat={props.setCurrentChat}
                        key={chat.chatId}
                        chatId={chat.chatId}
                        name={chat.name}
                        avatar={profiles[chat.chatId]?.avatar || ""}
                        currentChat={props.currentChat}
                        lastMessage={chat.lastMessage}
                    />
                )
            )}
        </div>
    );
};