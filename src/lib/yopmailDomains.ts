/**
 * YopMail Domain Rotation Utility
 * 
 * FETCH PRIORITY:
 * 1. FIRST: Always attempts to fetch LIVE domains from YopMail API
 * 2. FALLBACK: Only uses day-of-year rotation if API fetch fails
 * 
 * This ensures we always get the latest domains when possible,
 * and gracefully fall back to 240+ hardcoded domains with daily rotation.
 * 
 * Note: Vite proxy works in development. In production, requests will fail
 * and automatically use the fallback rotation system.
 */

// Complete list of YopMail domains (manually updated from their API)
// Last updated: February 9, 2026
const ALL_YOPMAIL_DOMAINS = [
  'binich.com', // Today's featured domain
  '1xp.fr', 'cpc.cx', '0cd.cn', 'ves.ink', 'q0.us.to', 'zx81.ovh', 'wishy.fr',
  'blip.ovh', 'iya.fr.nf', 'sdj.fr.nf', 'afw.fr.nf', 'mynes.com', 'lerch.ovh',
  'six25.biz', 'ywzmb.top', 'isep.fr.nf', 'noreply.fr', 'pliz.fr.nf', 'noyp.fr.nf',
  'zouz.fr.nf', 'hunnur.com', 'wxcv.fr.nf', 'zorg.fr.nf', 'imap.fr.nf', 'redi.fr.nf',
  'dlvr.us.to', 'y.iotf.net', 'ym.cypi.fr', 'yop.too.li', 'dmts.fr.nf', 'enpa.rf.gd',
  'pochtac.ru', 'super.lgbt', 'jmail.fr.nf', 'yaloo.fr.nf', 'jinva.fr.nf', 'ealea.fr.nf',
  'nomes.fr.nf', 'yop.kd2.org', 'alves.fr.nf', 'bibi.biz.st', 'bboys.fr.nf', 'ma.ezua.com',
  'ma.zyns.com', 'mai.25u.com', 'autre.fr.nf', 'tweet.fr.nf', 'pamil.fr.nf', '15963.fr.nf',
  'popol.fr.nf', 'flobo.fr.nf', 'toolbox.ovh', 'bin-ich.com', 'sindwir.com', 'mabal.fr.nf',
  'degap.fr.nf', 'yop.uuii.in', 'jetable.org', 'a.kwtest.io', 'cc.these.cc', 'gland.xxl.st',
  'nospam.fr.nf', 'azeqsd.fr.nf', 'le.monchu.fr', 'nikora.fr.nf', 'sendos.fr.nf', 'cubox.biz.st',
  'fhpfhp.fr.nf', 'c-eric.fr.nf', 'bahoo.biz.st', 'upc.infos.st', 'spam.aleh.de', 'alphax.fr.nf',
  'habenwir.com', 'ist-hier.com', 'sind-wir.com', 'sindhier.com', 'wir-sind.com', 'myself.fr.nf',
  'yop.mabox.eu', 'vip.ep77.com', 'druzik.pp.ua', 'flaimenet.ir', 'cloudsign.in', 'iuse.ydns.eu',
  'get.vpn64.de', 'pepamail.com', 'gmail.gob.re', 'faybetsy.com', 'yahooz.xxl.st', 'altrans.fr.nf',
  'yoptruc.fr.nf', 'kyuusei.fr.nf', 'certexx.fr.nf', 'dede.infos.st', 'yotmail.fr.nf', 'miloras.fr.nf',
  'nikora.biz.st', 'cabiste.fr.nf', 'galaxim.fr.nf', 'ggmail.biz.st', 'eooo.mooo.com', 'dis.hopto.org',
  'yop.kyriog.fr', 'yop.mc-fly.be', 'tmp.x-lab.net', 'mail.hsmw.net', 'y.dldweb.info', 'haben-wir.com',
  'sind-hier.com', 'assurmail.net', 'yop.smeux.com', 'alyxgod.rf.gd', 'mailadresi.tk', 'aze.kwtest.io',
  'vitahicks.com', 'zeropolly.com', 'mailbox.biz.st', 'elmail.4pu.com', 'carioca.biz.st', 'mickaben.fr.nf',
  'ac-malin.fr.nf', 'gimuemoa.fr.nf', 'woofidog.fr.nf', 'rygel.infos.st', 'contact.biz.st', 'rapidefr.fr.nf',
  'calendro.fr.nf', 'calima.asso.st', 'cobal.infos.st', 'terre.infos.st', 'imails.asso.st', 'warlus.asso.st',
  'carnesa.biz.st', 'mail.tbr.fr.nf', 'webstore.fr.nf', 'mr-email.fr.nf', 'abo-free.fr.nf', 'mailsafe.fr.nf',
  'sirttest.us.to', 'yop.moolee.net', 'antispam.fr.nf', 'machen-wir.com', 'adresse.biz.st', 'poubelle.fr.nf',
  'lacraffe.fr.nf', 'gladogmi.fr.nf', 'yopmail.ozm.fr', 'mail.yabes.ovh', 'totococo.fr.nf', 'yopmail.kro.kr',
  'iamfrank.rf.gd', 'pooo.ooguy.com', 'get.route64.de', 'antispam.rf.gd', 'emocan.name.tr', 'donemail.my.id',
  'rodhazlitt.com', 'freemail.biz.st', 'skynet.infos.st', 'readmail.biz.st', 'frostmail.fr.nf', 'pitimail.xxl.st',
  'mickaben.biz.st', 'mickaben.xxl.st', 'internaut.us.to', 'poubelle-du.net', 'mondial.asso.st', 'randol.infos.st',
  'himail.infos.st', 'sendos.infos.st', 'nidokela.biz.st', 'likeageek.fr.nf', 'mcdomaine.fr.nf', 'emaildark.fr.nf',
  'cookie007.fr.nf', 'tagara.infos.st', 'pokemons1.fr.nf', 'spam.quillet.eu', 'desfrenes.fr.nf', 'mymail.infos.st',
  'mail.berwie.com', 'mesemails.fr.nf', 'dripzgaming.com', 'mymaildo.kro.kr', 'dann.mywire.org', 'tivo.camdvr.org',
  'tshirtsavvy.com', 'mymailbox.xxl.st', 'mail.xstyled.net', 'dreamgreen.fr.nf', 'contact.infos.st', 'mess-mails.fr.nf',
  'omicron.token.ro', 'torrent411.fr.nf', 'test.inclick.net', 'ssi-bsn.infos.st', 'webclub.infos.st', 'vigilantkeep.net',
  'actarus.infos.st', 'whatagarbage.com', 'test-infos.fr.nf', 'mail-mario.fr.nf', 'ym.digi-value.fr', 'adresse.infos.st',
  'ypmail.sehier.fr', 'pixelgagnant.net', 'm.tartinemoi.com', 'ggamess.42web.io', 'ma1l.duckdns.org', 'mail.kakator.com',
  'fiallaspares.com', 'courriel.fr.nf', 'jetable.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  'yopmail.fr', 'yopmail.net', 'yopmail.com'
];

