import { LOGIN_ENDPOINT } from "../endpoints";
import { base_url } from "../base";

interface loginProps {
    email: string;
    password: string;
}

export const loginPost = (payload : loginProps) => base_url.post(LOGIN_ENDPOINT, payload)
