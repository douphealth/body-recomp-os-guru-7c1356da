import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
}

const SEOHead = ({ title, description, path }: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', `https://app.gearuptofit.com${path}`, 'property');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://app.gearuptofit.com${path}`;
  }, [title, description, path]);

  return null;
};

export default SEOHead;
