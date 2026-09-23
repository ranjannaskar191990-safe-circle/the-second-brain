const kmRe=/(\d{1,4}\s*\/\s*\d{1,3})\s*(?:to|[-–—]|থেকে|से)\s*(\d{1,4}\s*\/\s*\d{1,3})/i;
const railway=/usfd|rail|rails|sleeper|sleepers|gfb|ngfb|70\s*deg|70degree|70\s*degree|45\s*deg|0\s*deg|obsr|sej|turnout|weld|welding|plated|not\s*plated|movement|left\s*rail|right\s*rail|up\s*line|down\s*line|inspection|patrolling|kilometer|কিলোমিটার|किलोमीटर|\bkm\b|\d{1,4}\s*\/\s*\d{1,3}\s*(?:to|[-–—])\s*\d{1,4}\s*\/\s*\d{1,3}/i;
export function classify(text){
 const t=text.trim(),l=t.toLowerCase();let category="Personal";
 if(/₹|\brs\.?\b|inr|টাকা|रुपये|spent|spend|খরচ|खर्च|breakfast|lunch|dinner|expense/.test(l))category="Finance";
 if(railway.test(t))category="Railway Work";
 if(!railway.test(t)&&/kidshield|aden|project|প্রজেক্ট|प्रोजेक्ट/.test(l))category="Projects";
 if(!railway.test(t)&&/todo|task|remind|করতে হবে|करना है|tomorrow|কাল|कल/.test(l))category="Tasks";
 const km=t.match(kmRe);const nums=[...t.matchAll(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:টাকা|रुपये|rupees?|rs\.?|₹)/ig)];
 const amount=category==="Finance"?(nums.at(-1)?.[1]||""):"";
 const bn=/[\u0980-\u09FF]/.test(t),hi=/[\u0900-\u097F]/.test(t),en=/[A-Za-z]/.test(t);let language=bn?"বাংলা":hi?"हिंदी":"English";if((bn||hi)&&en)language="Mixed";
 let workType="";if(category==="Railway Work"){if(/usfd|gfb|ngfb|70\s*deg|obsr/i.test(t))workType="USFD";else if(/inspection/i.test(t))workType="Inspection";else if(/patrolling/i.test(t))workType="Patrolling"}
 return{original:t,language,category,amount,kmFrom:km?.[1]?.replace(/\s/g,"")||"",kmTo:km?.[2]?.replace(/\s/g,"")||"",workType,status:/overdue/.test(l)?"Overdue":/\bdue\b/.test(l)?"Due":"New"};
}