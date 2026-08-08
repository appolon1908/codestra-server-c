import Footer from '../../Components/Layouts/Footer'
import Navbar from '../../Components/Layouts/Navbar'
import { useTranslation } from 'react-i18next'

const Privacy = () => {
  const { t } = useTranslation('legal')
  return (
  <>
    <Navbar />
    <main className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 pt-[10rem] text-sm leading-7">
      <h1 className="text-3xl mb-6">{t('privacy')}</h1>
      <p className="mb-4">{t('privacyPage.use')}</p>
      <p className="mb-4">{t('privacyPage.storage')}</p>
      <p className="mb-4">{t('privacyPage.request')} <a className="text-[#FFD700]" href="mailto:support@codestra.co">support@codestra.co</a>.</p>
      <p>{t('privacyPage.updated')}</p>
    </main>
    <Footer />
  </>
  )
}

export default Privacy
