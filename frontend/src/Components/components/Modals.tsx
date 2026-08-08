
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Button1, Button2 } from "./Button";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

interface SuccessModalProps{
    closeModal?: () => void;
    openModal?: () => void;
    isOpen?: boolean;
    children?: React.ReactNode
  
}
export const SuccessModal:React.FC<SuccessModalProps> = ({closeModal, isOpen}: SuccessModalProps) => {
  const {t}=useTranslation("common");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-6 w-[90%] lg:max-w-md z-10"
            >
              <div className="text-center">
                <IoMdCheckmarkCircleOutline className="mx-auto h-12 w-12 text-[#FFD700]" />
                <h3 className="mt-2 text-xl font-semibold">{t("status.messageSent")}</h3>
                <p className="mt-2 text-sm">{t("status.messageSentBody")}</p>
                
                <div className="flex justify-center gap-4 m-auto mt-4">
                    <Button2 text={t("close")} onClick={closeModal}/>
                    <LocalizedLink to={'/contact'}><Button1 text={t("continue")}/></LocalizedLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const SuccessModal2:React.FC<SuccessModalProps> = ({closeModal, isOpen}: SuccessModalProps) => {
  const {t}=useTranslation("common");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-40 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-6 lg:w-full w-[95%] max-w-md z-10"
            >
              <div className="text-center">
                <IoMdCheckmarkCircleOutline className="mx-auto h-12 w-12 text-[#FFD700]" />
                <h3 className="mt-2 lg:text-xl text-lg font-semibold">{t("status.sentSuccessfully")}</h3>
                <p className="mt-2 lg:text-sm text-xs">{t("status.messageSentBody")}</p>
                
                <div className="flex justify-center gap-4 m-auto mt-4">
                    <Button2 text={t("close")} onClick={closeModal}/>
                    <LocalizedLink to={'/'}><Button1 text={t("continue")}/></LocalizedLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


export const FaqModal:React.FC<SuccessModalProps> = ({closeModal, isOpen, children}: SuccessModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl p-5 w-[90%] lg:w-[30%] z-10"
                >{children}
                </motion.div>
              </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  )
}


export const CaseModal:React.FC<SuccessModalProps> = ({closeModal, isOpen, children}: SuccessModalProps) => {
  return (
    <>
      {isOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm " />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#121212] border border-[#1f2229] text-white rounded-lg shadow-xl w-[90%] 2xl:h-[80vh] xl:h-[80vh] lg:h-[80vh] h-[90vh] overflow-y-scroll lg:w-[30%] z-10"
                >{children}
                </motion.div>
              </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
