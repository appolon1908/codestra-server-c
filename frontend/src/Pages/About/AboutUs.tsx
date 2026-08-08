import Navbar from "../../Components/Layouts/Navbar";
import heroImage from "../../assets/bga.png";
import aboutImage from "../../assets/aboutpic.png";
import { Button1, Button3 } from "../../Components/components/Button";
import { useState } from "react";
import { IoMdCall } from "react-icons/io";
import { FaCalendarDays } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import Footer from "../../Components/Layouts/Footer";
import useEmployee from "../../hooks/queries/useEmployee";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import React from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

interface Employee {
  id: number;
  department: string;
  profile_picture: string | null;
  image?: string;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  socials: { name: string; link: string }[];
}

const AboutUs = () => {
  const { t } = useTranslation("about");
  const story = t("story.paragraphs", { returnObjects: true }) as string[];
  const news = t("news.items", { returnObjects: true }) as Array<{
    title: string;
    body: string;
    source: string;
  }>;
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { data, isLoading } = useEmployee();

  const employeeData = data?.data as [];

  const groupedData = Array.isArray(employeeData)
    ? employeeData.reduce(
        (acc: { [key: string]: Employee[] }, item: Employee) => {
          if (!acc[item.department]) {
            acc[item.department] = [];
          }
          acc[item.department].push(item);
          return acc;
        },
        {},
      )
    : {};

  return (
    <>
      <Navbar />
      <div className="px-5">
        <div
          className="lg:pt-[10rem] pt-[5rem] overflow-hidden"
          data-aos="fade-up"
          data-aos-duration="500"
        >
          <h1 className="text-center lg:text-4xl text-2xl lg:leading-[3rem] lg:pb-10 pb-5">
            {t("hero.title")}
          </h1>
          <div className="lg:w-[70%] w-[100%] flex m-auto">
            <img src={heroImage} className="w-full" alt={t("hero.imageAlt")} />
          </div>
        </div>

        <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem]">
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-5 lg:pt-[10rem] pt-[5rem]"
          >
            <h2 className="lg:text-3xl text-lg">{t("story.title")}</h2>

            <div className="space-y-5 lg:text-sm text-xs leading-relaxed text-justify">
              {story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-20 gap-5 lg:pt-[10rem] pt-[5rem]">
            <div
              className="space-y-6"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <h2 className="lg:text-3xl text-lg">{t("team.title")}</h2>

              <p className="lg:text-sm text-xs text-justify">
                {t("team.body")}
              </p>

              <LocalizedLink to="/hiring/positions">
                <Button3 text={t("team.hiring")} />
              </LocalizedLink>
            </div>

            <div className="w-full" data-aos="fade-up" data-aos-duration="500">
              <img
                src={aboutImage}
                className="w-full"
                alt={t("team.imageAlt")}
              />
            </div>
          </div>

          {/* ========= this is Loading section ============ */}
          {isLoading ? (
            <div className="flex justify-center items-center z-30 pt-[5rem]">
              <span className="loading loading-spinner loading-md text-white"></span>
            </div>
          ) : (
            <>
              <div className="lg:pt-[10rem] pt-[5rem] lg:px-0 px-5">
                {employeeData && (
                  <>
                    {employeeData.length > 0 ? (
                      <>
                        {Object.entries(groupedData!).map(
                          ([category, items]) => (
                            <div key={category}>
                              <h2 className="lg:text-2xl lg:text-left text-2xl">
                                {category}
                              </h2>

                              <div className="w-full grid lg:grid-cols-5 grid-cols-1 gap-8 pt-5 pb-[5rem] lg:px-[3rem] px-0">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="relative"
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                  >
                                    <div className="flex items-center gap-3 lg:px-0 px-5 cursor-pointer">
                                      {item.profile_picture ? (
                                        <img
                                          className="w-5 h-5"
                                          src={item.image || "/placeholder.svg"}
                                          alt={item.first_name}
                                        />
                                      ) : (
                                        <p className="bg-neutral-800 text-sm font-semibold rounded-full flex h-9 w-9 justify-center items-center text-white">
                                          {item.first_name.slice(0, 1)}
                                          {item.last_name.slice(0, 1)}
                                        </p>
                                      )}
                                      <h3 className="text-sm">
                                        {item.first_name} {item.last_name}
                                      </h3>
                                    </div>

                                    <div
                                      className={`absolute top-full left-0 right-0 m-auto flex lg:justify-center transform lg:translate-x-0 cursor-pointer lg:w-[18rem] mt-2 border border-neutral-800 bg-neutral-900 rounded-md shadow-lg z-10 transition-all duration-300 ease-in-out ${
                                        hoveredId === item.id
                                          ? "opacity-100 visible"
                                          : "opacity-0 invisible"
                                      }`}
                                    >
                                      <div className="p-4">
                                        <div className="flex items-center justify-center m-auto gap-4 w-full">
                                          <div className="flex items-center gap-3">
                                            {item.profile_picture ? (
                                              <img
                                                className="w-5 h-5"
                                                src={
                                                  item.image ||
                                                  "/placeholder.svg"
                                                }
                                                alt={item.first_name}
                                              />
                                            ) : (
                                              <p className="bg-white text-sm font-semibold rounded-full flex h-9 w-9 justify-center items-center text-black">
                                                {item.first_name.slice(0, 1)}
                                                {item.last_name.slice(0, 1)}
                                              </p>
                                            )}
                                            <div>
                                              <h3 className="text-sm">
                                                {item.first_name}{" "}
                                                {item.last_name}
                                              </h3>
                                              <p className="text-xs text-[#B4B5B5] text-justify">
                                                {item.position}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 ml-auto">
                                            {item.socials.map(
                                              (social, socialIndex) => (
                                                <React.Fragment
                                                  key={socialIndex}
                                                >
                                                  {social.name ===
                                                    "Facebook" && (
                                                    <a
                                                      href={social.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      aria-label="Facebook"
                                                    >
                                                      <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaFacebook />
                                                      </p>
                                                    </a>
                                                  )}
                                                  {social.name ===
                                                    "Twitter" && (
                                                    <a
                                                      href={social.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      aria-label="Twitter"
                                                    >
                                                      <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaTwitter />
                                                      </p>
                                                    </a>
                                                  )}
                                                  {social.name ===
                                                    "Instagram" && (
                                                    <a
                                                      href={social.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      aria-label="Instagram"
                                                    >
                                                      <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaInstagram />
                                                      </p>
                                                    </a>
                                                  )}

                                                  {social.name ===
                                                    "Linkedin" && (
                                                    <a
                                                      href={social.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      aria-label="LinkedIn"
                                                    >
                                                      <p className="rounded-full bg-neutral-800 hover:bg-neutral-700 p-2 text-sm text-neutral-300 transition-colors duration-200">
                                                        <FaLinkedin />
                                                      </p>
                                                    </a>
                                                  )}
                                                </React.Fragment>
                                              ),
                                            )}
                                          </div>
                                        </div>

                                        <div className="pt-5 flex items-center">
                                          <p className="flex items-center gap-2 text-xs">
                                            <IoMdCall className="text-lg" />
                                            {item.phone}
                                          </p>
                                          <p className="flex items-center gap-2 text-lg ml-auto">
                                            <IoLogoWhatsapp className="text-xl hover:text-neutral-200 transition-colors duration-200" />
                                            <FaCalendarDays className="hover:text-neutral-200 transition-colors duration-200" />
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </>
                    ) : (
                      <p className="text-xl text-neutral-300 text-center py-5">
                        {t("team.empty")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          <div className="lg:pt-[10rem] pt-[5rem]">
            <p className="text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]">
              {t("investors.eyebrow")}
            </p>

            <div className="flex lg:flex-row flex-col lg:gap-[10rem] gap-5">
              <div data-aos="fade-up" data-aos-duration="500">
                <h2 className="lg:text-3xl text-lg">{t("investors.title")}</h2>
                <p className="pt-5 lg:text-sm text-xs leading-normal">
                  {t("investors.body")}
                </p>
              </div>

            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <p className="text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]">
              {t("news.eyebrow")}
            </p>

            <div>
              {news.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  data-aos="fade-up"
                  data-aos-duration="500"
                  className={`flex lg:text-sm text-xs items-center justify-between p-5 rounded-md hover:bg-neutral-900 ${index ? "mt-10" : ""}`}
                >
                  <h2>{item.title}</h2>
                  <p className="text-[#B4B5B5]">{item.body}</p>
                  <p>{item.source}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pt-[10rem] pt-[5rem]">
            <p className="text-xs pb-2 lg:mb-8 mb-5 border-b border-[#242424]">
              {t("vision.eyebrow")}
            </p>

            <div
              className="flex justify-center text-sm gap-20"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <div>
                <h2>{t("vision.success.title")}</h2>
                <p className="text-sm pt-5 text-[#B4B5B5]">
                  {t("vision.success.body")}
                </p>
              </div>

              <div>
                <h2>{t("vision.ideas.title")}</h2>
                <p className="text-sm pt-5 text-[#B4B5B5]">
                  {t("vision.ideas.body")}
                </p>
              </div>
            </div>

            <div
              className="flex lg:flex-row flex-col gap-5 text-sm justify-center m-auto pt-16 items-center"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <h2>{t("vision.ctaBody")}</h2>
              <LocalizedLink to="/case-studies">
                <Button1 text={t("vision.cta")} />
              </LocalizedLink>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
