import { XMLParser } from 'fast-xml-parser';
import { useEffect, useState } from 'react';
import { Feed } from './SourceSelect';
import { isURL } from './App';

export interface Aromi {
  name: string;
  url: string;
  unix: number;
  schedule: Lunch[];
}

export interface ParsedDate {
  id: string;
  unix: number;
  weekdayShort: string;
  weekdayLong: string;
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

const defaultProxy = atob("aHR0cHM6Ly9hcm9taS1wcm94eS53YXR1a2FzLndvcmtlcnMuZGV2Lz91cmw9");

async function fetchProxied(feed: Feed) : Promise<Response> {
  if (!isURL(feed.source, true))
    throw new Error("URL must begin with 'https://aromimenu.cgisaas.fi/'");
  if (window.location.hostname == 'localhost')
    return fetch('https://corsproxy.io/?url=' + encodeURIComponent(feed.source));
  const proxy = feed.proxy ?? defaultProxy;

  const url = proxy.endsWith("/") ? feed.source : encodeURIComponent(feed.source);
  return fetch(proxy + url);
}

async function fetchContent(feed: Feed) : Promise<Aromi> {

  const now = Date.now();
  const response = await fetchProxied(feed);
  console.log("Fetch took " + (Date.now() - now) + "ms");

  const xmlText = await response.text();
  return loadContent(feed.source, xmlText);
}

function loadContent(url: string, xmlText: string) : Aromi {
  const parser = new XMLParser();
  const xml: any = parser.parse(xmlText);

  console.log('Parsed', xml);

  const areEqual = (obj1: Food, obj2: Food) => obj1.name == obj2.name;

  const item = xml.rss.channel.item;
  const items = Array.isArray(item) ? item : [item];

  const lunches: Lunch[] = items.map((o: any) => {
    const array = o.description.split("<br><br>");
    const mainCourse = format(array[1]);
    const veganCourse = format(array[0]);

    const common = mainCourse.filter(item1 => veganCourse.some(item2 => areEqual(item1, item2)));
    const primary = mainCourse.filter(item1 => !veganCourse.some(item2 => areEqual(item1, item2)));
    const secondary = veganCourse.filter(item2 => !mainCourse.some(item1 => areEqual(item1, item2)));
    return {date:parseDate(o.title), primary:primary, secondary:secondary, common:common} as Lunch;
  })
  return {name:xml.rss.channel.title.substring(4), url:url, unix:Date.now(), schedule:lunches};
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
  const dateWithoutWeekday = date.split(" ").slice(1).join(" ");
  const formats = [
    { // FI: dd.MM.yyyy
      regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
      parse: (m: RegExpMatchArray) => `${m[3]}-${m[2]}-${m[1]}`,
      locale: 'fi-FI'
    },
    { // SV: yyyy-MM-dd
      regex: /(\d{4})-(\d{1,2})-(\d{1,2})/,
      parse: (m: RegExpMatchArray) => `${m[1]}-${m[2]}-${m[3]}`,
      locale: 'sv-SE'
    },
    { // EN: MM/dd/yyyy
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      parse: (m: RegExpMatchArray) => `${m[3]}-${m[1]}-${m[2]}`,
      locale: 'en-US'
    }
  ];

  const formatWeekday = (locale: string, date: Date, long: boolean) => {
    const weekday = date.toLocaleString(locale, {weekday:long ? "long" : "short"})
    return weekday.charAt(0).toUpperCase() + weekday.substring(1);
  };

  for (const { regex, parse, locale } of formats) {
    const match = dateWithoutWeekday.match(regex);
    if (match) {
      const time = new Date(parse(match))
      return {weekdayShort:formatWeekday(locale, time, false), weekdayLong:formatWeekday(locale, time, true), id:date, unix:time.getTime()};
    }
  }

  console.error("Unknown date format", date);
  return {weekdayShort: date.substring(0, 3), weekdayLong: date.substring(0, 3), id:date, unix:new Date(date).getTime()};
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
export function useAromi(feed: Feed) : Aromi {
  const [state, setState] = useState<Aromi>(() => {
    const cached = loadCache(feed.source);
    if (cached == null)
      return {name:"⌛️", url:"", unix:Date.now(), schedule:[]}
    return cached;
  });
  useEffect(() => {
    if (!isExpired(state))
      return;
    fetchContent(feed).then(content => {
      saveCache(feed.source, content);
      setState(content)
    }).catch((e: Error) => {
      console.error(e);
      setState({name:e.message, url:"", unix:Date.now(), schedule:[]})
    });
  }, [feed.source])
  return state;
}