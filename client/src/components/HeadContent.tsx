import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings } from '@shared/schema';

// Component to dynamically update document head based on settings
export default function HeadContent() {
  // Fetch settings data
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  // Update head when settings change
  useEffect(() => {
    if (!settings?.websiteSettings) return;
    
    const { title, description, favicon, headerCode } = settings.websiteSettings;
    
    // Update document title
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }
    }
    
    // Update favicon
    if (favicon) {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink) {
        faviconLink.setAttribute('href', favicon);
      } else {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        faviconLink.setAttribute('href', favicon);
        document.head.appendChild(faviconLink);
      }
    }
    
    // Inject custom header code
    if (headerCode) {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = headerCode;
      
      // Extract scripts and other elements
      Array.from(tempDiv.children).forEach(el => {
        document.head.appendChild(el);
      });
    }
    
    // Cleanup function
    return () => {
      // We don't remove the base elements, just custom injected code
      // This is to prevent flickering on re-renders
    };
  }, [settings]);
  
  // Inject footer code
  useEffect(() => {
    if (!settings?.websiteSettings?.footerCode) return;
    
    const { footerCode } = settings.websiteSettings;
    
    if (footerCode) {
      // Create a div to hold the footer code
      const footerDiv = document.createElement('div');
      footerDiv.id = 'custom-footer-code';
      footerDiv.style.display = 'none'; // Hide it visually
      footerDiv.innerHTML = footerCode;
      
      // Remove any existing footer code div
      const existingFooterDiv = document.getElementById('custom-footer-code');
      if (existingFooterDiv) {
        document.body.removeChild(existingFooterDiv);
      }
      
      // Append to body
      document.body.appendChild(footerDiv);
      
      // Execute scripts (if any)
      const scripts = footerDiv.getElementsByTagName('script');
      Array.from(scripts).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
    
    return () => {
      // Clean up the footer code div on unmount
      const footerDiv = document.getElementById('custom-footer-code');
      if (footerDiv) {
        document.body.removeChild(footerDiv);
      }
    };
  }, [settings]);
  
  // This component doesn't render anything visible
  return null;
}