// Fallback domains in case API fetch fails
const FALLBACK_DOMAINS = ALL_YOPMAIL_DOMAINS;

interface DomainCache {
  domains: string[];
  newDomain: string | null;
  otherDomains: string[];
  lastFetched: string; // ISO date string
}

const CACHE_KEY = 'yopmail_domains_cache';
const DOMAIN_API_URL = '/api/yopmail/domain?d=list'; // Use Vite proxy

/**
 * Parse domains from YopMail's domain list HTML
 */
function parseDomains(html: string): { domains: string[]; newDomain: string | null; otherDomains: string[] } {
  const allDomains: string[] = [];
  const otherDomains: string[] = [];
  let newDomain: string | null = null;

  // Extract the "New" domain (first domain in the "-- New --" optgroup)
  const newDomainMatch = html.match(/<optgroup label="-- New --">\s*<option>@([^<]+)<\/option>/);
  if (newDomainMatch) {
    newDomain = newDomainMatch[1];
    allDomains.push(newDomainMatch[1]);
  }

  // Extract all domains from "-- Others --" section
  const othersMatch = html.match(/<optgroup label="-- Others --">([\s\S]*?)<\/optgroup>/);
  if (othersMatch) {
    const optionRegex = /<option>@([^<]+)<\/option>/g;
    let match;
    
    while ((match = optionRegex.exec(othersMatch[1])) !== null) {
      const domain = match[1];
      otherDomains.push(domain);
      allDomains.push(domain);
    }
  }

  return { 
    domains: allDomains.length > 0 ? allDomains : ALL_YOPMAIL_DOMAINS, 
    newDomain: newDomain || null,
    otherDomains: otherDomains.length > 0 ? otherDomains : ALL_YOPMAIL_DOMAINS.slice(1)
  };
}

