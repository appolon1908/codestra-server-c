import React from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../i18n/LocalizedLink';

const NotFound: React.FC = () => {
  const { t } = useTranslation('errors');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090A]">
      <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">{t('notFound.title')}</p>
      <LocalizedLink to="/" className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors">{t('notFound.home')}</LocalizedLink>
    </div>
  );
};

export default NotFound;
