import { useEffect, useRef, useState } from "react";
import { asSourceURL, Group, School, useRestaurants } from "../../utils/restaurants";
import "./RestaurantList.css";
import { useOnClickMiss } from "../../utils/useOnClickMiss";
import { isURL } from "../../App";
import LocaleComponent from "../LocaleComponent";
import WeekComponent from "../WeekComponent";

interface Selection {
  school: School;
  group?: Group;
}

function asSelection(schools: School[], sourceURL: string) : {selection: Selection, dateMode: number, locale: string} | null {
  try {
    if (!isURL(sourceURL, true))
      return null;
    const url = new URL(sourceURL.toLowerCase());
    const id = url.searchParams.get("id");
    const dateMode = Number(url.searchParams.get("datemode"));
    const school = schools.find(school => school.groups.find(group => group.id == id) != undefined);
    const locale = url.pathname.split("/")[2].toUpperCase();
    if (school)
      return {locale:locale, dateMode: dateMode, selection: {school:school, group:school.groups.find(group => group.id == id)} };
  } catch (e) { console.error(e); }
  return null;
}

function RestaurantList({sourceURL, setSourceURL} : {sourceURL: string | null, setSourceURL: (source: string | null) => void}) {
  const restaurants = useRestaurants();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [locale, setLocale] = useState("FI");
  const [dateMode, setDateMode] = useState(1);
  const [selected, setSelected] = useState<null | Selection>(null);
  const rss = isURL(input, true);

  const containerRef = useRef<HTMLInputElement>(null);
  useOnClickMiss(containerRef, () => {
    setOpen(false);
  });

  useEffect(() => {
    if (selected?.group)
      setSourceURL(asSourceURL(selected.school, selected.group, locale, dateMode));
    else if (!rss) setSourceURL(null);
  }, [open]);

  useEffect(() => {
    if (sourceURL) {
      const selection = asSelection(restaurants, sourceURL);
      if (selection) {
        setLocale(selection.locale)
        setDateMode(selection.dateMode)
        setSelected(selection.selection)
        setInput(selection.selection.school.name);
      } else setInput(sourceURL);
    } else setInput("");
  }, [sourceURL]);

  useEffect(() => {
    if (selected && !restaurants.find(school => school.id == selected.school.id && school.name.toLowerCase().startsWith(input.toLowerCase()))) {
      setSelected(null);
    }
    if (rss)
      setSourceURL(input);
  }, [input]);

  const grouped = [];
  for (let i = 65; i <= 90; i++) {
    const c = String.fromCharCode(i);
    const f = restaurants.filter(r => r.name.charAt(0).toUpperCase() === c);
    if (f.length > 0) grouped.push({ character: c, schools: f });
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Escape')
      setOpen(false);
    if (e.key == 'Enter') {
      e.preventDefault();
      setOpen(false);
      const restaurant = restaurants.find(school => school.name.toLowerCase().startsWith(input.toLowerCase()))
      if (restaurant == null)
        return;
      setSelected({school:restaurant});
      setInput(restaurant.name);
    }
    if (e.key != 'Tab' || !open)
        return;
    e.preventDefault();
    const mod = (x: number, y: number) => {
      return ((x % y) + y) % y;
    }
    const index = selected == null ? -1 : restaurants.findIndex(school => school.id == selected.school.id);
    const restaurant = restaurants[mod(index + (e.shiftKey ? -1 : 1), restaurants.length)];
    setSelected({school:restaurant});
    setInput(restaurant.name);
  }

  const handleFocus = () => setOpen(true);

  const width = rss ? "min(1200px, calc(100vw - 32px))" : undefined;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", position: "relative", width:width}}>
      <input id="restaurant-list" placeholder="> choose <"
        readOnly={!open && !rss} // TODO: add a state for isReadOnly to fix this. So that the mobile keyboard wouldn't turn on by def
        value={input ?? ""} onChange={(e) => setInput(e.currentTarget.value)}
        spellCheck={false} autoComplete="off"
        onKeyDown={handleKey} onFocus={handleFocus}
        style={{
          boxSizing: "border-box",
          padding: "24px 20px",
          fontSize: "16px",
          width: "100%",
          borderColor: !open && selected && !selected.group ? "red" : undefined,
          borderRadius: "5px",
        }}
      />

      {!open || rss || <div className="restaurant-dropdown">
        <div className="restaurant-groups">
          {grouped
            .filter(group => !input || input.toUpperCase().startsWith(group.character))
            .map((group) => (
              <div key={group.character} className="restaurant-group">
                <h3>{group.character}</h3>
                <div className="restaurant-list">
                  {group.schools.map((school) => (
                    <SchoolElement key={school.id} school={school} state={
                          selected?.school.id == school.id
                              ? OptionState.Selected
                              : school.name.toLowerCase().startsWith(input.toLowerCase())
                                  ? OptionState.Default
                                  : OptionState.Disabled
                          } selected={selected} setSelected={selection => {
                            setSelected(selection);
                            setInput(selection?.school.name ?? "");
                          }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:8, gap: 2, borderTop:"#aaa 1px solid"}}>
            <WeekComponent mode={dateMode} setMode={setDateMode}/>
            <LocaleComponent locale={locale} setLocale={setLocale}/>
          </div>
      </div>
      }
    </div>
  );
}

enum OptionState {
    Disabled, Selected, Default
}

function SchoolElement({selected, setSelected, state, school} : {selected: Selection | null, setSelected: (selection: Selection | null) => void, state: OptionState, school: School}) {
  const group = selected?.school.id == school.id
    ? selected.group
    : undefined
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
    if (selected?.school.id == school.id) {
      setSelected(school.groups.length > 1 && group ? {school:school, group:undefined} : null);
    } else {
      setSelected({school:school, group:school.groups.length == 1 ? school.groups[0] : undefined});
    }
  };

  const selectedStyle = state == OptionState.Selected && !group
   ? { boxSizing:"border-box", padding:"4px 8px 8px 8px" } as React.StyleHTMLAttributes<HTMLDivElement>
   : undefined;
	return (
		<div
			style={{...selectedStyle, display: "flex", flexDirection: "column"}}
			onClick={handleClick}
			className={"restaurant-item " + OptionState[state]}
		>
			{school.name}
			{state != OptionState.Selected || (

        group ?
          <span>{group.name}</span>
        :
        <div style={{display:"flex", flexDirection:"column", background:"#fff", padding:16, gap:8}}>
          {school.groups.map(group => (
            <span onClick={e => { e.stopPropagation(); setSelected({school:school, group:group})}} className="restaurant-item-group">{group.name}</span>
          ))}
        </div>
			)}
		</div>
	);
}

export default RestaurantList;
