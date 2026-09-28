
type InputProps = {
    type: "text" | "area" | "password";
    classList?: string[];
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    name?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    inputMode?:  "search" | "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined;
    pattern?: string;
}