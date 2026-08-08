import Navbar from "../../Components/Layouts/Navbar";
import imageWebp from "../../assets/Rectangle.webp";
import { GoArrowRight } from "react-icons/go";


import productOne from "../../assets/product (3).png";
import productTwo from "../../assets/product (2).png";
import productThree from "../../assets/product (1).png";

import ai from "../../assets/ai.png";
import ai2 from "../../assets/ai2.png";

import uidesign from "../../assets/uidesign.png";

import { MdChevronRight } from "react-icons/md";
import { RiFileList2Fill } from "react-icons/ri";

import { TbMinusVertical } from "react-icons/tb";

import { MdNetworkWifi2Bar } from "react-icons/md";
import { IoLogoBuffer } from "react-icons/io";
import { BsSuitDiamondFill } from "react-icons/bs";
import { SiSimpleanalytics } from "react-icons/si";
import { useEffect, useState } from "react";
import Footer from "../../Components/Layouts/Footer";
import { Products } from "./Products";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

const typingKeys = [
  "typing.craftsmanship",
  "typing.ideas",
  "typing.excellence",
] as const;

const Home = () => {
  const { t, i18n } = useTranslation("home");
  const [displayText, setDisplayText] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  const backendPairs = t("development.backendPairs", {
    returnObjects: true,
  }) as Array<{ name: string; description: string }>;
  const frontendTools = t("development.frontendTools", {
    returnObjects: true,
  }) as Array<{ name: string; description: string }>;
  const marketingTools = t("marketing.tools", {
    returnObjects: true,
  }) as Array<{ name: string; description: string }>;
  const marketingIcons = [
    MdNetworkWifi2Bar,
    IoLogoBuffer,
    BsSuitDiamondFill,
    SiSimpleanalytics,
    MdNetworkWifi2Bar,
    MdNetworkWifi2Bar,
    MdNetworkWifi2Bar,
    MdNetworkWifi2Bar,
  ];

  useEffect(() => {
    const activeText = t(typingKeys[currentTextIndex]);
    if (charIndex < activeText.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayText((prev) => prev + activeText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(typingTimeout);
    } else {
      const pauseTimeout = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setCurrentTextIndex((prev) => (prev + 1) % typingKeys.length);
      }, 2000); // Pause before switching to the next text
      return () => clearTimeout(pauseTimeout);
    }
  }, [charIndex, currentTextIndex, i18n.resolvedLanguage, t]);

  useEffect(() => {
    setDisplayText("");
    setCharIndex(0);
  }, [i18n.resolvedLanguage]);

  return (
    <>
      <Navbar />
      <div className="px-5 lg:pt-[10rem] pt-[7rem] text-center">
        <div
          className="text-center space-y-5"
          data-aos="fade-up"
          data-aos-duration="700"
        >
          <h1 className="lg:text-4xl text-3xl font-semibold">
            Custom AI, Software &amp; Automation Built for Real Operations
          </h1>
          <p className="sr-only" aria-live="polite">{t(typingKeys[currentTextIndex])}</p>
          <p aria-hidden="true" className="text-lg text-neutral-300 min-h-7">
            {displayText} <span className="animate-blink">|</span>
          </p>
          <p className="lg:text-base text-base">{t("hero.body")}</p>
          <LocalizedLink to={"/contact"}>
            <button className="py-2.5 px-5 mt-5 m-auto justify-center flex items-center gap-3 text-xs rounded-md text-black bg-white">
              {t("hero.cta")} <GoArrowRight className="text-xl" />
            </button>
          </LocalizedLink>
        </div>
        <div className="myDivImage lg:w-[80%] cursor-pointer w-[100%] mt-10 flex justify-center m-auto overflow-hidden">
          <img src={imageWebp} alt="Codestra software platform preview" width="1600" height="621" fetchPriority="high" decoding="async" />
        </div>

        <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[5rem] px-3">
          <div className="space-y-3 text-center lg:pt-[10rem] pt-[5rem]">
            <h2 className="text-base">Built for teams that need dependable delivery</h2>
            <p className="text-sm text-neutral-400">Customer logos and testimonials are shown only when documented permission and approved evidence are available.</p>
          </div>

          <div className="text-center lg:pt-[10rem] pt-[5rem]">
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className="lg:text-3xl text-3xl font-semibold">
                {t("teams.title")}
              </h2>
              <p className="text-base pt-3">{t("teams.body")}</p>
            </div>

            <div className="text-left grid 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1  gap-10 mt-10">
              <div
                data-aos="fade-up"
                data-aos-duration="700"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productOne} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">
                    {t("teams.development")}
                  </h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="700"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productTwo} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">
                    {t("teams.design")}
                  </h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>

              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl cursor-pointer hover:bg-neutral-950 eachImage"
              >
                <img src={productThree} alt="" className="w-full" />
                <div className="flex items-center mt-4">
                  <h3 className="text-white font-semibold text-lg">
                    {t("teams.marketing")}
                  </h3>
                  <p className="border-2 border-neutral-600 rounded-full p-2 cursor-pointer ml-auto text-xl">
                    <MdChevronRight />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center lg:pt-[10rem] pt-[5rem]">
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className="lg:text-3xl text-3xl font-semibold">
                {t("development.title")}
              </h2>
              <p className="lg:w-[60%] w-full m-auto text-base pt-3">
                {t("development.body")}
              </p>
            </div>

            <div className="my-14 flex lg:flex-row flex-col lg:gap-10 gap-5 text-left border-t border-neutral-800 ">
              <div
                data-aos="fade-up"
                data-aos-duration="500"
                className="lg:border-r border-neutral-800 lg:px-5 py-7"
              >
                <h3 className="text-2xl ">{t("development.backendTitle")}</h3>
                <p className="text-sm pt-3">{t("development.backendBody")}</p>

                <div className="space-y-5 bg-neutral-90 border border-neutral-800 mt-8 text-[12px] lg:p-5 p-3 rounded-3xl">
                  {backendPairs.map((pair) => (
                    <p
                      key={pair.name}
                      className="bg-neutral-900 eachImagea cursor-pointer hover:bg-neutral-800 transition-all ease-in-out delay-75 rounded-xl p-2"
                    >
                      <span className="text-white flex items-center gap-2 pb-2">
                        <RiFileList2Fill className="text-base" />
                        {pair.name}
                      </span>
                      {pair.description}
                    </p>
                  ))}
                </div>
              </div>

              <div
                className="lg:pt-10"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                <h3 className="text-2xl">{t("development.frontendTitle", "Frontend frameworks and tools")}</h3>
                <p className="text-sm  pt-3">{t("development.frontendBody", "Interfaces and products designed for people and operations.")}</p>

                <div className="mt-8 grid lg:grid-cols-2 grid-cols-1 gap-5 text-sm">
                  {frontendTools.map((frontdata) => (
                    <div
                      key={frontdata.name}
                      className="flex bg-neutral-900 hover:bg-neutral-800 eachImage rounded-xl lg:p-2 p-4 cursor-pointer"
                    >
                      <p>
                        <TbMinusVertical
                          className={
                            frontdata.name !== "Next.js"
                              ? "text-2xl text-white"
                              : "text-2xl text-[#FFD700]"
                          }
                        />
                      </p>
                      <div>
                        <h4 className="text-base">{frontdata.name}</h4>
                        <p className="text-[13px] pt-2">
                          {frontdata.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pt-[8rem] pt-[3rem]">
            <div data-aos="fade-up" data-aos-duration="500">
              <h2 className="lg:text-3xl text-2xl font-semibold">
                {t("design.title")}
              </h2>
              <p className="lg:w-[60%] w-full m-auto text-sm pt-3">
                {t("design.body")}
              </p>
            </div>

            <div
              className="w-[100%] eachImage cursor-pointer mt-10"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <img src={uidesign} alt="" className="w-full" />
            </div>
          </div>

          <div className="lg:pt-[8rem] pt-[5rem]">
            <div data-aos="fade-up" data-aos-duration="700">
              <h2 className="lg:text-3xl text-2xl font-semibold">
                {t("marketing.title")}
              </h2>
              <p className="lg:w-[60%] w-full m-auto text-sm text-[#B4B5B5] pt-3">
                {t("marketing.body")}
              </p>
            </div>

            <div className="grid lg:grid-cols-4 grid-cols-2 gap-6 text-left text-xs pt-10">
              {marketingTools.map((tool, index) => {
                const Icon = marketingIcons[index];
                return (
                  <div
                    key={`${tool.name}-${index}`}
                    data-aos="fade-up"
                    data-aos-duration="700"
                    className="bg-neutral-900 eachImage lg:p-5 p-3 cursor-pointer rounded-xl"
                  >
                    <h3 className="text-base flex items-center gap-2">
                      <Icon aria-hidden="true" focusable="false" className="text-xl" />
                      {tool.name}
                    </h3>
                    <p className="pt-2">{tool.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem] grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-20">
            <div
              className="text-left flex flex-col gap-4"
              data-aos="fade-up"
              data-aos-duration="700"
            >
              <div className="eachImage hover:bg-neutral-900 lg:p-5 p-3 cursor-pointer rounded-xl">
                <h2 className="text-2xl font-semibold">
                  {t("automation.title")}
                </h2>
                <p className="text-sm pt-5">{t("automation.body")}</p>
              </div>
              <div className="w-full eachImage">
                <img src={ai} alt="" className="w-full" />
              </div>
            </div>

            <div
              className="text-left flex lg:flex-col flex-col-reverse gap-4"
              data-aos="fade-up"
              data-aos-duration="700"
            >
              <div className="w-[60%] flex m-auto eachImage">
                <img src={ai2} alt="" className="w-full" />
              </div>
              <div className="eachImage hover:bg-neutral-900 lg:p-5 p-3 cursor-pointer rounded-xl">
                <h2 className="text-2xl font-semibold">{t("crm.title")}</h2>
                <p className="text-sm pt-5">{t("crm.body")}</p>
              </div>
            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <h2 className="text-center lg:text-3xl text-2xl pb-5">
              {t("products")}
            </h2>
            <Products />
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <h2 className="text-center lg:text-3xl text-2xl pb-5">{t("testimonials")}</h2>
            <p className="text-center text-neutral-400">Approved customer stories will appear here after owner review.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
