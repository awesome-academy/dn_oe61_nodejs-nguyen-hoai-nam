import { Injectable } from "@nestjs/common";
import { asyncLocalStorage } from "src/middleware/language.middleware";

export const langConstant = {
    VN: 'vn',
    EN: 'en'
}

export const LanguageRequest = () => {
    const store = asyncLocalStorage.getStore();
    const lang = store?.get('lang') || langConstant.VN;
    return lang;
}
