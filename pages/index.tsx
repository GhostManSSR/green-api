import Head from "next/head";
import {useEffect, useState} from "react";

import { ChatList } from "@/components/ChatList";
import { Authorization } from "@/components/Authorization";
import { Chat } from "@/components/Chat/Chat";
import { MediaBreakPoint } from "@/utils/MediaBreakPoint";

import { useAppSelector } from "@/store/hooks";

export default function Home() {
    const isAuth = useAppSelector(
        (state) => state.user.idInstance
    );
    const loading = useAppSelector((state) => state.chats.loading);

    const [currentChat, setCurrentChat] =
        useState<string>("");

    useEffect(() => {
        loading == true ? setCurrentChat("") : null;
    },[])

    const isAuthorized =
        isAuth.length > 0;

    return (
        <>
            <Head>
                <title>
                    Application transfer message Max
                </title>

                <meta
                    name="description"
                    content="Application transfer message Max"
                />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />

                <link
                    rel="icon"
                    href="/favicon.ico"
                />
            </Head>

            {!isAuthorized ? (
                <Authorization
                    isAuth={false}
                />
            ) : (
                <MediaBreakPoint
                    /*
                     * DESKTOP
                     */
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