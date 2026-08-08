import { base_url } from "../base"
import { ELECTRONIC_BILLING_INTEREST_ENDPOINT } from "../endpoints"

export type ElectronicBillingInterest = {
  full_name: string
  email: string
  phone: string
  uses_erp: boolean
  consent_to_contact: boolean
}

export const electronicBillingInterestPost = (payload: ElectronicBillingInterest) =>
  base_url.post(ELECTRONIC_BILLING_INTEREST_ENDPOINT, payload)
