const GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/AKfycbzNZ-dqC4hIbvQQXZgNvPVd07hTgMqzqmgHXTe1fzllBMfaz6RbVeihl3Hgnq6Uw9yoAw/exec";

export async function POST(req){
  try{
    const body=await req.json();
    if(!body?.original||!body?.category)return Response.json({ok:false,error:"Invalid entry"},{status:400});
    const r=await fetch(GOOGLE_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body),redirect:"follow",cache:"no-store"});
    const text=await r.text();
    let data;try{data=JSON.parse(text)}catch{data={ok:false,error:"Invalid response from Google bridge"}}
    if(!r.ok||!data.ok)return Response.json({ok:false,error:data.error||"Google Drive save failed"},{status:502});
    return Response.json(data);
  }catch(error){return Response.json({ok:false,error:"Google Drive bridge unavailable"},{status:502})}
}
