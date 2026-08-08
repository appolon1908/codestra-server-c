import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useRef, useState } from "react";
import { Button2, Button2b } from "../../Components/components/Button";
import useTask from "../../hooks/mutations/useTask";
import { useForm } from "react-hook-form";
import { SuccessModal2 } from "../../Components/components/Modals";
import { Alert } from "../../Components/components/Alert";
import { BiUpload } from "react-icons/bi";
import { useTranslation } from "react-i18next";

type TaskProps = {
  address_reference: string;
  visiting_hours: string;
  representation_rnc: string;
  name_of_representative: string;
  representative_phone: string;
  representative_cell_phone: string;
  representative_email: string;
  operation_carried_out_in_premise: string;
  street_of_warehouse: string;
  store_or_warehouse_number: string;
  province_of_warehouse: string;
  warehouse_reference: string;
  local_administration: string;
  warehouse_sector: string;
  tax_payer_rnc: string;
  name_of_tax_payer: string;
  trade_name: string;
  tax_payer_telephone: string;
  tax_payer_cell_phone: string;
  tax_payer_email: string;
  tax_payer_number: string;
  tax_payer_sector: string;
  tax_payer_province: string;
  // media_file: UploadedFile[]
};

interface UploadedFile {
  file: File;
  progress: number;
}

