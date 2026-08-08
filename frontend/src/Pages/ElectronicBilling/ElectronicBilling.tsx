import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { Button2, Button2b, Button3 } from "../../Components/components/Button";
import { RiFolderTransferLine } from "react-icons/ri";
import { BsStack } from "react-icons/bs";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoIosWallet } from "react-icons/io";
import formImage from "../../assets/form.png";
import benefitImage from "../../assets/benefit.png";
import { TbMinusVertical } from "react-icons/tb";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";
import { GoPlusCircle } from "react-icons/go";
import { useState } from "react";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useElectronicBillingInterest } from "../../hooks/mutations/useElectronicBillingInterest";
import type { ElectronicBillingInterest as ElectronicBillingInterestPayload } from "../../APIs/api/electronicBilling";

const ElectronicBilling = () => {
  const { t } = useTranslation("billing");
  const benefitCards = t("page.benefits.items", {
    returnObjects: true,
  }) as Array<{ name: string; description: string }>;
  const plans = t("page.plans.cards", { returnObjects: true }) as Array<{
    title: string;
    implementation: string;
    tiers: string[];
  }>;
  const faqData = t("page.faq.items", { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const billingInterest = useElectronicBillingInterest();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ElectronicBillingInterestPayload>({
    defaultValues: { uses_erp: true, consent_to_contact: true },
  });
  const [submissionMessage, setSubmissionMessage] = useState("");

  const submitBillingInterest = (values: ElectronicBillingInterestPayload) => {
    setSubmissionMessage("");
    billingInterest.mutate(values, {
      onSuccess: () => {
        setSubmissionMessage(t("page.form.success"));
        reset({ uses_erp: true, consent_to_contact: true });
      },
      onError: () => setSubmissionMessage(t("page.form.error")),
    });
  };

  return (
    <div>
      <Navbar />
      <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem]">
        <div className="myBg lg:min-h-[80vh] flex lg:flex-row flex-col 2xl:gap-[5rem] xl:gap-[5rem] lg:gap-[4rem] gap-6">
          <div
            className="space-y-3 w-full"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            <h2 className="text-3xl text-[#FFD700]">{t("page.hero.title")}</h2>
            <p className="text-base ">{t("page.hero.body")}</p>
            <LocalizedLink to="/contact/sales">
              <Button2 text={t("page.contact")} />
            </LocalizedLink>
          </div>

          <form
            onSubmit={handleSubmit(submitBillingInterest)}
            data-aos="fade-up"
            data-aos-duration="500"
            className="space-y-6 p-5 rounded-3xl w-full bg-neutral-900 border border-neutral-800 h-fit"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="billing-interest-name"
                  className="lg:text-sm text-xs text-white"
                >
                  {t("page.form.fullName")}
                </label>
                <input
                  id="billing-interest-name"
                  type="text"
                  autoComplete="name"
                  placeholder={t("page.form.fullNamePlaceholder")}
                  className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg"
                  {...register("full_name", { required: true })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="billing-interest-email"
                  className="lg:lg:text-sm text-xs text-white"
                >
                  {t("page.form.email")}
                </label>
                <input
                  id="billing-interest-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("page.form.emailPlaceholder")}
                  className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg"
                  {...register("email", { required: true })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="billing-interest-phone"
                  className="lg:text-sm text-xs text-white"
                >
                  {t("page.form.phone")}
                </label>
                <input
                  id="billing-interest-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t("page.form.phonePlaceholder")}
                  className="bg-[#262729] 2xl:text-xs xl:text-xs lg:text-xs text-xs border-0 text-white p-3 rounded-lg w-full"
                  {...register("phone", { required: true })}
                />
              </div>

              <div className="lg:text-sm text-xs">
                <h2>{t("page.form.usesErp")}</h2>
                <div className="flex items-center gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="billing-erp-yes"
                      type="radio"
                      value="true"
                      className="radio w-5 h-5"
                      {...register("uses_erp", {
                        setValueAs: (value) => value === "true",
                      })}
                    />
                    <label htmlFor="billing-erp-yes">{t("form.yes")}</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="billing-erp-no"
                      type="radio"
                      value="false"
                      className="radio w-5 h-5"
                      {...register("uses_erp", {
                        setValueAs: (value) => value === "true",
                      })}
                    />
                    <label htmlFor="billing-erp-no">{t("form.no")}</label>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <input
                    id="billing-interest-consent"
                    type="checkbox"
                    className="checkbox w-5 h-5"
                    {...register("consent_to_contact", { required: true })}
                  />
                  <label htmlFor="billing-interest-consent">
                    {t("page.form.consent")}
                  </label>
                </div>
              </div>

              <div className="flex lg:justify-end lg:ml-auto">
                <Button2b
                  type="submit"
                  text={t("page.form.submit")}
                  isPending={billingInterest.isPending}
                />
              </div>
              {(submissionMessage || errors.consent_to_contact) && (
                <p
                  role="status"
                  className={
                    billingInterest.isError || errors.consent_to_contact
                      ? "text-red-300"
                      : "text-green-300"
                  }
                >
                  {errors.consent_to_contact
                    ? t("page.form.consentError")
                    : submissionMessage}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="lg:pt-0 pt-[8rem] text-sm">
          <h2 className="text-center text-2xl ">{t("page.craftsmanship")}</h2>
          <div className="pt-14" data-aos="fade-up" data-aos-duration="500">
            <h2 className="text-[#FFD700] lg:text-3xl text-2xl pb-3">
              {t("page.about.title")}
            </h2>
            <p>{t("page.about.body")}</p>
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-10  mt-10 border-y border-neutral-700  text-center">
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="lg:text-sm text-xs lg:border-r border-neutral-700 space-y-5 py-10"
            >
              <h2 className="text-lg pb-3">{t("page.tax.category")}</h2>
              {(
                t("page.tax.categories", { returnObjects: true }) as string[]
              ).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>

            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="lg:text-sm text-xs space-y-5 lg:border-none border-t border-neutral-700 py-10"
            >
              <h2 className="text-lg pb-3">{t("page.tax.credit")}</h2>
              <p>300, 000</p>
              <p>200, 000</p>
              <p>75, 000</p>
              <p>25, 000</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 items-start gap-10 mt-10 ">
            <div className="bg-gradient-to-l from-black to-neutral-900 border-2 lg:text-sm text-xs space-y-4 border-neutral-800 lg:p-10 p-5 rounded-3xl">
              <h2>{t("page.tax.usage")}</h2>
              <p className="flex gap-2">
                <RiFolderTransferLine className="text-2xl" />
                {t("page.tax.itbis")}
              </p>
              <p className="flex gap-2">
                <BsStack className="text-base" />
                {t("page.tax.advance")}
              </p>
              <p className="flex gap-2">
                <BiMoneyWithdraw className="text-lg" />
                {t("page.tax.income")}
              </p>
              <p className="flex gap-2">
                <IoIosWallet className="text-lg" />
                {t("page.tax.asset")}
              </p>
            </div>

            <div className="lg:relative text-xs">
              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="bg-neutral-900 border-2 space-y-4 border-neutral-800 p-5 rounded-3xl"
              >
                <h2 className="text-lg">{t("page.requirements.title")}</h2>
                <p>{t("page.requirements.body")}</p>
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="bg-neutral-900 lg:absolute z-20 lg:mt-0 mt-5 left-14 top-[120px] lg:bg-opacity-80  border-2 space-y-4 border-neutral-800 p-5 rounded-3xl"
              >
                <h2 className="text-lg">{t("page.requirements.title")}</h2>
                <p>{t("page.requirements.body")}</p>
              </div>
            </div>
          </div>

          <div className="flex relative justify-center m-auto lg:mt-0 mt-[5rem]">
            <div className="w-full">
              <img
                src={formImage}
                alt={t("page.formImageAlt")}
                className="w-full"
              />
            </div>

            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="absolute bottom-0 bg-neutral-900 rounded-3xl lg:p-5 p-3 bg-opacity-90 border-2 border-neutral-900"
            >
              <div className="border-2 border-neutral-800 rounded-2xl border-dashed lg:p-5 p-3">
                <h2 className="lg:text-sm text-xs">{t("page.formPrompt")}</h2>
                <div className="flex items-center gap-3 pt-3 m-auto justify-center">
                  <LocalizedLink to={"/electronic-billing/form"}>
                    <Button2 text={t("page.formCta")} />
                  </LocalizedLink>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <h2 className="lg:text-3xl text-2xl text-[#FFD700]">
              {t("page.benefits.title")}
            </h2>

            <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-10 gap-5 lg:mt-8 mt-5">
              <div
                data-aos="fade-up"
                data-aos-duration="700"
                className="grid lg:grid-cols-2 grid-cols-1 gap-5 lg:text-sm text-xs"
              >
                {benefitCards.map((frontdata, index) => (
                  <div
                    key={frontdata.name}
                    className="flex bg-neutral-900 hover:bg-neutral-800 eachImage rounded-xl lg:p-2 p-4 cursor-pointer"
                  >
                    <p>
                      <TbMinusVertical
                        className={
                          index !== 0
                            ? "text-2xl text-white"
                            : "text-2xl text-[#FFD700]"
                        }
                      />
                    </p>
                    <div>
                      <h2 className="lg:text-sm text-xs">{frontdata.name}</h2>
                      <p className="text-[13px] pt-2">
                        {frontdata.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="w-full"
              >
                <img
                  src={benefitImage}
                  alt={t("page.benefitImageAlt")}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <h2 className="lg:text-3xl text-2xl pb-3 text-[#FFD700]">
              {t("page.plans.title")}
            </h2>
            <p>{t("page.plans.note")}</p>

            <div className="grid lg:grid-cols-2 grid-cols-1 px-0 lg:gap-10 gap-5 lg:mt-10 mt-5 lg:text-sm text-xs">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  data-aos="fade-up"
                  data-aos-duration="500"
                  className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl"
                >
                  <div>
                    <h2 className="xl:text-xl text-lg lg:p-10 p-5 border-b border-neutral-800">
                      {plan.title}
                    </h2>
                    <p className="border-b lg:p-10 p-5 border-neutral-800">
                      {plan.implementation}
                    </p>
                  </div>
                  <ul className="space-y-6 lg:p-10 p-5">
                    {plan.tiers.map((tier) => (
                      <li key={tier} className="flex gap-2">
                        <IoCheckmarkCircleSharp className="text-lg" />
                        {tier}
                      </li>
                    ))}
                  </ul>
                  <div className="p-10 pt-0">
                    <LocalizedLink to="/electronic-billing/form">
                      <Button3 text={t("page.plans.request")} />
                    </LocalizedLink>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col text-center pt-10 justify-center m-auto ">
              <h2>{t("page.plans.more")}</h2>

              <div className="flex m-auto mt-4">
                <LocalizedLink to={"/contact"}>
                  <Button2 text={t("page.contact")} />
                </LocalizedLink>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="lg:text-3xl text-2xl pb-3 text-[#FFD700]">
                {t("page.faq.title")}
              </h2>
              <p>{t("page.faq.body")}</p>

              <div className="flex flex-col gap-4 lg:mt-10 mt-5">
                {faqData.map((faq, index) => (
                  <div
                    data-aos="fade-up"
                    data-aos-duration="500"
                    key={`${faq.question}-${index}`}
                    className="bg-[#151517] rounded-xl border border-[#262629] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(index)}
                      className="p-6 cursor-pointer w-full text-left"
                      aria-expanded={openIndex === index}
                      aria-controls={`billing-faq-${index}`}
                    >
                      <div className="flex items-center lg:text-sm text-xs gap-4">
                        <h2 className="flex-grow">{faq?.question}</h2>
                        {openIndex === index ? (
                          <AiOutlineMinusCircle className="text-xl flex-shrink-0" />
                        ) : (
                          <GoPlusCircle className="text-xl flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    <div
                      id={`billing-faq-${index}`}
                      hidden={openIndex !== index}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openIndex === index ? "max-h-40" : "max-h-0"
                      }`}
                    >
                      <p className="p-6 pt-0 lg:text-sm text-xs text-neutral-400">
                        {faq?.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ElectronicBilling;
