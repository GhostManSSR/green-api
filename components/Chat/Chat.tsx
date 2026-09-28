"use client";

import {
    FC,
    KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import "./Chat.less";
import {useAppDispatch, useAppSelector,} from "@/store/hooks";
import {Input,} from "@/components/layout/Input";
import {Button,} from "@/components/layout/Button";
import {HttpProvider,} from "@/HttpProvider";
import {API_PATH,} from "@/utils/api";
import {queuedRequest,} from "@/utils/requestQueue";
import {mergeChatHistory, setChatHistory,} from "@/store/slices/chatHistorySlice";
import {ChatProps, SendMessageResponse} from "@/components/Chat/ChatType";
import Image from "next/image";


export const Chat: FC<ChatProps> = ({...props}) => {
    const dispatch =
        useAppDispatch();
    const loading = useAppSelector((state) => state.chats.loading);

    const histories =
        useAppSelector(
            state =>
                state.chatHistory
                    .histories,
        );

    const profiles =
        useAppSelector(
            state =>
                state.chatProfiles
                    .profiles,
        );

    const idInstance =
        useAppSelector(
            state =>
                state.user.idInstance,
        );

    const apiTokenInstance =
        useAppSelector(
            state =>
                state.user
                    .apiTokenInstance,
        );


    const [message, setMessage] =
        useState("");

    const [sending, setSending] =
        useState(false);

    const [
        loadingHistory,
        setLoadingHistory,
    ] = useState(false);

    const [
        loadingMore,
        setLoadingMore,
    ] = useState(false);

    const [
        historyCount,
        setHistoryCount,
    ] = useState(30);

    const [
        hasMoreHistory,
        setHasMoreHistory,
    ] = useState(true);

    const currentChatRef =
        useRef<
            string | undefined
        >(props.currentChat);

    useEffect(() => {
        currentChatRef.current =
            props.currentChat;
    }, [props.currentChat]);


    const loadHistoryRef =
        useRef<
            (() => Promise<void>) | null
        >(null);

    const fetchHistory =
        useCallback(
            async (
                count: number,
                merge = false,
            ) => {
                const chatId =
                    currentChatRef.current;

                if (
                    !chatId ||
                    !idInstance ||
                    !apiTokenInstance
                ) {
                    return;
                }

                const http =
                    new HttpProvider(
                        API_PATH,
                    );

                const history =
                    await queuedRequest(
                        () =>
                            http.post<
                                LastMessageType[]
                            >(
                                `/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
                                {
                                    chatId,

                                    count,
                                },
                            ),
                    );

                if (
                    !Array.isArray(
                        history,
                    )
                ) {
                    return;
                }

                if (!merge) {
                    dispatch(
                        setChatHistory({
                            chatId,
                            messages:
                            history,
                        }),
                    );
                }

                else {
                    dispatch(
                        mergeChatHistory({
                            chatId,
                            messages:
                            history,
                        }),
                    );
                }

                setHistoryCount(
                    count,
                );

                setHasMoreHistory(
                    history.length >=
                    count,
                );
            },
            [
                idInstance,
                apiTokenInstance,
                dispatch,
            ],
        );


    const loadHistory =
        useCallback(
            async () => {
                if (
                    !currentChatRef
                        .current
                ) {
                    return;
                }

                try {
                    setLoadingHistory(
                        true,
                    );

                    await fetchHistory(
                        30,
                        false,
                    );

                    setHistoryCount(
                        30,
                    );

                    setHasMoreHistory(
                        true,
                    );
                } catch (error) {
                    console.error(
                        "Ошибка получения истории:",
                        error,
                    );
                } finally {
                    setLoadingHistory(
                        false,
                    );
                }
            },
            [fetchHistory],
        );


    useEffect(() => {
        loadHistoryRef.current =
            loadHistory;
    }, [loadHistory]);

    useEffect(() => {
        if (!props.currentChat) {
            return;
        }

        const interval = setInterval(() => {
            loadHistory();
        }, 30_000);

        return () => {
            clearInterval(interval);
        };
    }, [props.currentChat, loadHistory,]);

    const profile =
        props.currentChat
            ? profiles[
                props.currentChat
                ]
            : undefined;

    const chatMessages =
        props.currentChat
            ? histories[
            props.currentChat
            ] ?? []
            : [];

    const orderedMessages =
        [
            ...chatMessages,
        ].sort(
            (a, b) =>
                a.timestamp -
                b.timestamp,
        );

    useEffect(() => {
        if (!props.currentChat) {
            return;
        }

        setHistoryCount(30);
        setHasMoreHistory(true);

        loadHistory();
    }, [props.currentChat, loadHistory,]);

    const loadMoreHistory =
        useCallback(
            async () => {
                if (
                    !props.currentChat ||
                    !idInstance ||
                    !apiTokenInstance ||
                    loadingMore ||
                    !hasMoreHistory
                ) {
                    return;
                }

                try {
                    setLoadingMore(
                        true,
                    );

                    const nextCount =
                        historyCount +
                        30;

                    await fetchHistory(
                        nextCount,
                        true,
                    );
                } catch (error) {
                    console.error(
                        "Ошибка загрузки дополнительных сообщений:",
                        error,
                    );
                } finally {
                    setLoadingMore(
                        false,
                    );
                }
            },
            [
                props.currentChat,
                idInstance,
                apiTokenInstance,
                loadingMore,
                hasMoreHistory,
                historyCount,
                fetchHistory,
            ],
        );

    const sendMessage =
        async () => {
            const text =
                message.trim();

            if (
                !text ||
                !props.currentChat ||
                !idInstance ||
                !apiTokenInstance ||
                sending
            ) {
                return;
            }

            try {
                setSending(true);

                const http =
                    new HttpProvider(
                        API_PATH,
                    );

                const response =
                    await queuedRequest(
                        () =>
                            http.post<SendMessageResponse>(
                                `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
                                {
                                    chatId:
                                    props.currentChat,

                                    message:
                                    text,
                                },
                            ),
                    );


                setMessage("");
                loadHistory();
            } catch (error) {
                console.error(
                    "Ошибка отправки сообщения:",
                    error,
                );
            } finally {
                setSending(false);
            }
        };


    const handleKeyDown =
        (
            event: KeyboardEvent<HTMLInputElement>,
        ) => {
            if (
                event.key ===
                "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage();
            }
        };

    if (!props.currentChat || loading) {
        return (
            <div className="chat__empty">
                <Image
                    className="chat__empty-image"
                    src="/chats.png"
                    width={40}
                    height={40}
                    alt="Выберите чат"
                />

                <div className="chat__empty-title">
                    Выберите чат
                </div>

                <div className="chat__empty-text">
                    Выберите чат слева,
                    чтобы посмотреть
                    сообщения
                </div>
            </div>
        );
    }

    return (
        <div className="chat">
            <div className="chat__contact">
                {props.onBack && (
                    <button
                        type="button"
                        className="chat__back"
                        aria-label="Вернуться к списку чатов"
                        onClick={props.onBack}
                        title="Назад к чатам"
                    >
                        ←
                    </button>
                )}
                <div className="chat__contact-avatar">

                    {profile?.avatar ? (
                        <img
                            src={
                                profile.avatar
                            }
                            alt={
                                profile.name
                            }
                        />
                    ) : (
                        <Image src="/placeholder.png" width={40} height={40} alt=""/>
                    )}

                </div>

                <div className="chat__contact-info">

                    <div className="chat__contact-name">
                        {
                            profile?.name ||
                            props.currentChat
                        }
                    </div>

                    <div className="chat__contact-status">
                        {loadingHistory
                            ? "Загрузка..."
                            : "чат"}
                    </div>

                </div>


            </div>

            <div className="chat__messages">

                {hasMoreHistory && (
                    <button
                        type="button"
                        className="chat__load-more"
                        disabled={
                            loadingMore ||
                            loadingHistory
                        }
                        onClick={
                            loadMoreHistory
                        }
                    >
                        {loadingMore
                            ? "Загрузка..."
                            : "Загрузить ещё"}
                    </button>
                )}

                {loadingHistory &&
                    orderedMessages.length ===
                    0 && (
                        <div className="chat__messages-loading">
                            Загрузка
                            сообщений...
                        </div>
                    )}

                {!loadingHistory &&
                    orderedMessages.length ===
                    0 && (
                        <div className="chat__messages-empty">
                            Сообщений нет
                        </div>
                    )}

                {orderedMessages.map(
                    item => {
                        const text =
                            item.textMessage ||
                            item
                                .extendedTextMessage
                                ?.text ||
                            item.caption;

                        return (
                            <div
                                className={`chat__message ${
                                    item.type ===
                                    "outgoing"
                                        ? "chat__message--outgoing"
                                        : "chat__message--incoming"
                                }`}
                                key={
                                    item.idMessage
                                }
                            >
                                <div className="chat__message-content">

                                    {text || (
                                        <span className="chat__message-type">
                                            {
                                                item.typeMessage
                                            }
                                        </span>
                                    )}

                                </div>
                            </div>
                        );
                    },
                )}

            </div>

            <div className="chat__input-wrapper">

                <Input
                    classList={[
                        "chat__input",
                    ]}
                    type="text"
                    placeholder="Написать сообщение..."
                    value={message}
                    disabled={
                        sending
                    }
                    onChange={
                        event =>
                            setMessage(
                                event
                                    .target
                                    .value,
                            )
                    }
                    onKeyDown={
                        handleKeyDown
                    }
                />

                <Button
                    classList={[
                        "chat__send",
                    ]}
                    type="button"
                    disabled={
                        sending ||
                        !message.trim()
                    }
                    onClick={
                        sendMessage
                    }
                >
                    {sending ? "Отправка..." : "Отправить"}
                </Button>

            </div>

        </div>
    );
};