const ElectronicBillingForm = () => {
  const { t } = useTranslation("billing");

  // ============ NEXT SLIDE FUNCTION =============
  const [position, setPosition] = useState(1);
  const handlePrevious = () => {
    if (position > 1) {
      setPosition(position - 1);
    }
  };

  const handleNext = () => {
    if (position === 1) {
      setPosition(position + 1);
    }
  };

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // ================ IMAGE UPLOAD ================
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 5) {
      alert(t("form.upload.limitError"));
      return;
    }

    const newUploadedFiles = newFiles.map((file) => ({
      file,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newUploadedFiles]);
  };

  const handleCancel = () => {
    setFiles([]);
  };

  // =================== API REQUEST SUBMISSION =================
  const { mutate, isPending } = useTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TaskProps>({ mode: "all" });

  const onSubmit = (data: TaskProps) => {
    // data.media_file = files
    mutate(data, {
      onSuccess: () => {
        setIsOpen(true);
        setIsAlertOpen(true);
        reset();
      },
      onError: () => setIsAlertOpen(false),
    });
  };

  setTimeout(() => {
    setIsAlertOpen(false);
  }, 4000);

  return (
    <>
      <Navbar />
      <div className="2xl:px-[25rem] xl:px-[10rem] relative lg:px-[8rem] px-5 lg:pt-[10rem] pt-[6rem]">
        <p className="text-base pt-2">{t("form.title")}</p>

        {isAlertOpen === true && <Alert />}

        <div className="py-4 border-y text-xs border-neutral-800 lg:mt-10 mt-7">
          <form action="" onSubmit={handleSubmit(onSubmit)}>
            {position === 1 && (
              <div>
                <div className="flex flex-col gap-2 ">
                  <label htmlFor="tax-payer-rnc" className="text-white">
                    {t("form.fields.taxpayerRnc.label")}
                  </label>
                  <input
                    id="tax-payer-rnc"
                    type="text"
                    placeholder={t("form.fields.taxpayerRnc.placeholder")}
                    className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                    {...register("tax_payer_rnc", { required: true })}
                  />
                </div>

                <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-6 gap-6 lg:mt-10 mt-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="tax-payer-name" className="text-white">
                      {t("form.fields.taxpayerName.label")}
                    </label>

                    <input
                      type="text"
                      id="tax-payer-name"
                      autoComplete="organization"
                      placeholder={t("form.fields.taxpayerName.placeholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("name_of_tax_payer", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="trade-name" className="text-white">
                      {t("form.fields.tradeName.label")}
                    </label>
                    <input
                      type="text"
                      id="trade-name"
                      placeholder={t("form.fields.tradeName.placeholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("trade_name", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="tax-payer-telephone" className="text-white">
                      {t("form.fields.taxpayerTelephone.label")}
                    </label>
                    <input
                      id="tax-payer-telephone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={t("form.fields.telephonePlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("tax_payer_telephone", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="tax-payer-cell" className="text-white">
                      {t("form.fields.taxpayerCell.label")}
                    </label>
                    <input
                      id="tax-payer-cell"
                      type="tel"
                      autoComplete="tel"
                      placeholder={t("form.fields.cellPlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("tax_payer_cell_phone", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2 ">
                    <label htmlFor="tax-payer-email" className="text-white">
                      {t("form.fields.taxpayerEmail.label")}
                    </label>
                    <input
                      id="tax-payer-email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("form.fields.emailPlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("tax_payer_email", { required: true })}
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <h2 className="text-neutral-400 ">
                    {t("form.sections.taxpayerAddress")}
                  </h2>

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 pt-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="tax-payer-number" className="text-white">
                        {t("form.fields.number.label")}
                      </label>
                      <input
                        id="tax-payer-number"
                        type="number"
                        placeholder={t("form.fields.number.placeholder")}
                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                        {...register("tax_payer_number", { required: true })}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="tax-payer-sector" className="text-white">
                        {t("form.fields.sector.label")}
                      </label>
                      <input
                        id="tax-payer-sector"
                        type="text"
                        placeholder={t("form.fields.sector.placeholder")}
                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                        {...register("tax_payer_sector", { required: true })}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="tax-payer-province"
                        className="text-white"
                      >
                        {t("form.fields.province.label")}
                      </label>
                      <input
                        id="tax-payer-province"
                        type="text"
                        placeholder={t("form.fields.province.placeholder")}
                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                        {...register("tax_payer_province", { required: true })}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="visiting-hours" className="text-white">
                        {t("form.fields.visitingHours.label")}
                      </label>
                      <input
                        id="visiting-hours"
                        type="text"
                        placeholder={t("form.fields.visitingHours.placeholder")}
                        className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                        {...register("visiting_hours", { required: true })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {position === 2 && (
              <div>
                <h2 className="text-sm text-neutral-500">
                  {t("form.sections.representative")}
                </h2>

                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="representative-rnc" className="text-white">
                      {t("form.fields.representativeRnc.label")}
                    </label>

                    <input
                      type="text"
                      id="representative-rnc"
                      placeholder={t("form.fields.taxpayerRnc.placeholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("representation_rnc", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="representative-name" className="text-white">
                      {t("form.fields.representativeName.label")}
                    </label>
                    <input
                      type="text"
                      id="representative-name"
                      autoComplete="name"
                      placeholder={t(
                        "form.fields.representativeName.placeholder",
                      )}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("name_of_representative", {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="representative-phone"
                      className="text-white"
                    >
                      {t("form.fields.representativePhone.label")}
                    </label>
                    <input
                      id="representative-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={t("form.fields.telephonePlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("representative_phone", { required: true })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="representative-cell" className="text-white">
                      {t("form.fields.representativeCell.label")}
                    </label>
                    <input
                      id="representative-cell"
                      type="tel"
                      autoComplete="tel"
                      placeholder={t("form.fields.cellPlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("representative_cell_phone", {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="flex flex-col gap-2 ">
                    <label
                      htmlFor="representative-email"
                      className="text-white"
                    >
                      {t("form.fields.representativeEmail.label")}
                    </label>
                    <input
                      id="representative-email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("form.fields.emailPlaceholder")}
                      className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                      {...register("representative_email", { required: true })}
                    />
                  </div>
                </div>

                <div className="border border-neutral-800 bg-[#18181a] mt-10 p-5 rounded-lg space-y-3">
                  <h2>{t("form.upload.title")}</h2>
                  <h2 className="text-xs text-neutral-400">
                    {t("form.upload.help")}
                  </h2>

                  <div
                    className={`
                                        border-2 border-dashed rounded-lg p-12 border-zinc-800 bg-neutral-800 
                                        ${files.length > 0 ? "bg-zinc-800/50" : ""}
                                        transition-colors duration-200
                                    `}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <BiUpload className="h-12 w-12 text-zinc-400" />
                      <p className="text-xs text-center">
                        {files.length > 0
                          ? t("form.upload.selected", { count: files.length })
                          : t("form.upload.drag")}
                      </p>
                      <p className="text-zinc-400">{t("form.upload.or")}</p>
                      <button
                        type="button"
                        className="bg-[#FFD700] text-black cursor-pointer px-6 py-3 rounded-lg"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t("form.upload.browse")}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                        accept="image/*,application/pdf"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-white w-fit px-6 py-3 rounded-lg text-black cursor-pointer flex ml-auto"
                  >
                    {t("form.upload.cancel")}
                  </button>

                  <div>
                    {files.length > 0 && (
                      <div className="mt-6 space-y-3">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 text-sm"
                          >
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-zinc-400 text-xs whitespace-nowrap">
                              {file.file.name.slice(0, 10)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10">
                  <div className="flex flex-col gap-2 ">
                    <label htmlFor="alternate-premise" className="text-white">
                      {t("form.fields.alternatePremise.label")}
                    </label>
                    <div className="relative">
                      <select
                        id="alternate-premise"
                        className="appearance-none bg-[#18181a] outline-none focus:border-2 focus:border-gray-600 w-full text-white p-3 rounded-md cursor-pointer"
                        defaultValue=""
                        {...register("operation_carried_out_in_premise", {
                          required: true,
                        })}
                      >
                        <option value="" disabled>
                          {t("form.fields.alternatePremise.placeholder")}
                        </option>
                        <option value="yes">{t("form.yes")}</option>
                        <option value="no">{t("form.no")}</option>
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

                  <div className="mt-10">
                    <h2 className="text-sm text-neutral-500">
                      {t("form.sections.warehouse")}
                    </h2>
                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 pt-5">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="warehouse-street"
                          className="text-white"
                        >
                          {t("form.fields.warehouseStreet.label")}
                        </label>
                        <input
                          id="warehouse-street"
                          type="text"
                          placeholder={t(
                            "form.fields.warehouseStreet.placeholder",
                          )}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("street_of_warehouse", {
                            required: true,
                          })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="warehouse-number"
                          className="text-white"
                        >
                          {t("form.fields.warehouseNumber.label")}
                        </label>
                        <input
                          id="warehouse-number"
                          type="text"
                          placeholder={t("form.fields.number.placeholder")}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("store_or_warehouse_number", {
                            required: true,
                          })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="warehouse-sector"
                          className="text-white"
                        >
                          {t("form.fields.warehouseSector.label")}
                        </label>
                        <input
                          id="warehouse-sector"
                          type="text"
                          placeholder={t("form.fields.sector.placeholder")}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("warehouse_sector", { required: true })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="warehouse-province"
                          className="text-white"
                        >
                          {t("form.fields.warehouseProvince.label")}
                        </label>
                        <input
                          id="warehouse-province"
                          type="text"
                          placeholder={t("form.fields.province.placeholder")}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("province_of_warehouse", {
                            required: true,
                          })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="warehouse-reference"
                          className="text-white"
                        >
                          {t("form.fields.warehouseReference.label")}
                        </label>
                        <input
                          id="warehouse-reference"
                          type="text"
                          placeholder={t(
                            "form.fields.warehouseReference.placeholder",
                          )}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("warehouse_reference", {
                            required: true,
                          })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="local-administration"
                          className="text-white"
                        >
                          {t("form.fields.localAdministration.label")}
                        </label>
                        <input
                          id="local-administration"
                          type="text"
                          placeholder={t(
                            "form.fields.localAdministration.placeholder",
                          )}
                          className="bg-[#18181a] border-0 text-white p-3 rounded-lg"
                          {...register("local_administration", {
                            required: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex ml-auto gap-4 justify-start mt-10">
              {position === 1 && !isValid && (
                <>
                  <button
                    type="submit"
                    className="text-xs p-6 py-2.5 lg:w-[30%] w-full rounded-lg bg-white text-black cursor-pointer"
                  >
                    {t("form.next")}
                  </button>
                </>
              )}

              {position === 1 && isValid && (
                <>
                  <button
                    type="button"
                    className="text-xs p-6 py-2.5 lg:w-[30%] w-full text-center rounded-lg bg-white text-black cursor-pointer"
                    onClick={handleNext}
                  >
                    {t("form.next")}
                  </button>
                </>
              )}

              {position === 2 && (
                <div>
                  {!isValid ? (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="text-xs p-6 py-2.5 rounded-lg bg-white text-black cursor-pointer"
                        onClick={handlePrevious}
                      >
                        {t("form.back")}
                      </button>
                      <Button2 type="submit" text={t("form.submit")} />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="text-xs p-6 py-2.5 rounded-lg bg-white text-black cursor-pointer"
                        onClick={handlePrevious}
                      >
                        {t("form.back")}
                      </button>
                      <Button2b
                        type="submit"
                        text={t("form.submit")}
                        isPending={isPending}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="mt-10">
          <div className="flex justify-center text-sm gap-10 items-center m-auto">
            <button
              type="button"
              aria-label={t("form.previousStep")}
              onClick={handlePrevious}
              className={`${position === 1 && "bg-neutral-800"} flex justify-center p-2.5 cursor-pointer rounded-full items-center border border-neutral-700`}
            >
              <HiChevronLeft className="text-xl" />
            </button>
            <button
              type="button"
              aria-label={t("form.step", { step: 1 })}
              onClick={handlePrevious}
              className="cursor-pointer"
            >
              1
            </button>
            <button
              type="button"
              aria-label={t("form.step", { step: 2 })}
              onClick={handleNext}
              className="cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              aria-label={t("form.nextStep")}
              onClick={handleNext}
              className={`${position === 2 && "bg-neutral-800"} flex justify-center p-2.5 cursor-pointer rounded-full items-center border border-neutral-700`}
            >
              <HiChevronRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <SuccessModal2
          isOpen={isOpen}
          openModal={openModal}
          closeModal={closeModal}
        />
      )}
      <Footer />
    </>
  );
};

export default ElectronicBillingForm;
