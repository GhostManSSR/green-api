"use client";

import {
    ChangeEvent,
    FC,
    SubmitEvent,
    useState,
} from "react";

import {
    Button,
} from "@/components/layout/Button";

import {
    Input,
} from "@/components/layout/Input";

import {
    HttpProvider,
} from "@/HttpProvider";

import {
    API_PATH,
} from "@/utils/api";

import {
    useAppDispatch,
} from "@/store/hooks";

import {
    setChats,
} from "@/store/slices/chatsSlice";

import {
    setUser,
} from "@/store/slices/userSlice";

import "./Authorization.less";

interface GreenApiInstanceState {
    stateInstance:
        | "notAuthorized"
        | "authorized"
        | "blocked"
        | "sleepMode"
        | "starting"
        | "yellowCard"
        | "suspended";
}

interface GreenApiChat {
    chatId: string;
    name?: string;
    type?: string;
    phoneNumber?: number;
    username?: string;
}

const http = new HttpProvider(
    API_PATH,
);

export const Authorization: FC<AuthorizationType> = () => {
    const dispatch = useAppDispatch();

    const [idInstance, setIdInstance] =
        useState("");

    const [
        apiTokenInstance,
        setApiTokenInstance,
    ] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleIdInstanceChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        /*
         * Разрешаем только цифры.
         * Например: "11015502".
         */
        const numericValue =
            event.target.value.replace(
                /\D/g,
                "",
            );

        setIdInstance(numericValue);

        if (error) {
            setError("");
        }
    };

    const handleApiTokenChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        /*
         * Убираем пробелы, которые могут попасть
         * при копировании токена.
         *
         * Не фильтруем буквы: токен GREEN-API
         * является буквенно-цифровым.
         */
        const tokenValue =
            event.target.value.replace(
                /\s/g,
                "",
            );

        setApiTokenInstance(tokenValue);

        if (error) {
            setError("");
        }
    };

    const onSubmit = async (
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        setError("");

        const normalizedIdInstance =
            idInstance.trim();

        const normalizedApiToken =
            apiTokenInstance.trim();

        if (!normalizedIdInstance) {
            setError(
                "Введите IdInstance.",
            );

            return;
        }

        if (!/^\d+$/.test(normalizedIdInstance)) {
            setError(
                "IdInstance должен содержать только цифры.",
            );

            return;
        }

        if (!normalizedApiToken) {
            setError(
                "Введите ApiTokenInstance.",
            );

            return;
        }

        try {
            setLoading(true);

            const stateResponse =
                await http.get<GreenApiInstanceState>(
                    `/waInstance${normalizedIdInstance}/getStateInstance/${normalizedApiToken}`,
                );

            if ("error" in stateResponse) {
                setError(
                    `Ошибка GREEN-API (${stateResponse.status}): ${stateResponse.message}`,
                );

                return;
            }

            const instanceState =
                stateResponse.stateInstance;

            if (!instanceState) {
                setError(
                    "GREEN-API вернул некорректный статус инстанса.",
                );

                return;
            }

            if (!instanceState) {
                setError(
                    "GREEN-API вернул некорректный статус инстанса.",
                );

                return;
            }

            if (instanceState === "notAuthorized") {
                setError(
                    "Инстанс найден, но WhatsApp не авторизован. Подключите номер в личном кабинете GREEN-API.",
                );

                return;
            }

            if (instanceState === "blocked") {
                setError(
                    "Инстанс заблокирован. Проверьте его статус в личном кабинете GREEN-API.",
                );

                return;
            }

            if (instanceState === "suspended" || instanceState === "yellowCard") {
                setError(
                    "Для инстанса действуют временные ограничения. Проверьте статус в GREEN-API.",
                );

                return;
            }

            if (instanceState === "starting") {
                setError(
                    "Инстанс запускается. Подождите несколько минут и повторите попытку.",
                );

                return;
            }

            if (instanceState === "sleepMode") {
                setError(
                    "Инстанс находится в sleep mode. Включите телефон с WhatsApp и повторите попытку через несколько минут.",
                );

                return;
            }

            if (instanceState !== "authorized") {
                setError(
                    "Не удалось подтвердить статус инстанса.",
                );

                return;
            }


            const chats =
                await http.get<GreenApiChat[]>(
                    `/waInstance${normalizedIdInstance}/getChats/${normalizedApiToken}`,
                );

            if (!Array.isArray(chats)) {
                setError(
                    "Не удалось получить список чатов. GREEN-API вернул некорректный ответ.",
                );

                return;
            }

            dispatch(
                setUser({
                    idInstance:
                    normalizedIdInstance,
                    apiTokenInstance:
                    normalizedApiToken,
                }),
            );

        } catch (requestError: unknown) {
            console.error(
                "Ошибка авторизации GREEN-API:",
                requestError,
            );

            setError(
                "Не удалось подключиться к GREEN-API. Проверьте IdInstance, ApiTokenInstance и подключение к интернету.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="authorization">
            <section className="authorization__block">
                <div
                    className="authorization__logo"
                    aria-hidden="true"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="42"
                        height="42"
                        fill="none"
                    >
                        <path
                            d="M21.4 3.6L18.3 20c-.2 1.2-.9 1.5-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L5.8 13.6 1 12.1c-1.1-.3-1.1-1 .2-1.5L20 3.3c.9-.3 1.7.2 1.4 1.3Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>

                <h1 className="authorization__title">
                    Добро пожаловать
                </h1>

                <p className="authorization__description">
                    Введите данные вашего
                    GREEN-API инстанса, чтобы
                    открыть чаты.
                </p>

                <form
                    className="authorization__form"
                    onSubmit={onSubmit}
                >
                    <label
                        className="authorization__label"
                    >
                        <span className="authorization__label-text">
                            IdInstance
                        </span>

                        <Input
                            classList={[
                                "authorization__input",
                            ]}
                            type="text"
                            name="idInstance"
                            value={idInstance}
                            disabled={loading}
                            required
                            minLength={1}
                            maxLength={20}
                            inputMode="numeric"
                            pattern="[0-9]+"
                            autoComplete="username"
                            placeholder="Например, 11015502"
                            onChange={
                                handleIdInstanceChange
                            }
                        />
                    </label>

                    <label
                        className="authorization__label"
                    >
                        <span className="authorization__label-text">
                            ApiTokenInstance
                        </span>

                        <Input
                            classList={[
                                "authorization__input",
                            ]}
                            type="password"
                            name="apiTokenInstance"
                            value={apiTokenInstance}
                            disabled={loading}
                            required
                            minLength={1}
                            autoComplete="current-password"
                            placeholder="Введите токен доступа"
                            onChange={
                                handleApiTokenChange
                            }
                        />
                    </label>

                    {error && (
                        <div
                            className="authorization__error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <Button
                        classList={[
                            "authorization__submit",
                        ]}
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Проверка..."
                            : "Продолжить"}
                    </Button>
                </form>

                <p className="authorization__hint">
                    Данные используются только
                    для обращения к API GREEN-API.
                </p>
            </section>
        </main>
    );
};