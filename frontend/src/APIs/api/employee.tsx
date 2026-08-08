import { base_url } from "../base";
import { EMPLOYEE_LIST_ENDPOINT } from "../endpoints";


export const employeeGet = () => base_url.get(EMPLOYEE_LIST_ENDPOINT)