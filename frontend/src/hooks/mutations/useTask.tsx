import { useMutation } from '@tanstack/react-query'
import { taskPost } from '../../APIs/api/taskEnpoint'

const useTask = () => {
  return useMutation({
    mutationFn: taskPost
  })
  
}

export default useTask