const kmRe=/(\d{1,4}\s*\/\s*\d{1,3})\s*(?:to|[-–—]|থেকে|से)\s*(\d{1,4}\s*\/\s*\d{1,3})/i;
const railway=/usfd|rail|rails|sleeper|sleepers|gfb|ngfb|70\s*deg|70degree|70\s*degree|45\s*deg|0\s*deg|obsr|sej|turnout|weld|welding|plated|not\s*plated|movement|left\s*rail|right\s*rail|up\s*line|down\s*line|inspection|patrolling|kilometer|কিলোমিটার|किलोमीटर|\bkm\b|\d{1,4}\s*\/\s*\d{1,3}\s*(?:to|[-–—])\s*\d{1,4}\s*\/\s*\d{1,3}/i;
const finance=/₹|\brs\.?\b|inr|টাকা|रुपये|salary|income|earned|earning|received|balance|cash|bank|sbi|fd|fixed deposit|rd|nps|loan|emi|credit card|spent|spend|খরচ|খরচা|আয়|ইনকাম|বেতন|পেয়েছি|জমা|ব্যালেন্স|খर्च|कमाया|वेतन|expense|breakfast|lunch|dinner/i;
const project=/kidshield|project|প্রজেক্ট|प्रोजेक्ट/i;
const normalizeSpeech=t=>t
 .replace(/এডেন|এ ডি ই এন/gi,"ADEN")
 .replace(/ইউএসএফডি|ইউ এস এফ ডি/gi,"USFD")
 .replace(/কিডশিল্ড|কিড শিল্ড/gi,"KidShield")
 .replace(/গুগল ড্রাইভ/gi,"Google Drive")
 .replace(/হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ/gi,"WhatsApp")
 .replace(/রিপোর্ট/gi,"report")
 .replace(/রেলওয়ে|রেলওয়ে/gi,"Railway")
 .replace(/জয়েন্ট|জয়েন্ট/gi,"joint")
 .replace(/ওয়েল্ড|ওয়েল্ড/gi,"weld")
 .replace(/রেল ফ্র্যাকচার/gi,"rail fracture")
 .replace(/অবজার্ভেশন/gi,"observation")
 .replace(/এক্সপেন্স/gi,"expense")
 .replace(/স্যালারি/gi,"salary")
 .replace(/ইএমআই/gi,"EMI")
 .replace(/ফিক্সড ডিপোজিট|এফডি/gi,"FD")
 .replace(/ডিপ্লয়মেন্ট|ডিপ্লয়মেন্ট/gi,"deployment")
 .replace(/ডাটাবেস/gi,"database")
 .replace(/সিকিউরিটি/gi,"security")
 .replace(/টি\s*এম\s*এস|টিএমএস/gi,"TMS")
 .replace(/এস\s*ই\s*জে|এসইজে/gi,"SEJ")
 .replace(/জি\s*এফ\s*বি|জিএফবি/gi,"GFB")
 .replace(/এন\s*জি\s*এফ\s*বি|এনজিএফবি/gi,"NGFB")
 .replace(/এস\s*বি\s*আই|এসবিআই/gi,"SBI");
