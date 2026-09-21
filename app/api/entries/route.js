const URL=process.env.SUPABASE_URL;
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req){
  if(!URL||!KEY)return Response.json({error:"Cloud sync is not configured yet"},{status:503});
  const body=await req.json();
  if(!body?.original||!body?.category)return Response.json({error:"Invalid entry"},{status:400});
  const row={
    original_entry:String(body.original).slice(0,50000),language:body.language||"Mixed",category:body.category,
    amount:body.amount?Number(body.amount):null,km_from:body.kmFrom||null,km_to:body.kmTo||null,
    status:body.status||"New",source:"web",sync_status:"Cloud"
  };
  const res=await fetch(URL+"/rest/v1/brain_entries",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+KEY,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(row)});
  const data=await res.json().catch(()=>null);
  if(!res.ok)return Response.json({error:"Cloud save failed",detail:data},{status:502});
  return Response.json({ok:true,id:data?.[0]?.id||null});
}
