
import React, { useState, useEffect } from "react";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Adding TypeScript declaration for Google Translate API
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (options: any, element: HTMLElement): any;
          InlineLayout: {
            SIMPLE: string;
          };
        };
      };
    };
  }
}

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "ta", name: "Tamil" },
  { code: "hi", name: "Hindi" },
];

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    // Initialize with stored language when component mounts
    changeLanguage(currentLang);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("language", langCode);
    
    if (window.google && window.google.translate) {
      const translateElement = document.getElementById("google_translate_element");
      if (translateElement) {
        // Clear previous translations
        translateElement.innerHTML = "";
        
        // Initialize Google Translate with the selected language
        new window.google.translate.TranslateElement({
          pageLanguage: "en",
          includedLanguages: "en,hi,ta",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          multilanguagePage: true, // Support multiple languages on the page
        }, translateElement);
        
        // Find and click the language button programmatically after a short delay
        setTimeout(() => {
          const selectLanguage = (langCode: string) => {
            // Find all Google Translate iframes
            const iframes = document.querySelectorAll('iframe.goog-te-menu-frame') as NodeListOf<HTMLIFrameElement>;
            
            if (iframes.length > 0) {
              // Try each iframe (there should be only one, but just in case)
              for (let i = 0; i < iframes.length; i++) {
                const iframe = iframes[i];
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                
                if (iframeDoc) {
                  // Find all links in the Google Translate dropdown
                  const links = iframeDoc.getElementsByTagName('a');
                  const targetLang = languages.find(lang => lang.code === langCode)?.name || '';
                  
                  // Click the appropriate language link
                  for (let j = 0; j < links.length; j++) {
                    if (links[j].textContent?.includes(targetLang)) {
                      links[j].click();
                      return true; // Language found and clicked
                    }
                  }
                }
              }
            }
            return false; // Language not found or couldn't click
          };
          
          // First attempt
          if (!selectLanguage(langCode)) {
            // If first attempt fails, try again after a longer delay
            setTimeout(() => selectLanguage(langCode), 500);
          }
        }, 300);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
          <Globe size={20} />
          <span className="hidden md:inline-block">{languages.find(lang => lang.code === currentLang)?.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {currentLang === lang.code && <Check size={16} />}
            <span className={currentLang === lang.code ? "ml-0" : "ml-5"}>
              {lang.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
