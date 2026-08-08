
import { base_url } from "../base"
import { CONTACT_US_ENDPOINT } from "../endpoints"

interface ContactProps {
    full_name: string;
    email: string;
    company_size: string;
    message: string;
}
export const contactusPost = (payload: ContactProps) => base_url.post(CONTACT_US_ENDPOINT, payload)
