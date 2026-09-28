"use client";

import {FC, SubmitEvent, useState} from "react";
import {HttpProvider} from "@/HttpProvider";
import {API_PATH} from "@/utils/api";
import {queuedRequest} from "@/utils/requestQueue";
import {useAppDispatch, useAppSelector,} from "@/store/hooks";
import {setChatProfile} from "@/store/slices/chatProfilesSlice";
import {addChat} from "@/store/slices/chatsSlice";
import "./NewChat.less";
import {CheckAccountResponse, ContactInfoResponse, NewChatProps} from "@/components/NewChat/NewChatType";



const isCheckAccountResponse = (response: unknown): response is CheckAccountResponse => {
    return (
        typeof response === "object" &&
        response !== null &&
        "exist" in response
    );
};


const isContactInfoResponse = (response: unknown): response is ContactInfoResponse => {
    return (
        typeof response === "object" &&
        response !== null
    );
};


export const NewChat: FC<NewChatProps> = ({setCurrentChat}) => {
    const dispatch = useAppDispatch();
    const idInstance = useAppSelector((state) => state.user.idInstance);
    const apiTokenInstance = useAppSelector((state) => state.user.apiTokenInstance);
    const chats = useAppSelector((state) => state.chats.chats);

    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();


        if (loading) {
            return;
        }

        setError("");

        const inputUsername = username.trim();

        const normalizedUsername = inputUsername.startsWith("@") ? inputUsername : `@${inputUsername}`;


        if (normalizedUsername.length <= 1) {
            setError("Введите username Telegram");

            return;
        }


        if (!idInstance || !apiTokenInstance) {
            setError("Telegram не авторизован");

            return;
        }


        setLoading(true);


        try {
            const http = new HttpProvider(API_PATH);

            const checkAccount =
                await queuedRequest(
                    () =>
                        http.post<CheckAccountResponse>(
                            `/waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
                            {
                                username:
                                    normalizedUsername,
                            }
                        ),
                    "checkAccount"
                );



            if (!isCheckAccountResponse(checkAccount)) {
                setError("Не удалось проверить Telegram-пользователя");

                return;
            }

            if (!checkAccount.exist || !checkAccount.chatId) {
                setError("Telegram-пользователь с таким username не найден");

                return;
            }

            const chatId = checkAccount.chatId;

            const checkedUsername = typeof checkAccount.username === "string" && checkAccount.username.length > 0 ? checkAccount.username : normalizedUsername;

            const existingChat = chats.find((chat) => chat.chatId === chatId);


            if (existingChat) {
                setCurrentChat(chatId);
                setUsername("");

                return;
            }

            const contactInfo =
                await queuedRequest(
                    () =>
                        http.post<ContactInfoResponse>(
                            `/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
                            {
                                chatId,
                            }
                        ),
                    "getContactInfo"
                );

            if (!isContactInfoResponse(contactInfo)) {
                setError("Не удалось получить информацию о Telegram-пользователе");

                return;
            }

            const name = typeof contactInfo.name === "string" && contactInfo.name.length > 0 ? contactInfo.name : (typeof contactInfo.contactName === "string" && contactInfo.contactName.length > 0 ? contactInfo.contactName : checkedUsername);
            const avatar = typeof contactInfo.avatar === "string" ? contactInfo.avatar : "";
            const phoneNumber = typeof contactInfo.phoneNumber === "number" ? contactInfo.phoneNumber : (typeof checkAccount.phoneNumber === "number" ? checkAccount.phoneNumber : 0);
            const contactUsername = typeof contactInfo.username === "string" && contactInfo.username.length > 0 ? contactInfo.username : checkedUsername;

            dispatch(
                setChatProfile({chatId, name, avatar,})
            );

            dispatch(
                addChat({chatId, name, type: "user", phoneNumber, username: contactUsername, lastMessage: "", lastMessageId: "", lastMessageTimestamp: 0,})
            );

            setCurrentChat(chatId);
            setUsername("");

        } catch (error) {
            console.error("Ошибка создания Telegram-чата:", error);
            setError("Не удалось найти Telegram-пользователя");

        } finally {
            setLoading(false);
        }
    };


    return (
        <form
            className="new_chat"
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="@username"
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
            >
                {loading ? "Поиск..." : "Новый чат"}
            </button>


            {error && (
                <div className="new_chat__error">
                    {error}
                </div>
            )}
        </form>
    );
};
