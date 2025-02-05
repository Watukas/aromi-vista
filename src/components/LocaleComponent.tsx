import React from "react";

const locales = ["FI", "SV", "EN"]

interface Props {
    locale: string;
    setLocale: (locale: string) => void;
}
export default function LocaleComponent({locale: currentLocale, setLocale} : Props) {
    return (
        <div style={{display:"flex", gap:8, borderBottom:"1px solid black", borderRadius:16, padding:"0px 10px", backgroundColor:"#fafafa"}}>
            {locales.map((locale, index) => (
                <React.Fragment key={locale}>
                    <div style={{cursor:"pointer", color:currentLocale == locale ? "#000" : "#999"}} onClick={() => setLocale(locale)}>
                        {locale}
                    </div>
                    {index == locales.length - 1 || <span style={{color:"#000"}}>/</span>}
                </React.Fragment>
            ))}
        </div>
    )
}