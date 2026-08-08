import Footer from "../../Components/Layouts/Footer";
import Navbar from "../../Components/Layouts/Navbar";
import { Button2a } from "../../Components/components/Button";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useContact } from "../../hooks/mutations/useContact";
import { useForm } from "react-hook-form";
import { SuccessModal } from "../../Components/components/Modals";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import LocalizedLink from "../../i18n/LocalizedLink";

type ContactProps = {
  full_name: string;
  email: string;
  company_size: string;
  message: string;
};

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ContactSales = () => {
  const { t } = useTranslation("contact");

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const { mutate, isPending } = useContact();

  const {
    handleSubmit,
    register,
    // formState: { errors },
  } = useForm<ContactProps>();

  const onSubmit = (data: ContactProps) => {
    mutate(data, {
      onSuccess(details) {
        setIsOpen(true);
        toast.success(details.data.message);
      },

      onError(error) {
        const err = error as ErrorResponse;
        const errorMessage =
          err.response?.data?.message || t("form.unexpectedError");
        toast.error(errorMessage);
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="lg:px-[25rem] px-5 lg:pt-[10rem] pt-[8rem]">
        <ToastContainer theme="light" autoClose={4000} />

        <div className="grid lg:grid-cols-2 lg:justify-center grid-cols-1 lg:gap-0 gap-10 text-sm">
          <div>
            <h2 className="lg:text-4xl text-2xl">{t("sales.contactTitle")}</h2>

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

            <div className="text-[#B4B5B5] space-y-3">
              <p>{t("sales.supportQuestion")}</p>
              <LocalizedLink to={"/contact/support"}>
                <p className="flex items-center gap-3 cursor-pointer mt-3 text-white hover:text-neutral-200">
                  {t("sales.supportCta")} <MdKeyboardArrowRight />
                </p>
              </LocalizedLink>
            </div>
          </div>

          <div className="text-xs lg:p-10 p-5 border border-[#1f2229] rounded-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="sales-full-name" className="text-sm text-white">
                  {t("form.fullName")}
                </label>
                <input
                  id="sales-full-name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("form.fullNamePlaceholder")}
                  className="bg-[#262729] w-full outline-none focus:border-2 focus:border-gray-600 text-white p-3 rounded-md"
                  {...register("full_name", { required: true })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sales-email" className="text-sm text-white">
                  {t("form.workEmail")}
                </label>
                <input
                  id="sales-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("form.emailPlaceholder")}
                  className="bg-[#262729] w-full outline-none focus:border-2 focus:border-gray-600 text-white p-3 rounded-md"
                  {...register("email", { required: true })}
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label htmlFor="company_size" className="text-sm text-white ">
                  {t("form.companySize")}
                </label>
                <div className="relative">
                  <select
                    className="appearance-none bg-[#262729] outline-none focus:border-2 focus:border-gray-600 w-full text-white p-3 rounded-md cursor-pointer"
                    defaultValue=""
                    {...register("company_size", { required: true })}
                    id="company_size"
                  >
                    <option disabled value="">
                      {t("form.selectSize")}
                    </option>
                    <option value="1-20">1-20</option>
                    <option value="21-50">21-50</option>
                    <option value="51-100">51-100</option>
                    <option value="101-200">101-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sales-message" className="text-sm text-white">
                  {t("form.message")}
                </label>
                <textarea
                  id="sales-message"
                  className="bg-[#262729]  max-w-full min-w-full max-h-[10rem] min-h-[10rem] outline-none focus:border-2 focus:border-gray-600 text-white p-3 rounded-md"
                  placeholder={t("form.messagePlaceholder")}
                  {...register("message", { required: true })}
                />
              </div>

              <div className="flex lg:flex-row flex-col gap-4 lg:items-center lg:justify-between">
                <h2>{t("sales.emailAlternative")}</h2>
                <Button2a
                  type="submit"
                  text={t("form.send")}
                  isPending={isPending}
                />
              </div>
            </form>
          </div>
        </div>
        {isOpen && (
          <SuccessModal
            isOpen={isOpen}
            openModal={openModal}
            closeModal={closeModal}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default ContactSales;
