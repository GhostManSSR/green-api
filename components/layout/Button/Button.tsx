import {FC} from "react";
import "./Button.less"

export const Button:FC<ButtonType> = ({...props}) => {


    return <button className={"button " + props.classList?.join(' ')} type={props.type} onClick={props.onClick} disabled={props.disabled}>{props.children}</button>
}