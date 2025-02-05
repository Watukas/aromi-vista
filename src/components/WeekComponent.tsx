import React from "react";

const weeks = ["Today", "1st", "2nd", "3rd", "4th"]

interface Props {
    mode: number;
    setMode: (mode: number) => void;
}
export default function LocaleComponent({mode, setMode} : Props) {
    return (
        <div style={{display:"flex", gap:8, borderBottom:"1px solid black", borderRadius:16, padding:"0px 10px", backgroundColor:"#fafafa"}}>
            {weeks.map((week, index) => (!(Math.abs(index - mode) == 1 || mode == index) ||
                <React.Fragment key={week}>
                    <div style={{cursor:"pointer", color:mode == index ? "#000" : "#999"}} onClick={() => setMode(index)}>
                        {(mode == index || mode == 0) && index != 0 ? `${week} week` : week}
                    </div>
                    {index == Math.min(weeks.length - 1, mode + 1) || <span style={{color:"#000"}}>/</span>}
                </React.Fragment>
            ))}
        </div>
    )
}