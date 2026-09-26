import {FC} from "react";
import {HeaderProps} from "@/components/layout/Header/HeaderType";

export const Header:FC<HeaderProps> = ({...props}) => {
    return (
        <header className="header">
            <div className="header__column">
                Logo
            </div>
            <div className="header__column">

            </div>
        </header>
    )
}