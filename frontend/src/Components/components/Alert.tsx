
import { useTranslation } from "react-i18next";

export const Alert = () => {
  const { t } = useTranslation("common");
  return (
    <div className="flex justify-center m-auto left-0 z-50 top-[6rem] right-0 fixed">
        <div data-aos="fade-up" data-aos-duration="500" role="alert" className="alert bg-green-100 text-green-800 border border-green-300
         rounded-lg flex items-center m-auto justify-center lg:w-fit py-3 p-5 w-[90%] text-sm alert-success ">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t("status.dataSent")}</span>
        </div>
    </div>
  )
}
