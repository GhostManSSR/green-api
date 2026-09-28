"use client";

import {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {HttpProvider,} from "@/HttpProvider";
import {API_PATH,} from "@/utils/api";
import {queuedRequest,} from "@/utils/requestQueue";
import {setChats,} from "@/store/slices/chatsSlice";
import {getMessageText} from "@/utils/getMessageText";

const REQUEST_INTERVAL = 500;
const MAX_RATE_LIMIT_INTERVAL = 30_000;

export const useChatLastMessage = (idInstance: string | null, apiTokenInstance: string | null,) => {
    const dispatch = useAppDispatch();
    const chats = useAppSelector((state) => state.chats.chats);
    const loaded = useAppSelector((state) => state.chats.loaded);
    const chatsRef = useRef(chats);
    const chatIndexRef = useRef(0);
    const updatingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef(REQUEST_INTERVAL);

    useEffect(() => {
        chatsRef.current = chats;

        if (chatIndexRef.current >= chats.length) {
            chatIndexRef.current = 0;
        }
    }, [chats]);


    useEffect(() => {
        if (!loaded || !idInstance || !apiTokenInstance) {
            return;
        }

        let stopped = false;

        const http = new HttpProvider(API_PATH);


        const updateNextChat = async (): Promise<void> => {
            if (stopped) {
                return;
            }

            const currentChats = chatsRef.current;

            if (currentChats.length === 0) {
                timeoutRef.current = setTimeout(() => void updateNextChat(), intervalRef.current);
                return;
            }

            if (updatingRef.current) {
                timeoutRef.current = setTimeout(() => void updateNextChat(), intervalRef.current);
                return;
            }


            const index = chatIndexRef.current;

            const chat = currentChats[index];


            chatIndexRef.current = (index + 1) % currentChats.length;

            if (!chat) {
                timeoutRef.current = setTimeout(() => void updateNextChat(), intervalRef.current);
                return;
            }


            updatingRef.current = true;


            try {
                const history = await queuedRequest(
                    () =>
                        http.post<any[]>(
                            `/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
                            {
                                chatId: chat.chatId,
                                count: 1,
                            }
                        ),
                    "getChatHistory"
                );

                intervalRef.current = REQUEST_INTERVAL;

                if (!stopped && Array.isArray(history) && history.length > 0) {
                    const latestMessage = history[0];
                    const lastMessage = getMessageText(latestMessage);
                    const lastMessageId = latestMessage.idMessage || "";
                    const lastMessageTimestamp = latestMessage.timestamp || 0;
                    const latestChats = chatsRef.current;
                    const chatPosition = latestChats.findIndex((item) => item.chatId === chat.chatId);

                    if (chatPosition !== -1) {
                        const currentChat = latestChats[chatPosition];

                        if (currentChat.lastMessageId !== lastMessageId || currentChat.lastMessageTimestamp !== lastMessageTimestamp) {
                            const updatedChats = [...latestChats];

                            updatedChats[chatPosition] = {
                                ...currentChat,
                                lastMessage,
                                lastMessageId,
                                lastMessageTimestamp,
                            };

                            chatsRef.current = updatedChats;

                            dispatch(setChats(updatedChats));
                        }
                    }
                }

            } catch (error: any) {

                const status = error?.status ?? error?.statusCode ?? error?.response?.status;

                const is429 = status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests");


                if (is429) {
                    chatIndexRef.current = index;
                    intervalRef.current = Math.min(intervalRef.current * 2, MAX_RATE_LIMIT_INTERVAL);
                    console.warn(`[getChatHistory] 429. Retry after ${intervalRef.current} ms`);
                } else {
                    console.error("[getChatHistory] error:", error);
                }

            } finally {
                updatingRef.current = false;
            }


            if (!stopped) {
                timeoutRef.current = setTimeout(() => void updateNextChat(), intervalRef.current);
            }
        };

        void updateNextChat();

        return () => {
            stopped = true;

            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

    }, [loaded, idInstance, apiTokenInstance, dispatch]);
};