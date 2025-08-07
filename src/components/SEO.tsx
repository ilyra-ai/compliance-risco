import { useEffect } from "react";

type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
};

export const SEO: React.FC<SEOProps> = ({ title, description, canonical }) => {
  useEffect(() => {
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', description || 'Plataforma de compliance e due diligence.');
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

    if (canonical) {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, canonical]);

  return null;
};
