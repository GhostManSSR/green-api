import {FC} from "react";
import {Header} from "@/components/layout/Header";

export const Layout: FC<LayoutType> = ({...props}) => {

    return (
        <>
            <Header/>
            <main className="layout__main">
                {props.children}
            </main>
        </>
    )
}