const completedIntent=/\b(done|completed|finished|submitted|sent|filled|did|have done)\b|করে ফেলেছি|করেছি|হয়ে গেছে|হয়ে গেছে|শেষ করেছি|জমা দিয়েছি|পাঠিয়েছি|पूरा किया|कर लिया|हो गया/i;
const futureCue=/\b(tomorrow|later|next|upcoming|remind|need to|must|have to|to be|schedule|by)\b|আগামীকাল|পরশু|পরে|করতে হবে|করা দরকার|করবো|করব|করতে চাই|মনে করিয়ে|करना है|करना होगा|कल|बाद में/i;
const taskIntent=/\b(remind me|todo|to-do|need to|must|have to|to be done|schedule|to be filled|to be submitted|to be sent|to be completed)\b|\bby\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+(?:today|tomorrow))?|মনে করিয়ে|করিয়ে দিও|করতে হবে|তে হবে|করা দরকার|করবো|করব|করতে চাই|करना है|करना होगा|याद दिलाना/i;
function money(t){const patterns=[/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/ig,/([\d,]+(?:\.\d{1,2})?)\s*(?:টাকা|রুপি|रुपये|rupees?|rs\.?)/ig];let out=[];for(const p of patterns)for(const m of t.matchAll(p))out.push(m[1].replace(/,/g,""));return out.at(-1)||""}
function financeInfo(t){
 let type="Expense";
 if(/transfer|transferred|from.+to|থেকে.+(?:fd|bank|account)|একাউন্ট.+থেকে|खाते.+से/i.test(t))type="Transfer";
 else if(/balance|আমার কাছে|কাছে আছে|bank.+আছে|cash.+আছে|ব্যালেন্স|शेष|balance is/i.test(t))type="Balance";
 else if(/loan|emi|credit card due|outstanding|ধার|ঋণ|कर्ज/i.test(t))type="Liability";
 else if(/\bfd\b|fixed deposit|\brd\b|\bnps\b|invest|investment|saving|সেভ|জমা করলাম|निवेश|बचत/i.test(t))type="Saving/Investment";
 else if(/salary|income|earned|earning|received|credited|বেতন|আয়|ইনকাম|পেয়েছি|कमाया|वेतन|आय/i.test(t))type="Income";
 let subcategory="";
 if(type==="Expense"){if(/breakfast|lunch|dinner|food|খাবার|খাওয়া/i.test(t))subcategory="Food";else if(/medicine|medical|doctor|hospital|ওষুধ/i.test(t))subcategory="Medical";else if(/travel|train|bus|taxi|uber|ola|petrol|diesel/i.test(t))subcategory="Travel";else if(/electric|mobile|internet|bill|recharge/i.test(t))subcategory="Bills";else if(/shopping|কিনেছি|purchase/i.test(t))subcategory="Shopping"}
 let account="";const a=t.match(/\b(sbi|hdfc|icici|axis|pnb|canara|union bank|bank of baroda|cash)\b/i);if(a)account=a[1];
 return{type,subcategory,account};
}
const bnDigits={"০":"0","১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9"};
function latinDigits(s){return s.replace(/[০-৯]/g,x=>bnDigits[x])}
function taskInfo(t){
 const now=new Date(),d=new Date(now),clean=latinDigits(t),s=clean.toLowerCase();let dueDate="";
 const fmt=x=>[x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-");
 if(/আজ|আজকে|today/.test(s))dueDate=fmt(d);
 else if(/আগামীকাল|কালকে|tomorrow/.test(s)){d.setDate(d.getDate()+1);dueDate=fmt(d)}
 else if(/পরশু|day after tomorrow/.test(s)){d.setDate(d.getDate()+2);dueDate=fmt(d)}
 const dm=clean.match(/(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:তারিখ|date)?(?:\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december))?/i);
 if(dm&&/(তারিখ|date|on\s+\d)/i.test(dm[0])){const months=["january","february","march","april","may","june","july","august","september","october","november","december"];const x=new Date(now);if(dm[2])x.setMonth(months.indexOf(dm[2].toLowerCase()));x.setDate(+dm[1]);if(!dm[2]&&x<now)x.setMonth(x.getMonth()+1);dueDate=fmt(x)}
 let dueTime="";
 const bnWords={"এক":1,"দুই":2,"তিন":3,"চার":4,"পাঁচ":5,"ছয়":6,"ছয়":6,"সাত":7,"আট":8,"নয়":9,"নয়":9,"দশ":10,"এগারো":11,"বারো":12};
 const wm=clean.match(/(এক|দুই|তিন|চার|পাঁচ|ছয়|ছয়|সাত|আট|নয়|নয়|দশ|এগারো|বারো)টার?/);
 if(wm){let h=bnWords[wm[1]],m=0;if(new RegExp("সাড়ে\\s*"+wm[1]).test(clean))m=30;else if(new RegExp("সোয়া\\s*"+wm[1]).test(clean))m=15;else if(new RegExp("পৌনে\\s*"+wm[1]).test(clean)){h=h-1||12;m=45}if(/বিকেল|সন্ধ্যা|সন্ধ্যে|রাত/.test(clean)&&h<12)h+=12;dueTime=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")}
 if(!dueTime){const tm=clean.match(/(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?|টা|টায়|টায়|am|pm)/i);if(tm){let h=+tm[1],m=+(tm[2]||0),p=(tm[3]||"").toLowerCase().replace(/[.\s]/g,"");if((p==="pm"||(/বিকেল|সন্ধ্যা|সন্ধ্যে|রাত/.test(t)&&h<12))&&h<12)h+=12;if(p==="am"&&h===12)h=0;dueTime=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")}}
 return{dueDate,dueTime,taskAction:t};
}
export function classify(text){
 const raw=text.trim(),t=normalizeSpeech(raw),l=t.toLowerCase();let category="Personal";
 if(finance.test(t))category="Finance";
 if(railway.test(t))category="Railway Work";
 // Future action wins over its domain: "কাল USFD report করতে হবে" is a Task, not a completed Railway entry.
 const isTask=taskIntent.test(t)&&(!completedIntent.test(t)||futureCue.test(t));
 if(isTask)category="Tasks";
 else if(category==="Personal"&&project.test(t))category="Projects";
 const km=t.match(kmRe),amount=category==="Finance"?money(t):"";
 const bn=/[\u0980-\u09FF]/.test(t),hi=/[\u0900-\u097F]/.test(t),en=/[A-Za-z]/.test(t);let language=bn?"বাংলা":hi?"हिंदी":"English";if((bn||hi)&&en)language="Mixed";
 let workType="";if(category==="Railway Work"){if(/usfd|gfb|ngfb|70\s*deg|obsr/i.test(t))workType="USFD";else if(/inspection/i.test(t))workType="Inspection";else if(/patrolling/i.test(t))workType="Patrolling"}
 const fi=category==="Finance"?financeInfo(t):{};const ti=category==="Tasks"?taskInfo(t):{};
 let context="";if(category==="Tasks"){if(railway.test(t))context="Railway Work";else if(project.test(t))context="KidShield";else if(finance.test(t))context="Finance";else if(/aden/i.test(t))context="ADEN Study"}
 return{original:raw,normalized:t,language,category,context,project:category==="Tasks"?context:"",amount,...fi,...ti,kmFrom:km?.[1]?.replace(/\s/g,"")||"",kmTo:km?.[2]?.replace(/\s/g,"")||"",workType,status:"New"};
}

export function splitAndClassify(text){
 const raw=text.trim();
 if(!raw)return[];
 // Split only on strong sentence/connective boundaries; keep raw wording in every child item.
 const parts=raw.split(/(?:[।.!?]+\s*|\s+(?:আর|এবং|তারপর|then|and then)\s+)/i).map(x=>x.trim()).filter(Boolean);
 const items=parts.map(x=>classify(x));
 // Avoid destructive over-splitting: if everything resolves to the same category, keep one original entry.
 const cats=new Set(items.map(x=>x.category));
 return cats.size>1?items:[classify(raw)];
}
