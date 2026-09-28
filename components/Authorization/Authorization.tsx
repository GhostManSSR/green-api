import {
    FC,
    SubmitEvent,
    useState,
} from "react";

import {Button} from "@/components/layout/Button";
import {Input} from "@/components/layout/Input";
import {HttpProvider} from "@/HttpProvider";
import {API_PATH} from "@/utils/api";
import {useAppDispatch} from "@/store/hooks";
import {setChats} from "@/store/slices/chatsSlice";
import {setUser} from "@/store/slices/userSlice";

import "./Authorization.less";

const http = new HttpProvider(API_PATH);

export const Authorization: FC<AuthorizationType> = () => {
    const dispatch = useAppDispatch();

    const [idInstance, setLogin] =
        useState("");

    const [
        apiTokenInstance,
        setPassword,
    ] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const onSubmit =
        async (
            event: SubmitEvent<HTMLFormElement>,
        ) => {
            event.preventDefault();

            setError("");

            if (
                !idInstance.trim() ||
                !apiTokenInstance.trim()
            ) {
                setError(
                    "Введите IdInstance и ApiTokenInstance",
                );

                return;
            }

            try {
                setLoading(true);

                const response =
                    await http.get<any>(
                        `/waInstance${idInstance}/getChats/${apiTokenInstance}/`,
                    );

                dispatch(
                    setChats(response),
                );

                dispatch(
                    setUser({
                        idInstance,
                        apiTokenInstance,
                    }),
                );
            } catch (error) {
                console.error(error);

                setError(
                    "Не удалось авторизоваться. Проверьте IdInstance и ApiTokenInstance.",
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
                        className="authorization__logo-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        focusable="false"
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
                            value={idInstance}
                            disabled={loading}
                            onChange={
                                event =>
                                    setLogin(
                                        event.target.value,
                                    )
                            }
                            placeholder="Например, 7103..."
                            autoComplete="username"
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
                            value={apiTokenInstance}
                            disabled={loading}
                            onChange={
                                event =>
                                    setPassword(
                                        event.target.value,
                                    )
                            }
                            placeholder="Введите токен доступа"
                            autoComplete="current-password"
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
                            ? "Подключение..."
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