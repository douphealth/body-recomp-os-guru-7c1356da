import { useEffect } from 'react';
import { toCanonicalUrl } from '@/lib/site-url';

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
    setMeta('og:url', toCanonicalUrl(path), 'property');
    setMeta('og:site_name', 'GearUpToFit Body Recomp OS', 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', '@GearUpToFit');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = toCanonicalUrl(path);
  }, [title, description, path]);

  return null;
};

export default SEOHead;
