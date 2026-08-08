
import { testimonialGet } from '@/APIs/api/testimonials'
import { useQuery } from '@tanstack/react-query'

const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: testimonialGet
  })
}

export default useTestimonials