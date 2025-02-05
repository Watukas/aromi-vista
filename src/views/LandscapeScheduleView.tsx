import { Food, Lunch, useAromi } from "../utils/aromi";
import React from "react";
import { Feed } from "./SourceSelect";

function LandscapeScheduleView({feed, setFeed}: {feed: Feed, setFeed: (newSource: Feed | null) => void}) {
    const content = useAromi(feed);

    const title = new URLSearchParams(window.location.search).get("title") ?? content.name;

    return <div style={{width:"100%", height:"100%"}}>
        <div style={{display:"flex", width:"100%", justifyContent:"center"}}>
            <h2 onClick={() => setFeed(null)} style={{ fontFamily:"Bebas Neue", padding:"0px", margin:0, cursor:"pointer", textDecoration:title.length > 5 ? "underline" : undefined, textAlign: "center" }}>
                {title}
            </h2>
        </div>
        <div style={{display:"flex", justifyContent:"center", height:"80%", padding:"8px 4px 8px 4px"}}>
            {content.schedule.map((lunch) => <LunchElement key={lunch.date.weekdayShort} lunch={lunch}/>)}
        </div>
    </div>
}

function LunchElement(props : {lunch: Lunch} & React.HTMLAttributes<HTMLDivElement>) {
    const today = false;
    const lunch = props.lunch;
    return (
            <div {...props} style={{
                    display:"flex", flexDirection:"column", gap:16,
                    width:"300px",
                    height: "100%",

                    padding:8,
                    borderLeft: "#aaa 1px solid",
                    borderRight:"#aaa 1px solid"
            }}>
                <div style={{display:"flex", padding:"0 16px 0 16px", flexDirection:"column", alignItems:"center"}}>
                    <strong>{today ? "Tänään" : lunch.date.weekdayLong}</strong>
                </div>
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:8, height:"max-content"}}>
                    <FoodList key="primary" meal={lunch.primary}/>
                    <FoodList key="secondary" meal={lunch.secondary}/>
                </div>
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", paddingTop:16, borderTop:"#aaa 1px solid"}}>
                    <FoodList key="common" compact={true} meal={lunch.common}/>
                </div>
            </div>)
}

function FoodList({meal, compact} : {compact?: boolean, meal: Food[]}) : React.ReactNode {
    return <div style={{display:"flex", flexDirection:"column", gap:4}}>
        {meal.map(food  => <FoodElement key={food.name} compact={compact} food={food}/>)}
    </div>
}

function FoodElement({compact, food, ...props} : {compact?: boolean, food: Food} & React.HTMLAttributes<HTMLDivElement>) {

    return (
        <div {...props} style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
            <span style={{textAlign:"center", lineHeight:1}}>{food.name}</span>
            <div style={{display:"flex", gap:3, marginTop:3}}>
                {compact || food.labels.map(label => (<div key={label} style={{
                    background:"#379E8B", borderRadius:"30%", width:label.length * 2 + 9, height:11, outline:"black 1px solid", display:"inline-flex", alignItems:"center", justifyContent:"center", textAlign:"center"
                }}>
                     <span style={{color:"white", textRendering:"optimizeLegibility", fontWeight:600, fontSize:8}}>{label.substring(0, 3)}</span>
                </div>))}
            </div>
        </div>
    )
}

export default LandscapeScheduleView;