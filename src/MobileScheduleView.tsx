import { Food, Lunch, useAromi } from "./aromi";

function MobileScheduleView({source, setSource}: {source: string, setSource: (newSource: string | null) => void}) {
    const content = useAromi(source);

    return <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
        <h2 style={{cursor:"pointer", textAlign:"center"}} onClick={() => setSource(null)}>{content.name}</h2>
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {content.schedule.map(lunch => <LunchElement lunch={lunch}/>)}
        </div>
    </div>
}

function FoodList({meal} : {meal: Food[]}) : React.ReactNode {
    if (meal.length < 2)
        return meal.length == 1 ? <FoodElement food={meal[0]}/> : null;
    const list = meal.reduce((acc, food, index) => {
        if (index > 0) acc.push(<span key={"sep" + index} style={{whiteSpaceCollapse:"break-spaces"}}>, </span>);
        acc.push(<FoodElement key={index} food={food}/>);
        return acc;
      }, [] as React.ReactNode[]);
    return <div style={{display:"flex", alignItems:"center"}}>
        {list}
    </div>
}

function LunchElement({lunch} : {lunch: Lunch}) {
    const today = false;
    const date = new Date(lunch.date.unix);
    return (<div id={lunch.date.id} style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
        <strong>{today ? "Tänään" : lunch.date.weekday + " " + date.getDate() + "." + (date.getMonth() + 1) + "."}</strong>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
            <FoodList meal={lunch.primary}/>
            <FoodList meal={lunch.secondary}/>
            <FoodList meal={lunch.common}/>
        </div>
        <div style={{width:"100%", height:1, marginTop:10, background:"#00000055"}}></div>
    </div>)
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
        <div id={food.name} key={food.name} style={{display:"flex", gap:8, flexDirection:"row", alignItems:"center"}}>
            <span>{food.name}</span>
            {primaryLabel == null ||
                <div style={{background:"#00bb55", borderRadius:"30%", width:15, height:15, display:"inline-flex", alignItems:"center", justifyContent:"center", textAlign:"center"}}>
                    <span style={{color:"white", fontSize:8, width:"100%"}}>{primaryLabel}</span>
                </div>
            }
        </div>
    )
}

export default MobileScheduleView;