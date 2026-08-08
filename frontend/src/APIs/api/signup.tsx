import { base_url } from "../base";
import { REGISTER_ENDPOINT } from "../endpoints";


interface SingnupProps {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}
export const registerPost = (payload: SingnupProps) => base_url.post(REGISTER_ENDPOINT, payload)