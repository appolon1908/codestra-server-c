

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { clearAccessToken, hasUsableAccessToken } from "@/lib/auth";


interface AuthProps {
    element: React.ReactNode
}

const AuthProvider = ({element} : AuthProps) => {

    const navigate = useNavigate()
    const isAuthenticated = hasUsableAccessToken()
    
    useEffect(() => {
        if (!isAuthenticated) {
            clearAccessToken()
            navigate('/login', { replace: true })
        }
    }, [isAuthenticated, navigate])

  return isAuthenticated ? element : null
}

export default AuthProvider
