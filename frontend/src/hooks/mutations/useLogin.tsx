import { useMutation } from "@tanstack/react-query"
import { loginPost } from "../../APIs/api/login"
export const useLogin = ()=>{
    return useMutation({
        mutationFn: loginPost
    })
}