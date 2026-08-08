import { registerPost } from '@/APIs/api/signup'
import { useMutation } from '@tanstack/react-query'

const useSignup = () => {
  return useMutation({
    mutationFn: registerPost
  })
}

export default useSignup