/**
 * Fetch domains from YopMail API via Vite proxy
 * PRIORITY 1: Always tries to fetch live data from YopMail first
 * PRIORITY 2: Falls back to day-of-year rotation only if fetch fails
 */
async function fetchDomains(): Promise<{ domains: string[]; newDomain: string | null; otherDomains: string[] }> {
  // STEP 1: Attempt to fetch live domains from YopMail
  try {
    const response = await fetch(DOMAIN_API_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch domains: ${response.status}`);
    }
    
    const html = await response.text();
    const parsed = parseDomains(html);
    
    // If parsing succeeded, return parsed data
    if (parsed.domains.length > 0 && parsed.newDomain) {
      return parsed;
    }
    
    // Otherwise fall back to rotation logic
    throw new Error('No domains parsed');
    
  } catch (error) {
    // STEP 2: Fallback to rotation (only if fetch/parse failed)
    
    // Fallback: Use day-of-year rotation
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const featuredIndex = dayOfYear % ALL_YOPMAIL_DOMAINS.length;
    const newDomain = ALL_YOPMAIL_DOMAINS[featuredIndex];
    
    const rotatedDomains = [
      newDomain,
      ...ALL_YOPMAIL_DOMAINS.filter(d => d !== newDomain)
    ];
    
    const otherDomains = rotatedDomains.slice(1);
    
    return { 
      domains: rotatedDomains, 
      newDomain,
      otherDomains
    };
  }
}

/**
 * Get cached domains or fetch new ones if cache is stale
 */
export async function getYopMailDomains(forceRefresh = false): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cache: DomainCache = JSON.parse(cached);
        // Return cached domains if they were fetched today
        if (cache.lastFetched === today && cache.domains.length > 0) {
          return cache.domains;
        }
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Fetch fresh domains
  const { domains, newDomain, otherDomains } = await fetchDomains();
  
  // Cache the result
  try {
    const cache: DomainCache = {
      domains,
      newDomain,
      otherDomains,
      lastFetched: today,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Silent fail
  }

  return domains;
}

/**
 * Get today's featured domain (the "New" domain that rotates daily)
 */
export async function getTodaysDomain(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cache: DomainCache = JSON.parse(cached);
      if (cache.lastFetched === today && cache.newDomain) {
        return cache.newDomain;
      }
    }
  } catch (error) {
    // Silent fail
  }

  // Fetch fresh domains to get today's new domain
  const { domains, newDomain, otherDomains } = await fetchDomains();
  
  // Cache the result
  try {
    const cache: DomainCache = {
      domains,
      newDomain,
      otherDomains,
      lastFetched: today,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Silent fail
  }

  // Return the new domain if available, otherwise use first from rotated list
  return newDomain || ALL_YOPMAIL_DOMAINS[0];
}

/**
 * Get a random domain from the available domains
 */
export async function getRandomDomain(): Promise<string> {
  const domains = await getYopMailDomains();
  return domains[Math.floor(Math.random() * domains.length)];
}

/**
 * Get a domain based on day of year for consistent daily rotation
 */
export async function getDailyRotatedDomain(): Promise<string> {
  const domains = await getYopMailDomains();
  
  // Calculate day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year to select domain for consistent daily rotation
  const index = dayOfYear % domains.length;
  return domains[index];
}
