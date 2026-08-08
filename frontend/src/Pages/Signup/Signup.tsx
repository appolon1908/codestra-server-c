
import { useState } from 'react'
import { HiEye } from "react-icons/hi";
import { HiEyeOff } from "react-icons/hi";
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import useSignup from '@/hooks/mutations/useSignup';
import { toast, ToastContainer } from 'react-toastify';
import logo from '../../assets/logo.png'
import LocalizedLink from '../../i18n/LocalizedLink';


type FormData = {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
}


interface ErrorResponse {
  response?: {
    data?: {
      email?: string[]
      non_field_errors?: string[] 
    }
  }
}

 const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {mutate, isPending} = useSignup()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

    const {
      register, 
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormData>({mode: 'all'})
  
    const onSubmit = (data:FormData) => {
      mutate(data, {
        onSuccess: () => {
          reset()
          navigate('/login', { replace: true })
        },
        onError: (error) => {
          const err = error as ErrorResponse;
          console.error('Login failed:', error)
          const errorMessage = err.response?.data?.email?.[0] || "An unexpected error occurred"
          toast.error(errorMessage)
        },
      })
    }

  return (
    <div className="min-h-screen flex flex-col gap-4 text-xs items-center justify-center bg-[#080808] px-3">

        <div className='pb-6'>
          <LocalizedLink to={'/'}><img src={logo} alt={t('codestraHome')} className='w-40'/></LocalizedLink>
        </div>
      <div className="2xl:w-[25%] xl:w-[60%] lg:w-[70%] w-[95%] relative bg-[#121212] rounded-xl p-8">
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">{t('signup.title')}</h1>
            <p className="text-gray-400">{t('signup.body')}</p>
          </div>

          <ToastContainer theme='light' autoClose={4000}/>


          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-first-name" className="text-sm text-white">{t('firstName.label')}</label>
              <input 
                type="text"
                {...register('first_name', {required: true})}
                id="signup-first-name"
                placeholder={t('firstName.placeholder')}
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.first_name && t('firstName.required')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="signup-last-name" className="text-sm text-white">{t('lastName.label')}</label>
              <input 
                type="text"
                {...register('last_name', {required: true})}
                id="signup-last-name"
                placeholder={t('lastName.placeholder')}
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.last_name && t('lastName.required')}</p>
            </div>


            <div className="flex flex-col gap-2">
              <label htmlFor="signup-email" className="text-sm text-white">{t('email.label')}</label>
              <input 
                type="email"
                {...register('email', {required: true})}
                id="signup-email"
                placeholder={t('email.placeholder')}
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.email && t('email.required')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="signup-password" className="text-sm text-white">{t('password.label')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', {required: true})}
                  id="signup-password"
                  placeholder={t('password.placeholder')}
                  className="bg-[#262729] border-0 text-white p-3 rounded-lg w-full"
                />
                <button 
                  type='button'
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={t(showPassword ? 'password.hide' : 'password.show')}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                <p className="text-red-200 pt-1">{errors?.password && t('password.required')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input id="signup-remember" type="checkbox" defaultChecked className="checkbox border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black" />
              <label htmlFor="signup-remember" className="text-sm text-gray-300">
                {t('remember')}
              </label>
            </div>

            {!isPending ? 
              <button type="submit" className="w-full bg-white p-3 rounded-lg text-black hover:bg-gray-200">
                {t('signup.submit')}
              </button> :
              <button type="button" className="w-full flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-neutral-400 hover:bg-gray-200">
                <span className="loading loading-spinner loading-sm"></span>
                {t('loading')}
              </button>
            }

            <p className="text-center text-gray-400 text-sm">
              {t('signup.haveAccount')}{' '}
              <LocalizedLink to="/login" className="text-white underline hover:text-gray-200">{t('signup.login')}</LocalizedLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}


export default Signup
