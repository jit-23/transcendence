import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const changeLanguage = (): void => {
    const order = ["en", "es", "pt"] as const;
    const current = i18n.language.split("-")[0];

    const currentIndex = order.indexOf(current as typeof order[number]);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;

    i18n.changeLanguage(order[nextIndex]);
};

i18n.use(I18nextBrowserLanguageDetector).use(initReactI18next).init({
    debug: true,
    lng: "en",
    resources: {
        en: {
            translation: {
                think_together: "Think together",
                in_real_time: "in real time",
            },
        },
        pt: {
            translation: {
                think_together: "Pense junto???",
                in_real_time: "em tempo real",
            },
        },
        es: {
            translation: {
                think_together: "<es_think_together>",
                in_real_time: "<es_in_real_time>",
            },
        },
    }
})