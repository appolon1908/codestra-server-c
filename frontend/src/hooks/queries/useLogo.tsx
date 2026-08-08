import { useQuery } from '@tanstack/react-query'
import { logoGet } from '../../APIs/api/logo'

const useLogo = () => {
  return useQuery({
        queryKey: ['logo'],
        queryFn: logoGet
    })
}

export default useLogo
