import {FC} from "react";


export const Layout: FC<LayoutType> = ({...props}) => {

    return (
        <>

            <main className="layout__main">
                {props.children}
            </main>
        </>
    )
}