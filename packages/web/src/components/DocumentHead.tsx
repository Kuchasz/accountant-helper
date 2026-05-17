import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function setMetaContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.content = content;
  }
}

export function DocumentHead() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const title = t('app.title');
    const description = t('app.description');

    document.documentElement.lang = i18n.language;
    document.title = title;
    setMetaContent('meta[name="application-name"]', title);
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
  }, [t, i18n.language]);

  return null;
}
