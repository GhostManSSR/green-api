import Head from "next/head";
import {useEffect, useState} from "react";

import { ChatList } from "@/components/ChatList";
import { Authorization } from "@/components/Authorization";
import { Chat } from "@/components/Chat/Chat";
import { MediaBreakPoint } from "@/utils/MediaBreakPoint";

import { useAppSelector } from "@/store/hooks";

export default function Home() {
    const isAuth = useAppSelector((state) => state.user.idInstance);
    const loading = useAppSelector((state) => state.chats.loading);

    const [currentChat, setCurrentChat] = useState<string>("");

    useEffect(() => {
        loading == true ? setCurrentChat("") : null;
    },[])

    const isAuthorized = isAuth.length > 0;

    return (
        <>
            <Head>
                <title>
                    Telegram GREEN-API Messenger
                </title>

                <meta
                    name="description"
                    content="Telegram GREEN-API Messenger"
                />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />

                <link
                    rel="icon"
                    href="/favicon-16x16.png"
                />
            </Head>

            {!isAuthorized ? (
                <Authorization
                    isAuth={false}
                />
            ) : (
                <MediaBreakPoint
                    children={
                        <div className="general__block">
                            <ChatList
                                setCurrentChat={
                                    setCurrentChat
                                }
                                currentChat={
                                    currentChat
                                }
                            />

                            <Chat
                                currentChat={
                                    currentChat
                                }
                            />
                        </div>
                    }

                    mobile={
                        currentChat ? (
                            <Chat
                                currentChat={
                                    currentChat
                                }
                                onBack={() =>
                                    setCurrentChat("")
                                }
                            />
                        ) : (
                            <ChatList
                                setCurrentChat={
                                    setCurrentChat
                                }
                                currentChat={
                                    currentChat
                                }
                            />
                        )
                    }
                />
            )}
        </>
    );
}