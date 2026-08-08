import { LuMessageCircle } from "react-icons/lu";
import Navbar from "../../Components/Layouts/Navbar";
import { Button3 } from "../../Components/components/Button";
import { GrMail } from "react-icons/gr";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

const ContactUs = () => {
  const { t } = useTranslation("contact");
  return (
    <div>
      <Navbar />
      <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem] text-center">
        <h2 className="lg:text-4xl text-2xl font-semibold pb-4">
          {t("overview.title")}
        </h2>
        <p className="lg:text-base text-sm text-[#B4B5B5]">
          {t("overview.body")}
        </p>

        <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-16 gap-5 text-left pt-20 ">
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="bg-[#151517] lg:p-10 p-5 rounded-2xl border border-[#1f1f22] "
          >
            <h2 className="text-2xl flex items-center gap-2">
              <GrMail />
              {t("sales.title")}
            </h2>
            <p className="text-sm py-4 text-[#B4B5B5]">
              {t("sales.description")}
            </p>
            <LocalizedLink to={"/contact/sales"}>
              <Button3 text={t("sales.cta")} />
            </LocalizedLink>
          </div>

          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="bg-[#151517] lg:p-10 p-5 rounded-2xl border border-[#1f1f22] "
          >
            <h2 className="text-2xl flex items-center gap-2">
              <LuMessageCircle />
              {t("support.title")}
            </h2>
            <p className="text-sm py-4 text-[#B4B5B5] w-[60%]">
              {t("support.description")}
            </p>
            <LocalizedLink to={"/contact/support"}>
              <Button3 text={t("support.cta")} />
            </LocalizedLink>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-duration="500"
          className="text-sm grid lg:grid-cols-2 grid-cols-1 text-left lg:gap-14 gap-10 lg:justify-center lg:m-auto lg:mt-[5rem] mt-[5rem] px-[2rem]"
        >
          <div>
            <h2 className="text-lg">{t("community.title")}</h2>
            <p className="text-sm py-4 text-[#B4B5B5] lg:w-[60%] w-full">
              {t("community.body")}
            </p>
            <p className="flex items-center gap-2">
              {t("community.cta")} <MdKeyboardArrowRight />
            </p>
          </div>

          <div>
            <h2 className="text-lg">{t("general.title")}</h2>
            <p className="text-sm py-4 text-[#B4B5B5] lg:w-[60%] w-full">
              {t("general.body")}
            </p>
            <p className="flex items-center gap-2">
              <GrMail /> info@codestra.co
            </p>
          </div>

          <div>
            <h2 className="text-lg">{t("documentation.title")}</h2>
            <p className="text-xs py-4 text-[#B4B5B5] lg:w-[60%] w-full">
              {t("documentation.body")}
            </p>
            <a
              href="/api/docs/"
              className="flex items-center gap-2 hover:text-[#FFD700]"
            >
              {t("documentation.cta")} <MdKeyboardArrowRight />
            </a>
          </div>

          <div>
            <h2 className="text-lg">{t("developers.title")}</h2>
            <p className="text-xs py-4 text-[#B4B5B5] w-[70%]">
              {t("developers.body")}
            </p>
            <a
              href="/api/schema/"
              className="flex items-center gap-2 hover:text-[#FFD700]"
            >
              {t("developers.cta")} <MdKeyboardArrowRight />
            </a>
          </div>
        </div>

        <p className="text-center text-[#FFD700] cursor-pointer pt-[5rem] flex items-center gap-2 justify-center m-auto text-sm ">
          <IoCheckmarkCircle className="text-xl" />
          {t("status")}
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
