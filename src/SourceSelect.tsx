import { useState } from "react";
import { isURL } from "./App";
import ScaleInput from "./ScaleInput";

function cache() : Feed[] {
    const item = localStorage.getItem("feeds");
    if (item == null)
        return [];
    try {
        return Object.values(JSON.parse(item));
    } catch (e) {
        console.error(e);
        return [];
    }
}

export interface Feed {
    source: string;
    title?: string;
    scale?: number;
    proxy?: string;
}

function displayName(feed: Feed) {
    if (feed.title)
        return feed.title;
    const cache = localStorage.getItem("cache");
    if (cache == null)
        return feed.source
    const parsed = JSON.parse(cache);
    return parsed[feed.source].name;
}

function defaultProxy() {
    for (let feed of cache()) {
        if (feed.proxy) return feed.proxy;
    }
    return undefined;
}

function SourceSelect({setFeed} : {setFeed: (newFeed: Feed | null) => void}) {
    const [input, setInput] = useState<Feed>(() => ({source:"", proxy:defaultProxy()}));

    const [storage, setStorage] = useState(cache);

    const sourceOk = isURL(input.source, true);
    const proxyOk = isURL(input.proxy) && (input.proxy!.endsWith("/") || input.proxy!.endsWith("="));
    const inputOk = sourceOk && proxyOk;

    const items = storage.map((feed, index) => {
        return <div key={feed.source + "-" + index} style={{display:"flex", gap:8}}>
            <span title="Right-click to Paste" style={{fontSize:18, fontWeight:600, cursor:"pointer", textDecoration:"underline"}} onContextMenu={e => {
                e.preventDefault()
                setInput(feed)
            }} onClick={e => {
                e.preventDefault();
                setFeed(feed);
            }}>{displayName(feed)}</span>
            <span style={{fontSize:18, fontWeight:900, cursor:"pointer"}} onClick={() => {
                const filtered = storage.filter(f => f != feed);
                localStorage.setItem("feeds", JSON.stringify(filtered));
                setStorage(filtered)
            }}>✖</span>
        </div>
    })

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceOk)
            return;
        const feed = {...input, title:input.title ? input.title : undefined}
        const some = storage.some(f => JSON.stringify(f) === JSON.stringify(feed));
        if (!some) {
            const newStorage = [...storage, feed];
            localStorage.setItem("feeds", JSON.stringify(newStorage));
            setStorage(newStorage);
        }
        setFeed(feed);
    };

    const inputStyle = sourceOk ?
        {width: "min(95vw, 1220px)", height: "30px"}
    :
        {width: "200px", height: "20px"}
    const proxyInputStyle =
        {border: "none", width: "250px", height: "20px"}
    const titleInputStyle =
        {border: "none", width: "250px", height: "20px"}
    return <div style=
    {{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100%", textAlign: "center", gap: 128
    }}>
        <form onSubmit={onSubmit} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
            <span style={{color:"#222", fontSize:27, fontWeight:900}}>Provide Source URL</span>
            <input placeholder="> paste here <" value={input.source} style={inputStyle} onChange={e => setInput({...input, source:e.target.value})}/>
            <span style={{fontFamily:"Smooch Sans", fontSize:18, fontWeight:500}}>
                Search for sources from <a style={{color:"#ff55bb"}} target="_blank" href="https://aromimenu.cgisaas.fi/EspooAromieMenus/FI/Default/ESPOO">Espoo Catering</a>
            </span>
            {!sourceOk || <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:8, marginTop:24}}>

                <div style={{display:"flex", alignItems:"center", justifyContent:"flex-start", gap:8, height:45}}>
                    <input placeholder="> optional title <" value={input.title ?? ""} style={titleInputStyle} onChange={e => setInput({...input, title:e.target.value})}></input>
                    <input placeholder="> proxy endpoint <" value={input.proxy ?? ""} style={proxyInputStyle} onChange={e => setInput({...input, proxy:e.target.value})}></input>
                </div>
                <ScaleInput
                    value={input.scale}
                    onChange={value => setInput({ ...input, scale: value })}
                />
                <input style={{marginTop:32}} type="submit" disabled={!inputOk} value="> create feed <"/>
            </div>}

        </form>
        {items.length == 0 ||
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:8}}>
                <span style={{fontSize:18, fontWeight:900}}>Previously Created Feeds</span>
                {items}
            </div>
        }
    </div>
}

export default SourceSelect;