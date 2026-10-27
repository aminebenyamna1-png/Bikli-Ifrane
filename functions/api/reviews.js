export async function onRequestGet({env}) {
 if (!env.DB) return Response.json({error:'Service unavailable'},{status:503});
 try { const r=await env.DB.prepare('SELECT name, comment, rating, created_at FROM reviews ORDER BY id DESC LIMIT 50').all(); return Response.json(r.results,{headers:{'Cache-Control':'no-store'}}); } catch {return Response.json({error:'Service unavailable'},{status:503})}
}

export async function onRequestPost({request,env}) {
 if(!env.DB) return Response.json({error:'Service unavailable'},{status:503});
 if(request.headers.get('origin')!==new URL(request.url).origin) return Response.json({error:'Invalid origin'},{status:403});
 if(Number(request.headers.get('content-length')||0)>4096) return Response.json({error:'Too large'},{status:413});
 let data;try{data=await request.json()}catch{return Response.json({error:'Invalid data'},{status:400})}
 const name=typeof data.name==='string'?data.name.trim():'';const comment=typeof data.comment==='string'?data.comment.trim():'';const rating=Number(data.rating);
 if(!name||name.length>60||!comment||comment.length>500||!Number.isInteger(rating)||rating<1||rating>5)return Response.json({error:'Invalid data'},{status:400});
 try{await env.DB.prepare('INSERT INTO reviews (name, comment, rating, created_at) VALUES (?, ?, ?, ?)').bind(name,comment,rating,Date.now()).run();return Response.json({ok:true},{status:201})}catch{return Response.json({error:'Service unavailable'},{status:503})}
}
