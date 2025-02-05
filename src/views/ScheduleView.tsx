import { Food, Lunch, useAromi } from "../utils/aromi";
import { useScale } from "../App";
import React, { useRef } from "react";
import { Feed } from "./SourceSelect";

function ScheduleView({feed, setFeed}: {feed: Feed, setFeed: (newFeed: Feed | null) => void}) {
    const content = useAromi(feed);
    const ref = useRef<HTMLDivElement>(null);
    const scale = useScale(content, ref.current);

    const title = content.url ? feed.title ?? content.name : '⌛';

    return (
    <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
    }}>
        <div ref={ref} style={{transition: "transform 0.3s ease", transform:`scale(${scale})`}}>
            <div style={{display:"flex", width:"100%", height:"100%", justifyContent:"center", marginBottom:24}}>
                <h2 onClick={() => setFeed(null)} style={{ fontFamily:"Bebas Neue", letterSpacing:1, padding:0, margin:0, cursor:"pointer", textAlign: "center" }}>
                    {title}
                </h2>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"max-content minmax(200px, auto) 1fr", gap:16}}>
                {content.schedule.map((lunch, index) => <React.Fragment key={lunch.date.weekdayShort}>
                    <LunchElement lunch={lunch}/>
                    {index == content.schedule.length - 1 ||
                        <div style={{gridColumn:"span 3", width:"100%", height:1, background:"#555", transform: "scale(1.00001)"}}></div>
                    }
                </React.Fragment>)}
            </div>
        </div>
    </div>)
}

function LunchElement(props : {lunch: Lunch} & React.HTMLAttributes<HTMLDivElement>) {
    const today = false;
    const lunch = props.lunch;
    const date = new Date(lunch.date.unix);
    return (
            <div {...props} style={{display:"contents"}}>
                <div style={{display:"flex", padding:"0 16px 0 16px", flexDirection:"column", alignItems:"center", borderRight:"#ccc 1px solid"}}>
                    <strong>{today ? "Tänään" : lunch.date.weekdayLong}</strong>
                    <span style={{fontWeight:200}}>{date.getDate() + "." + (date.getMonth() + 1) + "."}</span>
                </div>
                <div style={{paddingRight:16, borderRight:"#ccc 1px solid"}}>
                    <FoodList key="primary" meal={lunch.primary}/>
                    <FoodList key="secondary" meal={lunch.secondary}/>
                </div>
                <div style={{paddingRight:16, display:"flex", alignItems:"center"}}>
                    <FoodList key="common" meal={lunch.common}/>
                </div>
            </div>)
}

function FoodList({meal} : {meal: Food[]}) : React.ReactNode {
    if (meal.length < 2)
        return meal.length == 1 ? <FoodElement food={meal[0]}/> : null;
    return <div style={{display:"flex"}}>
        {meal.map((food, index) => <React.Fragment key={food.name}>
            {index == 0 || (<span style={{ marginLeft:2, whiteSpace: "break-spaces" }}>, </span>)}
            <FoodElement food={food}/>
        </React.Fragment>)}
    </div>
}

function FoodElement(props : {food: Food} & React.HTMLAttributes<HTMLDivElement>) {
    const food = props.food;

    let primaryLabel = null;
    for (const label of food.labels) {
        if (label.startsWith("VEGA"))
            primaryLabel = "VEG";
        if (label == "K" || label.startsWith("VEGE"))
            primaryLabel = "K";
    }
    return (
        <div {...props} style={{display: "flex", gap: 8, flexDirection: "row", alignItems: "center"}}>
            <span>{food.name}</span>
            {primaryLabel == null ||
                <div style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                                width:14 + primaryLabel.length, outline: "#005248 1px solid", height: 15,
                                background: "#379E8B", borderRadius:"30%",
                            }}>
                    <span style={{color: "white", fontWeight: 600, fontSize: 11 - primaryLabel.length, width: "100%"}}>{primaryLabel}</span>
                </div>
            }
        </div>
    )
}

export default ScheduleView;