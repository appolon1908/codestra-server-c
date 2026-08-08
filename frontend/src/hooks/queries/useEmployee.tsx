
import { useQuery } from '@tanstack/react-query'
import { employeeGet } from '../../APIs/api/employee'

const useEmployee = () => {
  return useQuery({
    queryKey: ['employee'],
    queryFn: employeeGet
  })
}

export default useEmployee
