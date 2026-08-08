import { base_url } from "../base";
import { FAQS_ENDPOINT_GET } from "../endpoints";


export const faqGet = () => base_url.get(FAQS_ENDPOINT_GET)