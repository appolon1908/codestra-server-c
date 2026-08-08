
import { useMutation } from '@tanstack/react-query'
import { contactusPost } from '../../APIs/api/contact'

export const useContact = () => {
  return useMutation({
    mutationFn: contactusPost
  })
}
