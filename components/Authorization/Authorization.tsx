import {FC, FormEvent, useState} from "react";
import {Button} from "@/components/layout/Button";
import {Input} from "@/components/layout/Input";
import {HttpProvider} from "@/HttpProvider";
import "./Authorization.less"
import {API_PATH} from "@/utils/api";
import {useAppDispatch} from "@/store/hooks";
import {setChats} from "@/store/slices/chatsSlice";
import {useRouter} from "next/navigation";
import {setUser} from "@/store/slices/userSlice";

const http = new HttpProvider(API_PATH);

export const Authorization: FC<AuthorizationType> = ({...props}) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [idInstance, setLogin] = useState("");
    const [apiTokenInstance, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");

        if (!idInstance || !apiTokenInstance) {
            setError("Заполните логин и пароль");
            return;
        }

        try {
            setLoading(true);

            const response = await http.get<any>(
                `/waInstance${idInstance}/getChats/${apiTokenInstance}/`,
            );

            dispatch(setChats(response));
            dispatch(setUser({
                idInstance: idInstance,
                apiTokenInstance: apiTokenInstance
            }))
        } catch (error) {
            console.error(error);

            setError("Неверный логин или пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authorization__block">
            <form
                className="authorization__form"
                onSubmit={onSubmit}
            >
                <label>
                    Логин

                    <Input
                        type="text"
                        value={idInstance}
                        onChange={(event) => setLogin(event.target.value)}
                        placeholder="Введите IdInstance"
                    />
                </label>

                <label>
                    Пароль

                    <Input
                        type="password"
                        value={apiTokenInstance}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Введите apiTockenInstance"
                    />
                </label>

                {error && (
                    <div className="authorization__error">
                        {error}
                    </div>
                )}

                <Button type="submit">
                    {loading
                        ? "Авторизация..."
                        : "Авторизироваться"
                    }
                </Button>
            </form>
        </div>
    );
};