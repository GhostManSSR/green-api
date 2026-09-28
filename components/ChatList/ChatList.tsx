"use client";

import { FC } from "react";

import "./ChatList.less";

import { ChatItem } from "@/components/ChatItem/ChatItem";
import { Loading } from "@/components/layout/Loading";

import {
    useAppSelector,
} from "@/store/hooks";
import {useChatsLoader} from "@/hooks/useChatsLoader";

export const ChatList: FC<ChatListType> = ({
                                               ...props
                                           }) => {
    const chats = useAppSelector(
        (state) => state.chats.chats
    );

    const profiles = useAppSelector(
        (state) => state.chatProfiles.profiles
    );

    const loading = useAppSelector(
        (state) => state.chats.loading
    );

    const progress = useAppSelector(
        (state) => state.chats.progress
    );

    useChatsLoader();

    if (loading) {
        return (
            <div className="list_chat_loading">
                <Loading />

                <div className="list_chat_loading__text">
                    Загрузка чатов... {progress}%
                </div>

                <div className="list_chat_loading__bar">
                    <div
                        className="list_chat_loading__progress"
                        style={{
                            width: `${progress}%`,
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
            {chats.map((chat) => (
                <ChatItem
                    key={chat.chatId}
                    setCurrentChat={
                        props.setCurrentChat
                    }
                    chatId={chat.chatId}
                    name={chat.name}
                    avatar={
                        profiles[
                            chat.chatId
                            ]?.avatar || ""
                    }
                    currentChat={
                        props.currentChat
                    }
                    lastMessage={
                        chat.lastMessage
                    }
                />
            ))}
        </div>
    );
};