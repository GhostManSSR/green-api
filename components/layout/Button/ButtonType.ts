
type ButtonType = {
    children?: React.ReactNode;
    classList?: string[];
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
}