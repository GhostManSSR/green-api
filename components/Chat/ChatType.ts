

export type ChatProps = {
    currentChat: string
    onBack?: () => void;
}

export type SendMessageResponse =  {
    idMessage?: string;
}