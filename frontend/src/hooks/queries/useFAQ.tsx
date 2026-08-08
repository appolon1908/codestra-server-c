import { useQuery } from '@tanstack/react-query'
import { faqGet } from '../../APIs/api/faq'

const useFAQ = () => {
  return useQuery({
    queryKey: ['faq'],
    queryFn: faqGet
  })
}

export default useFAQ