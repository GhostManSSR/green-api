export const getMessageText = (
    message: LastMessageType
): string => {

    switch (message.typeMessage) {

        case "textMessage":

            return (
                message.textMessage ||
                ""
            );


        case "extendedTextMessage":

            return (
                message.extendedTextMessage?.text ||
                ""
            );



        case "imageMessage":

            return (
                message.caption ||
                "📷 Фото"
            );
        case "videoMessage":

            return (
                message.caption ||
                "🎥 Видео"
            );
        case "documentMessage":

            return (
                message.caption ||
                `📎 ${
                    message.fileName ||
                    "Документ"
                }`
            );

        case "audioMessage":

            return (
                message.caption ||
                "🎵 Аудио"
            );

        case "stickerMessage":
            return "💬 Стикер";

        case "locationMessage":
            return "📍 Геолокация";
        case "contactMessage":
            return "👤 Контакт";
        default:

            return `Сообщение: ${message.typeMessage}`;
    }
};