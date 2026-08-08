import { base_url } from "../base";
import { LOGO_ENDPOINT } from "../endpoints";


export const logoGet = () => base_url.get(LOGO_ENDPOINT)