import { Food, Lunch, useAromi } from "../utils/aromi";
import { Feed } from "./SourceSelect";

function MobileScheduleView({feed, setFeed}: {feed: Feed, setFeed: (newFeed: Feed | null) => void}) {
    const content = useAromi(feed);
    const title = content.url ? feed.title ?? content.name : '⌛';

    return <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
        <h3 style={{margin:16, cursor:"pointer", textAlign:"center"}} onClick={() => setFeed(null)}>
            {title}
        </h3>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {content.schedule.map(lunch => <LunchElement key={lunch.date.id} lunch={lunch}/>)}
        </div>
    </div>
}

function LunchElement({lunch} : {lunch: Lunch}) {
    const date = new Date(lunch.date.unix), todayDate = new Date();
    const today = todayDate.getMonth() == date.getMonth() && todayDate.getDate() == date.getDate();
    const day = today ? "Tänään" : lunch.date.weekdayLong;
    return (<div id={lunch.date.id} style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
        <strong style={{marginBottom:8}}>{`${day} ${date.getDate()}.${date.getMonth() + 1}.`}</strong>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
            <FoodList key="primary" meal={lunch.primary}/>
            <FoodList key="secondary" meal={lunch.secondary}/>
            <FoodList key="common" meal={lunch.common} style={{marginTop:8}}/>
        </div>
        <div style={{width:"calc(100% - 32px)", height:1, marginTop:10, background:"#00000055"}}></div>
    </div>)
}

function FoodList({meal, style, ...props} : {meal: Food[]} & React.HTMLAttributes<HTMLDivElement>) : React.ReactNode {
    const list = meal.reduce((acc, food, index) => {
        if (index > 0) acc.push(<span key={"sep" + index} style={{whiteSpaceCollapse:"break-spaces"}}>, </span>);
        acc.push(<FoodElement key={index} food={food}/>);
        return acc;
      }, [] as React.ReactNode[]);
    return <div {...props} style={{display:"flex", flexWrap:"wrap", justifyContent:"center", alignItems:"center", ...style}}>
        {list}
    </div>
}

function FoodElement({food} : {food: Food}) {
    let primaryLabel = null;
    for (const label of food.labels) {
        if (label.startsWith("VEGA"))
            primaryLabel = "VEG";
        if (label == "K" || label.startsWith("VEGE"))
            primaryLabel = "K";
    }
    return (
        <div id={food.name} key={food.name} style={{display:"flex", gap:8, flexDirection:"row", alignItems:"center", height:20}}>
            <span>{food.name}</span>
            {primaryLabel == null ||
                <div style={{background:"#379E8B", borderRadius:"30%", width:15, height:15, display:"inline-flex", alignItems:"center", justifyContent:"center", textAlign:"center"}}>
                    <span style={{color:"white", fontSize:8, fontWeight:600, width:"100%"}}>{primaryLabel}</span>
                </div>
            }
        </div>
    )
}

export default MobileScheduleView;