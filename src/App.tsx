import { useEffect, useState } from 'react';
import './App.css'
import ScheduleView from './ScheduleView';
import SourceSelect from './SourceSelect';
import MobileScheduleView from './MobileScheduleView';


function App() {
  const [source, setSource] = useSource();
  const mobile = useMobile();

  if (source == null)
    return <SourceSelect setSource={setSource}/>
  if (isURL(source))
    return mobile ? <MobileScheduleView source={source} setSource={setSource}/> : <ScheduleView source={source} setSource={setSource}/>
  return <span>Invalid</span>
}

export function isURL(url: string) {
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}

const useMobile = (breakpoint: number = 700): boolean => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [breakpoint]);

	return isMobile;
};

function useSource() : [string | null, (newSource: string | null) => void] {
  const [query, setQuery] = useState(window.location.search);
  const params = new URLSearchParams(query);
  const source = params.get("source");

  const setSource = (newSource: string | null) => {
    const newQuery = new URLSearchParams(query);
    if (newSource != null)
      newQuery.set("source", newSource);
    else newQuery.delete("source");
    window.history.pushState(null, '', '?' + newQuery.toString());
    console.log(newQuery.toString());
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

  return [source, setSource];
}

export default App
