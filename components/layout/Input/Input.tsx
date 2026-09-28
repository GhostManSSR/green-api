import {FC} from "react";
import "./Input.less"

export const Input:FC<InputProps> = ({...props}) => {

    return <input disabled={props.disabled} onKeyDown={props.onKeyDown} value={props.value} placeholder={props.placeholder} type={props.type} onChange={props.onChange} className={"input " + props.classList?.join(" ")}/>
}