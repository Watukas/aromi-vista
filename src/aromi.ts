import { XMLParser } from 'fast-xml-parser';
import { useEffect, useState } from 'react';

export interface Aromi {
  name: string;
  url: string;
  schedule: Lunch[];
}

export interface ParsedDate {
  id: string;
  weekday: string;
  unix: number;
}

export interface Lunch {
  date: ParsedDate;
  primary: Food[],
  secondary: Food[],
  common: Food[]
}

export interface Food {
  name: string;
  labels: string[];
}

function format(description: string) : Food[] {
  const cut = description.substring(description.indexOf(":") + 1);
  const regex = /^(.+?)\s*\(([^)]+)\)$/;
  return cut.split(/,(?![^()]*\))(?![^{}]*\})(?![^[]*\])/).map(food => {
    const match = food.match(regex);
    if (match == null)
      return {name:food.trim(), labels:[]};
    return {name:match[1].trim(), labels:match[2].split(',').map(s => s.trim())} as Food
  });
}

const proxy = atob("aHR0cHM6Ly8wZXdjaHYwNmM1LmV4ZWN1dGUtYXBpLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbS9wcm94eS8=");

async function fetchProxied(url: string) : Promise<Response> {
  const prefix = "https://aromimenu.cgisaas.fi/";
  if (!url.toLowerCase().startsWith(prefix))
    throw new Error("URL must begin with '" + prefix + "'");
  if (window.location.hostname == 'localhost')
    return fetch('https://corsproxy.io/?url=' + encodeURIComponent(url));
  return fetch(proxy + url.substring(prefix.length));
}

async function fetchContent(url: string) : Promise<Aromi> {

  const now = Date.now();
  const response = await fetchProxied(url);
  console.log("Fetch took " + (Date.now() - now) + "ms");

  const xmlText = await response.text();
  return loadContent(url, xmlText);
}

function loadContent(url: string, xmlText: string) : Aromi {
  const parser = new XMLParser();
  const xml: any = parser.parse(xmlText);

  const areEqual = (obj1: Food, obj2: Food) => obj1.name == obj2.name;
  const lunches: Lunch[] = xml.rss.channel.item.map((o: any) => {
    const array = o.description.split("<br><br>");
    const mainCourse = format(array[1]);
    const veganCourse = format(array[0]);

    const common = mainCourse.filter(item1 => veganCourse.some(item2 => areEqual(item1, item2)));
    const primary = mainCourse.filter(item1 => !veganCourse.some(item2 => areEqual(item1, item2)));
    const secondary = veganCourse.filter(item2 => !mainCourse.some(item1 => areEqual(item1, item2)));
    return {date:parseDate(o.title), primary:primary, secondary:secondary, common:common} as Lunch;
  })
  return {name:xml.rss.channel.title.substring(4), url:url, schedule:lunches};
}

function loadCache(url: string) : Aromi | null {
  const cache = localStorage.getItem("cache");
  if (cache == null)
    return null;
  try {
    const parsed = JSON.parse(cache);
    const item = parsed[url];
    if (item == null)
      return null;
    return item;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function saveCache(url: string, aromi: Aromi) {
  const cache = localStorage.getItem("cache");
  let parsed;
  try {
    parsed = JSON.parse(cache ?? "{}");
  } catch (e) {
    console.error(e);
    parsed = {}
  }
  parsed[url] = aromi;
  localStorage.setItem("cache", JSON.stringify(parsed));
}

function parseDate(date: string) : ParsedDate {
  const weekday = date.charAt(0).toUpperCase() + date.substring(1, date.indexOf(' '));
  const dateWithoutWeekday = date.split(" ").slice(1).join(" ");
  const formats = [
    { // FI: dd.MM.yyyy
      regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
      parse: (m: RegExpMatchArray) => `${m[3]}-${m[2]}-${m[1]}`,
    },
    { // SV: yyyy-MM-dd
      regex: /(\d{4})-(\d{1,2})-(\d{1,2})/,
      parse: (m: RegExpMatchArray) => `${m[1]}-${m[2]}-${m[3]}`,
    },
    { // EN: MM/dd/yyyy
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      parse: (m: RegExpMatchArray) => `${m[3]}-${m[1]}-${m[2]}`,
    }
  ];

  for (const { regex, parse } of formats) {
    const match = dateWithoutWeekday.match(regex);
    if (match) {
      return {weekday:weekday, id:date, unix:new Date(parse(match)).getTime()};
    }
  }

  console.error("Unknown date format", date);
  return {weekday: date.substring(0, 3), id:date, unix:new Date(date).getTime()};
}

function isExpired(aromi: Aromi) {
  if (aromi.schedule.length == 0)
    return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return aromi.schedule.every(lunch => {
    const date = new Date(lunch.date.unix);
    date.setHours(0, 0, 0, 0);
    return today > date;
  });
}

// Example Usage
export function useAromi(url: string) : Aromi {
  const [state, setState] = useState<Aromi>(() => {
    const cached = loadCache(url);
    if (cached == null)
      return {name:"⌛️", url:"", schedule:[]}
    return cached;
  });
  useEffect(() => {
    if (!isExpired(state))
      return;
    fetchContent(url).then(content => {
      saveCache(url, content);
      setState(content)
    }).catch((e: Error) => {
      setState({name:e.message, url:"", schedule:[]})
    });
  }, [url])
  return state;
}