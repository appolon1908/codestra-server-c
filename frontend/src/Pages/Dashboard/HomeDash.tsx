import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { clearAccessToken } from "@/lib/auth"
import { Button2 } from "../../Components/components/Button"
import LocalizedLink from "../../i18n/LocalizedLink"

const HomeDash = () => {
  const { t } = useTranslation("common")
  const navigate = useNavigate()
  const handleLogout = () =>{
       clearAccessToken()
       navigate('/', { replace: true })
   }  

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <Button2 text={t("dashboard.logout")} onClick={handleLogout}/>
      <LocalizedLink to="/">{t("dashboard.home")}</LocalizedLink>
      <LocalizedLink to="/auth/webhooks">{t("dashboard.webhooks")}</LocalizedLink>
    </div>
  )
}

export default HomeDash
