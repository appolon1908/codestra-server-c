import { useMutation } from "@tanstack/react-query"
import { electronicBillingInterestPost } from "../../APIs/api/electronicBilling"

export const useElectronicBillingInterest = () => useMutation({
  mutationFn: electronicBillingInterestPost,
})
