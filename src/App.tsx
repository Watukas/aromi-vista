import { useEffect, useState } from 'react';
import './App.css'
import ScheduleView from './views/ScheduleView';
import SourceSelect, { Feed } from './views/SourceSelect';
import MobileScheduleView from './views/MobileScheduleView';
import LandscapeScheduleView from './views/LandscapeScheduleView';
import { Aromi } from './utils/aromi';


function App() {
  const [feed, setFeed] = useSource();
  const view = useView();

  if (feed == null)
    return <SourceSelect mobile={view == View.Mobile} setFeed={setFeed}/>
  if (!isURL(feed.source, true))
    return <span>Source isn't acceptable</span>
  if (view == View.Mobile)
     return <MobileScheduleView feed={feed} setFeed={setFeed}/>;
  if (view == View.Landscape)
    return <LandscapeScheduleView feed={feed} setFeed={setFeed}/>;
  return <ScheduleView feed={feed} setFeed={setFeed}/>
}

export function isURL(url: string | null | undefined, aromi?: boolean) {
  if (url == null)
    return false;
  if (aromi && !url.toLowerCase().startsWith("https://aromi"))
    return false;
	try {
		const res = new URL(url.toLowerCase());
    if (aromi && !res.searchParams.has("id"))
      return false;
		return res.protocol.startsWith("http") && res.hostname.includes(".");
	} catch (_) {
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
    const [info, setInfo] = useState({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});
    const handle = () => setInfo({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});

    useEffect(() => {
        window.addEventListener('resize', handle);
        return () => window.removeEventListener('resize', handle);
    }, []);

    useEffect(() => {
      handle();
    }, [content.unix]);

    const width = ((ref?.clientWidth ?? 574) + 30) / info.ratio;
    const height = ((ref?.clientHeight ?? 432) + 30) / info.ratio;
    let scaleWidth = (1 / (width / info.width)) / info.ratio;
    let scaleHeight = (1 / (height / info.height)) / info.ratio;
    return Math.min(scaleWidth, scaleHeight);
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
  return {source:source, title:query.get("title"), proxy:query.get("proxy")} as Feed;
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
