"use client";

import { FC } from "react";
import { ChatItemProps } from "@/components/ChatItem/ChatItemProps";
import "./ChatItem.less";

export const ChatItem: FC<ChatItemProps> = ({ ...props }) => {

    return (
        <div className="chat_item" onClick={() => props.setCurrentChat(props.chatId)} style={props.currentChat == props.chatId ? {background:"aqua"} : {}}>

            <div className="chat_item__avatar">
                <img src={props.avatar}/>
                {/*{props.name?.charAt(0).toUpperCase() || "?"}*/}
            </div>

            <div className="chat_item__content">

                <div className="chat_item__top">
                    <div className="chat_item__name">
                        {props.name}
                    </div>
                </div>

                <div className="chat_item__message">
                    {props.lastMessage || "Нет сообщений"}
                </div>

            </div>

        </div>
    );
};