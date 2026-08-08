import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Button3 } from "../../Components/components/Button";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

const ContactSupport = () => {
  const { t } = useTranslation("contact");
  return (
    <>
      <Navbar />
      <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem]">
        <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-10">
          <div className="space-y-10">
            <div>
              <h2 className="lg:text-4xl text-2xl">
                {t("support.contactTitle")}
              </h2>

              <div className="py-8 space-y-4">
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-xl" /> {t("benefits.demo")}
                </p>
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-xl" /> {t("benefits.plan")}
                </p>
                <p className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-xl" />{" "}
                  {t("benefits.onboarding")}
                </p>
              </div>
            </div>

            <p className="text-center text-[#FFD700] cursor-pointer flex  gap-2 text-sm ">
              <IoCheckmarkCircle className="text-xl" />
              {t("status")}
            </p>

            <div className="text-sm space-y-2">
              <p>{t("support.salesQuestion")}</p>
              <LocalizedLink to={"/contact/sales"}>
                <p className="flex items-center gap-3 cursor-pointer mt-3 text-white hover:text-neutral-200">
                  {t("sales.cta")} <MdKeyboardArrowRight />
                </p>
              </LocalizedLink>
            </div>

            <div className="text-sm space-y-2">
              <p>{t("support.docsBody")}</p>
              <a
                href="/api/docs/"
                className="flex items-center gap-3 hover:text-[#FFD700]"
              >
                {t("support.docsCta")} <MdKeyboardArrowRight />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center items-center bg-[#161718] border border-[#232425] text-sm p-10 rounded-xl">
            <h2>{t("support.loginBody")}</h2>
            <LocalizedLink to={"/login"}>
              <Button3 text={t("support.login")} />
            </LocalizedLink>
            <p>{t("support.emailAlternative")}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactSupport;
