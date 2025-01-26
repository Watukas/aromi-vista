import { useEffect, useState } from 'react';
import './App.css'
import ScheduleView from './ScheduleView';
import SourceSelect, { Feed } from './SourceSelect';
import MobileScheduleView from './MobileScheduleView';
import LandscapeScheduleView from './LandscapeScheduleView';
import { Aromi } from './aromi';


function App() {
  const [feed, setFeed] = useSource();
  const view = useView();

  if (feed == null)
    return <SourceSelect setFeed={setFeed}/>
  if (!isURL(feed.source, true))
    return <span>Invalid</span>
  if (view == View.Mobile)
     return <MobileScheduleView feed={feed} setFeed={setFeed}/>;
  if (view == View.Landscape)
    return <LandscapeScheduleView feed={feed} setFeed={setFeed}/>;
  return <ScheduleView feed={feed} setFeed={setFeed}/>
}

export function isURL(url: string | null | undefined, aromi?: boolean) {
  if (url == null)
    return false;
  if (aromi && !url.toLowerCase().startsWith("https://aromimenu.cgisaas.fi/"))
    return false;
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}

enum View { Desktop, Mobile, Landscape }

const useView = () : View => {
  const handle = () => {
    if (window.innerWidth <= 700 && window.innerHeight > window.innerWidth / 1.5)
      return View.Mobile;
    else if (window.innerHeight <= 450 && window.innerWidth > window.innerHeight / 1.5)
      return View.Landscape;
    else return View.Desktop;
  }
	const [view, setView] = useState(handle());

	useEffect(() => {
		const handleResize = () => setView(handle());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return view;
};

export function useScale(content: Aromi, ref: HTMLDivElement | null) {
    const query = new URLSearchParams(window.location.search);
    const [info, setInfo] = useState({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});
    const handle = () => setInfo({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});

    useEffect(() => {
        window.addEventListener('resize', handle);
        return () => window.removeEventListener('resize', handle);
    }, []);

    useEffect(() => {
      handle();
    }, [content.unix]);

    const lockedScale = query.get("scale");
    if (lockedScale)
      return parseFloat(lockedScale) / info.ratio;
    const width = ((ref?.clientWidth ?? 574) + 50) / info.ratio;
    const height = ((ref?.clientHeight ?? 432) + 30) / info.ratio;
    let scale = (1 / (height / info.height)) / info.ratio;
    scale -= scale * Math.max(0, ((scale * width) / info.width * info.ratio) - 1);
    return scale;
}

function asQuery(feed: Feed | null) {
  const query = new URLSearchParams();
  if (feed == null)
    return query;
  Object.entries(feed).forEach(([key, value]) => {
    if (value !== undefined) query.append(key, String(value));
  });
  return query;
}

function asFeed(query: URLSearchParams) : Feed | null {
  const source = query.get("source");
  if (source == null)
    return null;
  return {source:source, title:query.get("title"), scale:Number(query?.get("scale")) || 0, proxy:query.get("proxy")} as Feed;
}

function useSource() : [Feed | null, (newSource: Feed | null) => void] {
  const [query, setQuery] = useState(window.location.search);
  const feed = asFeed(new URLSearchParams(query));

  const setSource = (newSource: Feed | null) => {
    const newQuery = asQuery(newSource);
    window.history.pushState(null, '', '?' + newQuery.toString());
    setQuery(newQuery.toString());
  }

  useEffect(() => {
    const handlePopState = () => {
      setQuery(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return [feed, setSource];
}

export default App
