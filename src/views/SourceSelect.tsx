import { useState } from "react";
import { isURL } from "../App";
import RestaurantList from "../components/RestaurantList/RestaurantList";

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
	proxy?: string;
}

function displayName(feed: Feed) : string {
	if (feed.title)
		return feed.title;
	const cache = localStorage.getItem("cache");
	if (cache == null)
		return feed.source
	const parsed = JSON.parse(cache);
	return parsed[feed.source]?.name ?? "Unknown";
}

function defaultProxy() {
	for (let feed of cache()) {
		if (feed.proxy) return feed.proxy;
	}
	return undefined;
}

function SourceSelect({mobile, setFeed} : {mobile: boolean; setFeed: (newFeed: Feed | null) => void}) {
	const [input, setInput] = useState<Feed>(() => ({source:"", proxy:defaultProxy()}));
	const [storage, setStorage] = useState(cache);

	const sourceOk = isURL(input.source, true);
	const proxyOk = !input.proxy || isURL(input.proxy) && (input.proxy!.endsWith("/") || input.proxy!.endsWith("="));
	const inputOk = sourceOk && proxyOk;

	const items = storage.map((feed, index) => {
		const title = [
			'Left-click to enter feed',
			'(Control) Left-click to remove feed',
			'Right-click to paste',
			'(Control) Right-click to copy rss feed'
		].join('\n');
		return <div key={feed.source + "-" + index} style={{display:"flex", gap:8}}>
			<span title={title} style={{fontSize:mobile ? 16 : 18, fontWeight:600, cursor:"pointer", textDecoration:"underline", padding:"0px 16px"}} onContextMenu={e => {
				e.preventDefault()
				if (e.ctrlKey) {
					navigator.clipboard.writeText(feed.source)
				} else {
					if (JSON.stringify(input) == JSON.stringify(feed)) {
						if (mobile) {
							const filtered = storage.filter(f => f != feed);
							localStorage.setItem("feeds", JSON.stringify(filtered));
							setStorage(filtered)
						} else {
							setInput({source:""})
						}
					} else
						setInput(feed)
				}
			}} onClick={e => {
				e.preventDefault();
				if (e.ctrlKey) {
					const filtered = storage.filter(f => f != feed);
					localStorage.setItem("feeds", JSON.stringify(filtered));
					setStorage(filtered)
				} else {
					setFeed(feed);
				}
			}}>{displayName(feed)}</span>
		</div>
	})

	const onSubmit = (e: React.MouseEvent<HTMLInputElement>) => {
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
		if (!e.shiftKey)
			setFeed(feed);
	};

	const proxyInputStyle =
		{border: "none", width: "250px", height: "20px"}
	const titleInputStyle =
		{border: "none", width: "250px", height: "20px"}
	const style = sourceOk && mobile ? {paddingTop:64, gap: 32} : {
		alignItems: "center", justifyContent: "center",
		gap: "12%"
	}
	return <div style={{
		display: "flex", flexDirection: "column",
		height: "100%", textAlign: "center"
	}}>
		<div style={{...style,
			display: "flex", flexDirection: "column",
			height: "100%", textAlign: "center"
		}}>
			<form autoComplete="off" style={{display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
				<span style={{color:"#222", fontSize:27, fontWeight:900}}>Select Source</span>
				<RestaurantList sourceURL={input.source} setSourceURL={source => setInput({...input, source:source ?? ""})}/>
				<span style={{fontFamily:"Smooch Sans", fontSize:18, fontWeight:500}}>
					Sources from <a style={{color:"#ff55bb"}} target="_blank" href="https://aromimenu.cgisaas.fi/EspooAromieMenus/FI/Default/ESPOO">Espoo Catering</a>
				</span>
				{!sourceOk || <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:8, marginTop:24}}>

					<div style={{display:"flex", flexDirection:mobile ? "column" : "row", alignItems:"center", justifyContent:"flex-start", gap:8}}>
						<input id="menu-title" placeholder="> optional title <" value={input.title ?? ""} style={titleInputStyle} onChange={e => setInput({...input, title:e.target.value})}></input>
						<input id="proxy" autoComplete="on" placeholder="> proxy endpoint <" value={input.proxy ?? ""} style={proxyInputStyle} onChange={e => setInput({...input, proxy:e.target.value})}></input>
					</div>

					<input style={{marginTop:32}} type="submit" onClick={onSubmit} disabled={!inputOk} value="> create feed <"/>
				</div>}

			</form>
		</div>
		{items.length == 0 ||
			<div style={{display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:32}}>
				<span style={{fontSize:18, fontWeight:900}}>Previously Created Feeds</span>
				<div style={{marginTop:4, display:"flex", flexDirection:"column", flexWrap:mobile ? undefined : "wrap", alignItems:"center", textAlign:"center", width:"max-content", maxHeight:200}}>
					{items}
				</div>
			</div>
		}
	</div>
}

export default SourceSelect;