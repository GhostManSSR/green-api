"use client";

import {
    FC,
    ReactNode,
    useEffect,
    useState,
} from "react";

interface MediaBreakPointProps {
    children: ReactNode;
    mobile: ReactNode;
    breakpoint?: number;
}

export const MediaBreakPoint: FC<MediaBreakPointProps> = ({children, mobile, breakpoint = 768,}) => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            `(max-width: ${breakpoint - 1}px)`
        );

        const handleChange = () => {
            setIsMobile(mediaQuery.matches);
        };

        handleChange();

        mediaQuery.addEventListener(
            "change",
            handleChange
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleChange
            );
        };
    }, [breakpoint]);

    if (isMobile === null) {
        return null;
    }

    return (
        <>
            {isMobile ? mobile : children}
        </>
    );
};