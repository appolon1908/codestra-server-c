import { TASK_ENDPOINT_CREATE } from "../endpoints"
import { base_url } from "../base"

interface taskProps {
    address_reference:string
    visiting_hours:string
    representation_rnc:string
    name_of_representative:string
    representative_phone:string
    representative_cell_phone:string
    representative_email:string
    operation_carried_out_in_premise:string
    street_of_warehouse:string
    store_or_warehouse_number:string
    province_of_warehouse:string
    warehouse_reference:string
    local_administration:string
    warehouse_sector:string
    tax_payer_rnc:string
    name_of_tax_payer:string
    trade_name:string
    tax_payer_telephone:string
    tax_payer_cell_phone:string
    tax_payer_email:string
    tax_payer_number:string
    tax_payer_sector:string
    tax_payer_province:string
}

export const taskPost = (payload: taskProps) => base_url.post(TASK_ENDPOINT_CREATE, payload)