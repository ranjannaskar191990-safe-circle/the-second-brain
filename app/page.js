"use client";
import{useEffect,useRef,useState}from"react";import{classify,splitAndClassify}from"../lib/classify";
const KEY="second-brain-queue";
export default function Home(){
 const[text,setText]=useState("");const[preview,setPreview]=useState(null);const[multi,setMulti]=useState([]);const[msg,setMsg]=useState("");const[queue,setQueue]=useState([]);const[busy,setBusy]=useState(false);const[listening,setListening]=useState(false);const[lang,setLang]=useState("auto");const[voiceSeconds,setVoiceSeconds]=useState(0);const rec=useRef(null);const voiceActive=useRef(false);const voiceFinal=useRef("");
 useEffect(()=>{try{setQueue(JSON.parse(localStorage.getItem(KEY)||"[]"))}catch{setQueue([])}},[]);useEffect(()=>{if(!listening){setVoiceSeconds(0);return}const id=setInterval(()=>setVoiceSeconds(v=>v+1),1000);return()=>clearInterval(id)},[listening]);
 function persist(q){setQueue(q);localStorage.setItem(KEY,JSON.stringify(q))}
 function addPending(item){persist([{...item,localId:item.localId||crypto.randomUUID(),syncStatus:"Pending"},...queue])}
 function resolveEntryDate(raw){
 const now=new Date(),d=new Date(now),s=raw.toLowerCase();
 // Entry Date is when the activity happened. Future task deadlines must never change it.
 if(/গতকাল|yesterday|कल/.test(s))d.setDate(d.getDate()-1);
 else if(/day before yesterday/.test(s))d.setDate(d.getDate()-2);
 else{
  // Only explicit past-date wording may back-date the activity.
  const m=raw.match(/(?:on|dated|তারিখ|date)\s*(\d{1,2})(?:st|nd|rd|th)?/i);
  if(m){const day=+m[1];if(day>=1&&day<=31){d.setDate(day);if(d>now)d.setMonth(d.getMonth()-1)}}
 }
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
 }
 function organize(){if(!text.trim()){setMsg("আগে কিছু বলুন, লিখুন বা upload করুন।");return}const parts=splitAndClassify(text.trim());if(parts.length>1){setMulti(parts.map(x=>({...x,entryDate:resolveEntryDate(x.original)})));setPreview(null);setMsg(parts.length+"টি আলাদা entry বুঝেছি। নিচে দেখে save করুন।")}else{setMulti([]);setPreview({...parts[0],entryDate:resolveEntryDate(text.trim())});setMsg("")}}
 async function send(item){const r=await fetch("/api/entries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.error||"Save failed");return d}
 async function saveMulti(){if(!multi.length||busy)return;setBusy(true);let done=0;const failed=[];for(const x of multi){const capturedAt=new Date().toISOString();const item={...x,timestamp:capturedAt,capturedAt,entryDate:x.entryDate||capturedAt.slice(0,10),localId:crypto.randomUUID()};try{await send(item);done++}catch{failed.push(item)}}setBusy(false);setMulti([]);setText("");if(failed.length){failed.forEach(addPending);setMsg(done+"টি save হয়েছে, "+failed.length+"টি Pending রাখা হয়েছে।")}else setMsg("✓ "+done+"টি organized entry Google Drive-এ save হয়েছে।")}
 async function save(){if(!preview||busy)return;setBusy(true);const capturedAt=new Date().toISOString();const item={...preview,timestamp:capturedAt,capturedAt,entryDate:preview.entryDate||capturedAt.slice(0,10),localId:crypto.randomUUID()};try{await send(item);setMsg("✓ Google Drive-এ save হয়েছে।")}catch{addPending(item);setMsg("Google Drive-এ নিশ্চিত করা যায়নি—entry ফোনে Pending হিসেবে রাখা হয়েছে।")}finally{setBusy(false);setText("");setPreview(null)}}
 async function sync(){if(!queue.length||busy)return;setBusy(true);setMsg("Pending entry sync হচ্ছে…");const left=[];let done=0;for(const item of queue){try{await send(item);done++}catch{left.push(item)}}persist(left);setBusy(false);setMsg(done+(done===1?"টি":"টি")+" sync হয়েছে। "+(left.length?left.length+"টি এখনও Pending।":"সব Pending entry শেষ।"))}
 function speak(){
  if(listening){voiceActive.current=false;rec.current?.stop();return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setMsg("এই browser-এ voice recognition support নেই। Android Chrome ব্যবহার করুন।");return}
  voiceActive.current=true;voiceFinal.current=text.trim();
  const start=()=>{
   if(!voiceActive.current)return;
   const r=new SR();rec.current=r;
   // Browser speech recognition has no true multilingual-auto flag.
   // bn-IN is the best base for Bengali speech while preserving many English terms.
   r.lang=lang==="auto"?"bn-IN":lang;r.interimResults=true;r.continuous=true;r.maxAlternatives=5;
   r.onstart=()=>{setListening(true);setMsg("শুনছি… কথা শেষ না হওয়া পর্যন্ত Stop চাপবেন না।")};
   r.onresult=e=>{
    let interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){
     const alts=Array.from(e.results[i]);const score=a=>{const z=a.transcript;return (/[A-Za-z]{2,}/.test(z)?2:0)+(/\d/.test(z)?1:0)+(a.confidence||0)};alts.sort((a,b)=>score(b)-score(a));const x=alts[0].transcript.trim();
     if(e.results[i].isFinal){const prev=voiceFinal.current.trim();if(x&&!prev.toLowerCase().endsWith(x.toLowerCase()))voiceFinal.current=(prev+" "+x).trim()}else interim=x;
    }
    setText((voiceFinal.current+" "+interim).trim());setPreview(null);
   };
   r.onspeechend=()=>setMsg("কথা শেষ হয়েছে মনে হচ্ছে… আরও বললে শুনতে থাকব।");r.onerror=e=>{
    if(e.error==="not-allowed"){voiceActive.current=false;setListening(false);setMsg("Microphone permission Allow করুন।")}
    else if(!["no-speech","aborted"].includes(e.error)){setMsg("Voice recognition সাময়িকভাবে থেমেছে—আবার শুনছি…")}
   };
   r.onend=()=>{
    setListening(false);
    if(voiceActive.current){setTimeout(()=>{try{start()}catch{}},250)}
    else if(voiceFinal.current.trim())setMsg("পুরো transcript দেখে ঠিক থাকলে Organize চাপুন।");
   };
   try{r.start()}catch{voiceActive.current=false;setListening(false)}
  };
  start();
 }
 async function upload(e){const f=e.target.files?.[0];if(!f)return;if(!/\.(txt|csv|json)$/i.test(f.name)){setMsg("এই মুহূর্তে TXT/CSV/JSON পড়তে পারছি। PDF/Word/Excel/Image support পরের upgrade-এ আসছে।");return}const v=(await f.text()).slice(0,10000);setText(v);setPreview(null);setMsg(f.name+" loaded — লেখাটি দেখে Organize চাপুন।")}
 return <main className="shell"><header><div className="brand">🧠</div><div><h1>The Second Brain</h1><p>বলুন, লিখুন বা upload করুন</p></div><span className={"badge "+(queue.length?"warn":"")}>{queue.length?queue.length+" Pending":"Drive ready"}</span></header>
 <a className="diaryButton" href="/finance"><span>💰</span><div><b>My Finance</b><small>income • expense • balance • savings</small></div><strong>›</strong></a><a className="diaryButton" href="/schedule"><span>📅</span><div><b>My Schedule</b><small>pending • today • upcoming • completed • tasks</small></div><strong>›</strong></a><a className="diaryButton" href="/diary"><span>📖</span><div><b>My Diary</b><small>সব saved entry • organized & searchable</small></div><strong>›</strong></a><section className="hero card"><div className="mode"><button className={listening?"active":""} onClick={speak}><span>{listening?"⏹":"🎤"}</span>{listening?"Stop":"Speak"}</button><button onClick={()=>document.getElementById("braintext")?.focus()}><span>✍️</span>Write</button><label><span>📎</span>Upload<input type="file" onChange={upload}/></label></div>
 <div className="lang"><span>Voice</span><select value={lang} onChange={e=>setLang(e.target.value)}><option value="auto">Auto • বাংলা + English + हिंदी</option><option value="bn-IN">বাংলা</option><option value="en-IN">English</option><option value="hi-IN">हिंदी</option></select></div>
 {listening&&<div className="listening"><i/>Listening… {Math.floor(voiceSeconds/60)}:{String(voiceSeconds%60).padStart(2,"0")} • যতক্ষণ দরকার বলুন</div>}
 <div className="voiceHint">🎙️ Voice-first • Mixed বাংলা/English/Hindi • transcript edit করা যাবে</div><textarea id="braintext" value={text} onChange={e=>{setText(e.target.value);setPreview(null)}} placeholder="আপনার কথা এখানে দেখা যাবে। ভুল থাকলে save করার আগে ঠিক করে নিন…"/>
 <button className="primary" onClick={organize} disabled={!text.trim()}>✨ Organize & Preview</button>{msg&&<div className="notice">{msg}</div>}</section>
 {multi.length>1&&<section className="card review"><div className="sectionTitle"><div><small>MULTI-INTENT</small><h2>{multi.length}টি আলাদা entry</h2></div><button className="edit" onClick={()=>setMulti([])}>Edit</button></div>{multi.map((x,i)=><div className="multiEntry" key={i}><div className="raw">{x.original}</div>{x.normalized&&x.normalized!==x.original&&<div className="understood"><small>UNDERSTOOD</small><div>{x.normalized}</div></div>}<div className="chips"><span>{x.category}</span>{x.amount&&<span>₹{x.amount}</span>}{x.dueDate&&<span>Due {x.dueDate}</span>}{x.dueTime&&<span>{x.dueTime}</span>}</div></div>)}<button className="primary save" disabled={busy} onClick={saveMulti}>{busy?"Saving…":"✓ Confirm & Save All"}</button></section>}{preview&&<section className="card review"><div className="sectionTitle"><div><small>STEP 2</small><h2>Save করার আগে দেখুন</h2></div><button className="edit" onClick={()=>{setPreview(null);document.getElementById("braintext")?.focus()}}>Edit</button></div><div className="raw">{preview.original}</div>{preview.normalized&&preview.normalized!==preview.original&&<div className="understood"><small>ASSISTANT UNDERSTOOD</small><div>{preview.normalized}</div></div>}<label className="entryDate">📅 Entry Date<input type="date" value={preview.entryDate||""} onChange={e=>setPreview({...preview,entryDate:e.target.value})}/></label>{preview.category==="Tasks"&&<div className="taskDue"><label>Due Date<input type="date" value={preview.dueDate||""} onChange={e=>setPreview({...preview,dueDate:e.target.value})}/></label><label>Time<input type="time" value={preview.dueTime||""} onChange={e=>setPreview({...preview,dueTime:e.target.value})}/></label></div>}<div className="chips"><span>{preview.category}</span><span>{preview.language}</span>{preview.amount&&<span>₹{preview.amount}</span>}{preview.category==="Finance"&&preview.type&&<span>{preview.type}</span>}{preview.category==="Finance"&&preview.subcategory&&<span>{preview.subcategory}</span>}{preview.category==="Finance"&&preview.account&&<span>{preview.account}</span>}{preview.kmFrom&&<span>KM {preview.kmFrom} → {preview.kmTo}</span>}<span>{preview.status}</span></div><button className="primary save" disabled={busy} onClick={save}>{busy?"Saving…":"✓ Confirm & Save to Google Drive"}</button></section>}
 <section className="card sync"><div><small>SAFETY BACKUP</small><h2>Pending Sync</h2><p>{queue.length?queue.length+"টি entry এই ফোনে নিরাপদে আছে।":"কোনো pending entry নেই।"}</p></div>{queue.length>0&&<button onClick={sync} disabled={busy}>↻ {busy?"Syncing…":"Sync now"}</button>}</section>
 <p className="foot">Original text সবসময় রাখা হবে • Confirm না করলে Drive-এ save হবে না</p></main>
}