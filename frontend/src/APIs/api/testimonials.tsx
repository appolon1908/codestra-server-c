import { base_url } from "../base";
import { TESTIMONIALS_ENDPOINT_GET } from "../endpoints";

export const testimonialGet = () => base_url.get(TESTIMONIALS_ENDPOINT_GET)