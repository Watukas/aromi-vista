import { useState } from "react";
import { Aromi } from "./aromi";
import { isURL } from "./App";

function cache() : Aromi[] {
    const item = localStorage.getItem("cache");
    if (item == null)
        return [];
    try {
        return Object.values(JSON.parse(item));
    } catch (e) {
        console.error(e);
        return [];
    }
}

function SourceSelect({setSource} : {setSource: (newSource: string | null) => void}) {
    const [input, setInput] = useState("");
    const [storage, setStorage] = useState(cache);
    let inputOk = isURL(input);

    const items = storage.map(aromi => {
        return <div key={aromi.url} style={{display:"flex", gap:8}}>
            <span title="Right-click to Paste" style={{fontSize:18, fontWeight:600, cursor:"pointer", textDecoration:"underline"}} onContextMenu={e => {
                e.preventDefault()
                setInput(aromi.url)
            }} onClick={e => {
                e.preventDefault();
                setSource(aromi.url);
            }}>{aromi.name}</span>
            <span style={{fontSize:18, fontWeight:900, cursor:"pointer"}} onClick={() => {
                const filtered = storage.filter(a => a != aromi);
                const cache = JSON.parse(localStorage.getItem("cache")!);
                delete cache[aromi.url];
                localStorage.setItem("cache", JSON.stringify(cache));
                setStorage(filtered)
            }}>✖</span>
        </div>
    })

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputOk)
            return;
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set('source', input);
        window.history.pushState(null, '', '?' + newSearchParams.toString());
        window.location.reload();
    };

    const inputStyle = input.length > 0 ?
        {width: "min(95vw, 1220px)", height: "30px"}
    :
        {width: "200px", height: "20px"}
    return <div style={{display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:128}}>
        <form onSubmit={onSubmit} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
            <span style={{color:"#222", fontSize:27, fontWeight:900}}>Provide Source URL</span>
            <input placeholder="> Paste here <" value={input} style={inputStyle} onChange={e => setInput(e.target.value)}></input>
            <span style={{fontFamily:"Smooch Sans", fontSize:18, fontWeight:500}}>
                Search for sources from <a style={{color:"#ff55bb"}} target="_blank" href="https://aromimenu.cgisaas.fi/EspooAromieMenus/FI/Default/ESPOO">Espoo Catering</a>
            </span>
        </form>
        {items.length == 0 ||
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:8}}>
                <span style={{fontSize:18, fontWeight:900}}>Previously Used URLs</span>
                {items}
            </div>
        }
    </div>
}

export default SourceSelect;