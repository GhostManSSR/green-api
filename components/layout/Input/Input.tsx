import {FC} from "react";
import "./Input.less"

export const Input:FC<InputProps> = ({...props}) => {

    return <input name={props.name} pattern={props.pattern} inputMode={props.inputMode} maxLength={props.maxLength} minLength={props.minLength} required={props.required} autoComplete={props.autoComplete} disabled={props.disabled} onKeyDown={props.onKeyDown} value={props.value} placeholder={props.placeholder} type={props.type} onChange={props.onChange} className={"input " + props.classList?.join(" ")}/>
}