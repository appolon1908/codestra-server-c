import React from 'react'
import { IoArrowForwardOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";


interface ButtonProps {
  text: string;
  onClick?: () => void;
  isPending?: boolean;
  type?: 'button' | 'submit';
}

export const Button1: React.FC<ButtonProps> = ({text, onClick, type = 'button'}) => (
  <button type={type} className='flex !text-xs items-center bg-white text-[#080808] rounded-md px-4 py-2 w-fit' onClick={onClick}>{text}</button>
)

export const Button2: React.FC<ButtonProps> = ({text, onClick, type = 'button'}) => (
  <button type={type} className='flex !text-xs items-center bg-[#FFD700] hover:bg-[#ffbb00] transition-all ease-linear delay-75 text-black rounded-md px-4 py-2 w-fit' onClick={onClick}>{text}</button>
)

export const Button2a: React.FC<ButtonProps> = ({text, onClick, isPending, type = 'button'}) => { const {t}=useTranslation("common"); return <button type={type} disabled={isPending} className='flex !text-xs items-center bg-white text-[#080808] border-none transition-all ease-linear delay-75 rounded-md px-4 py-2 w-fit' onClick={onClick}>{isPending ? <span className='flex items-center gap-2'><span className="loadera" /> {t("loading")}</span> : text}</button> }

export const Button2b: React.FC<ButtonProps> = ({text, onClick, isPending, type = 'button'}) => { const {t}=useTranslation("common"); return <button type={type} disabled={isPending} className={`flex !text-xs items-center ${isPending ? 'bg-[#f0df82] text-neutral-600' : 'bg-[#FFD700] hover:bg-[#ffbb00]'} text-[#080808] border-none transition-all ease-linear delay-75 rounded-md px-4 py-2 w-fit`} onClick={onClick}>{isPending ? <span className='flex items-center gap-2'><span className="loadera" /> {t("loading")}</span> : text}</button> }

export const Button2c: React.FC<ButtonProps> = ({text}) => (
  <button type='button' disabled className='flex !text-xs items-center bg-[#f0df82] text-neutral-600 transition-all ease-linear delay-75 rounded-md px-4 py-2 w-fit'>{text}</button>
)

export const Button3: React.FC<ButtonProps> = ({text, onClick, type = 'button'}) => (
  <button type={type} className='flex !text-xs gap-2 items-center bg-white border-none text-black transition-all ease-linear delay-75 rounded-md px-4 py-2 w-fit' onClick={onClick}>
    {text} <IoArrowForwardOutline />
  </button>
)

export const Button4: React.FC<ButtonProps> = ({text, onClick, type = 'button'}) => (
  <button type={type} className='flex !text-xs items-center bg-[#FFD700] hover:bg-[#ffbb00] border-none text-black transition-all ease-linear delay-75 rounded-md px-4 py-2 lg:w-fit w-full' onClick={onClick}>{text}</button>
)
