(function(){
const SEP="\u2063";
const _f=(c,x)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${x}</svg>`;
(function(){const d=document.createElement("div");d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
d.innerHTML=`<svg width="0" height="0" aria-hidden="true"><defs>
<linearGradient id="rgHeart" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8FA0"/><stop offset=".45" stop-color="#FF3D5F"/><stop offset="1" stop-color="#D1103A"/></linearGradient>
<linearGradient id="rgGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE98A"/><stop offset="1" stop-color="#FFB914"/></linearGradient>
<linearGradient id="rgGoldD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC93C"/><stop offset="1" stop-color="#E07F00"/></linearGradient>
<radialGradient id="rgFace" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFF0A0"/><stop offset=".55" stop-color="#FFCA3A"/><stop offset="1" stop-color="#F29A00"/></radialGradient>
<linearGradient id="rgFireO" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF3B30"/><stop offset=".6" stop-color="#FF7A1A"/><stop offset="1" stop-color="#FFB02E"/></linearGradient>
<linearGradient id="rgFireI" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFB400"/><stop offset="1" stop-color="#FFF08A"/></linearGradient>
<linearGradient id="rgDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9ECFF"/><stop offset="1" stop-color="#2F9BFF"/></linearGradient>
<linearGradient id="rgCone" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF8A00"/><stop offset="1" stop-color="#FFD54A"/></linearGradient>
<linearGradient id="rgStar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF28A"/><stop offset="1" stop-color="#FFB000"/></linearGradient>
<linearGradient id="rgSkull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#BFC4DD"/></linearGradient>
</defs></svg>`;document.body.appendChild(d)})();
const _face=(inner)=>`<circle cx="12" cy="12" r="9.8" fill="url(#rgFace)"/><circle cx="12" cy="12" r="9.8" fill="none" stroke="#D98200" stroke-opacity=".35" stroke-width=".7"/><ellipse cx="8.600" cy="5.800" rx="4.200" ry="2" transform="rotate(-25 8.600 5.800)" fill="#fff" fill-opacity=".38"/>${inner}`;
const _B="#4F2A00";
const RI={
 heart:_f(0,'<path d="M12 21.600S2.400 15.900 2.400 8.900C2.400 5.600 4.900 3.400 7.700 3.400c1.800 0 3.400 1 4.300 2.600.9-1.600 2.500-2.600 4.300-2.600 2.800 0 5.300 2.200 5.300 5.500 0 7-9.600 12.700-9.600 12.700z" fill="url(#rgHeart)"/><ellipse cx="7.200" cy="7.600" rx="2.700" ry="1.500" transform="rotate(-38 7.200 7.600)" fill="#fff" fill-opacity=".55"/>'),
 like:_f(0,'<path d="M7 9.800l4.400-8c.3-.5.800-.8 1.400-.8 1.100 0 1.900 1 1.700 2.100L13.700 8.600h6.500c1.400 0 2.400 1.300 2.100 2.700l-1.600 7.100c-.2 1-1.100 1.700-2.100 1.700H9c-1 0-2-.9-2-2z" fill="url(#rgGold)"/><path d="M1.300 10.200c0-.6.500-1.100 1.100-1.100h3.400c.5 0 .9.400.9.900v10.200c0 .5-.4.900-.9.900H2.400c-.6 0-1.100-.5-1.100-1.100z" fill="url(#rgGoldD)"/><path d="M9.300 9.800l3.600-6.300" stroke="#fff" stroke-opacity=".55" stroke-width="1.200" stroke-linecap="round" fill="none"/>'),
 dislike:_f(0,'<g transform="rotate(180 12 11.500)"><path d="M7 9.800l4.400-8c.3-.5.800-.8 1.400-.8 1.100 0 1.900 1 1.700 2.100L13.700 8.600h6.500c1.400 0 2.400 1.300 2.100 2.700l-1.600 7.100c-.2 1-1.100 1.700-2.100 1.700H9c-1 0-2-.9-2-2z" fill="url(#rgGold)"/><path d="M1.300 10.200c0-.6.500-1.100 1.100-1.100h3.400c.5 0 .9.400.9.900v10.200c0 .5-.4.900-.9.900H2.400c-.6 0-1.100-.5-1.100-1.100z" fill="url(#rgGoldD)"/></g>'),
 fire:_f(0,'<path d="M12.500 1.600c.7 3.300 2.700 4.900 4.300 7.200 1.500 2 2.200 4 2.200 6 0 3.900-3.100 7.200-7 7.200s-7-3.300-7-7.200c0-2.200 1-4 2.200-5.400.3 1.600 1.100 2.600 2.100 3C9 8 10.400 4 12.500 1.600z" fill="url(#rgFireO)"/><path d="M12 22.100c-2.100 0-3.800-1.700-3.800-3.800 0-1.800 1.200-2.800 2.100-4.600.6 1 1.100 1.600 1.700 1.800.3-.6.500-1.200.4-2 1.600 1.200 3.400 2.800 3.400 4.800 0 2.100-1.700 3.800-3.800 3.800z" fill="url(#rgFireI)"/>'),
 laugh:_f(0,_face(`<path d="M5.700 9.700Q7.500 7.300 9.300 9.700M14.700 9.700Q16.500 7.300 18.300 9.700" fill="none" stroke="${_B}" stroke-width="1.800" stroke-linecap="round"/><path d="M5.900 12.700h12.200c0 3.400-2.700 5.900-6.100 5.900s-6.100-2.500-6.100-5.900z" fill="#6B1E0A"/><path d="M6.400 12.700h11.200c-.1.900-.3 1.400-.7 1.700H7.100c-.4-.3-.6-.8-.7-1.700z" fill="#fff"/><path d="M8.700 17.100c.7-1.500 1.900-2.200 3.300-2.200s2.600.7 3.300 2.200c-.9.900-2 1.500-3.300 1.500s-2.400-.6-3.300-1.500z" fill="#FF6F7F"/><path d="M2.700 8.500c-1.200 1.700-1.200 2.900-.3 3.500.9-.6 1.100-1.800.3-3.500zM21.300 8.500c1.200 1.700 1.200 2.900.3 3.500-.9-.6-1.100-1.800-.3-3.500z" fill="url(#rgDrop)"/>`)),
 wow:_f(0,_face(`<ellipse cx="8.500" cy="10" rx="2" ry="2.500" fill="#fff"/><ellipse cx="15.500" cy="10" rx="2" ry="2.500" fill="#fff"/><circle cx="8.700" cy="10.300" r="1.150" fill="${_B}"/><circle cx="15.300" cy="10.300" r="1.150" fill="${_B}"/><path d="M6 6.300q2.200-1.700 4.300-.4M18 6.300q-2.200-1.700-4.300-.4" fill="none" stroke="${_B}" stroke-width="1.400" stroke-linecap="round"/><ellipse cx="12" cy="16.800" rx="2.300" ry="2.900" fill="#6B1E0A"/><ellipse cx="12" cy="18.200" rx="1.400" ry="1" fill="#FF6F7F"/>`)),
 cry:_f(0,_face(`<circle cx="8.300" cy="10" r="1.600" fill="${_B}"/><circle cx="15.700" cy="10" r="1.600" fill="${_B}"/><circle cx="8.800" cy="9.500" r=".5" fill="#fff"/><circle cx="16.200" cy="9.500" r=".5" fill="#fff"/><path d="M5.900 7.700L9.900 6.600M18.100 7.700L14.100 6.600" fill="none" stroke="${_B}" stroke-width="1.400" stroke-linecap="round"/><path d="M8.300 17.300Q12 13.700 15.700 17.300" fill="none" stroke="${_B}" stroke-width="1.700" stroke-linecap="round"/><path d="M6.700 12c-1.300 1.800-1.300 3.100 0 3.800 1.300-.7 1.300-2 0-3.800z" fill="url(#rgDrop)"/>`)),
 party:_f(0,'<path d="M2.600 21.400L7.400 7.400l9.200 9.200z" fill="url(#rgCone)" stroke="url(#rgCone)" stroke-width="1.200" stroke-linejoin="round"/><path d="M4.900 14.700l4.400 4.400M3.800 18l2.200 2.200" stroke="#fff" stroke-opacity=".5" stroke-width="1.200" stroke-linecap="round"/><ellipse cx="12" cy="12" rx="6.300" ry="1.700" transform="rotate(45 12 12)" fill="#D46F00"/><circle cx="15.800" cy="4.400" r="1.400" fill="#FF3D6B"/><circle cx="20.400" cy="10.200" r="1.300" fill="#35D0FF"/><circle cx="9.800" cy="3.300" r="1" fill="#7CE23B"/><rect x="18.600" y="3.800" width="3.200" height="1.600" rx=".8" transform="rotate(40 20.200 4.600)" fill="#A56BFF"/><rect x="12.100" y="1.600" width="3" height="1.500" rx=".75" transform="rotate(-35 13.600 2.400)" fill="#FFE04A"/><path d="M14.600 9.600c2.400-1.800 3.900-1 5-2.600" fill="none" stroke="#FF3D6B" stroke-width="1.100" stroke-linecap="round"/><path d="M11.600 7.400c.8-1.700 2.200-1.600 2.500-3.200" fill="none" stroke="#35D0FF" stroke-width="1.100" stroke-linecap="round"/>'),
 star:_f(0,'<path d="M12 3l2.800 5.800 6.300.9-4.600 4.500 1.100 6.300L12 17.400l-5.600 3.100 1.100-6.300L2.900 9.700l6.300-.9z" fill="url(#rgStar)" stroke="#FFC21A" stroke-width="1.800" stroke-linejoin="round"/><path d="M8.700 9.700L12 5.600" stroke="#fff" stroke-opacity=".6" stroke-width="1.300" stroke-linecap="round"/>'),
 skull:_f(0,'<path d="M12 2.400c-5 0-8.800 3.500-8.800 8.100 0 2.800 1.400 4.800 3.400 6v3c0 1 .8 1.800 1.800 1.800h7.200c1 0 1.800-.8 1.800-1.800v-3c2-1.200 3.400-3.200 3.400-6 0-4.600-3.800-8.100-8.800-8.100z" fill="url(#rgSkull)"/><ellipse cx="8.500" cy="11.200" rx="2.500" ry="2.800" fill="#262736"/><ellipse cx="15.500" cy="11.200" rx="2.500" ry="2.800" fill="#262736"/><path d="M12 14.100l-1.200 2h2.400z" fill="#262736"/><path d="M9.600 18v3.200M12 18v3.200M14.400 18v3.200" stroke="#7B7F99" stroke-width="1" stroke-linecap="round"/><ellipse cx="7.500" cy="6.200" rx="2.600" ry="1.200" transform="rotate(-25 7.500 6.200)" fill="#fff" fill-opacity=".8"/>')
};
const RKEYS=Object.keys(RI);
const R_OLD={"❤️":"heart","❤":"heart","👍":"like","👎":"dislike","🔥":"fire","😂":"laugh","😮":"wow","😢":"cry","🎉":"party","🤝":"star","💀":"skull"};
const rkey=v=>RI[v]?v:(R_OLD[v]||"heart");
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v);return true}catch(e){return v===undefined?null:false}};
const peerName=()=>__chatPeer?__chatPeer.nickname:"Собеседник";

/* --- разбор ответа, зашитого в текст --- */
window.chatParse=function(t){t=String(t||"");if(t[0]!==SEP)return{body:t};const p=t.split(SEP);if(p.length<5)return{body:t.split(SEP).join("")};return{fl:p[1],id:+p[2],snip:p[3],body:p.slice(4).join(SEP)}};
window.chatPlain=t=>chatParse(t).body;

/* --- реакции (хранятся на устройстве) --- */
const rmap=()=>{try{return JSON.parse(ls("amg_reacts")||"{}")}catch(e){return{}}};
const getReact=id=>{const v=(rmap()[__chatPid]||{})[id];return v?rkey(v):""};
function setReact(id,e){const M=rmap();M[__chatPid]=M[__chatPid]||{};e?M[__chatPid][id]=e:delete M[__chatPid][id];ls("amg_reacts",JSON.stringify(M))}
const dblEmoji=()=>rkey(ls("amg_dbl_react")||"heart");

chatMsgHTML=function(m,first,last){
  const cls=(m.mine?"out":"in")+(first?" first":"")+(last?" last":""), p=chatParse(m.text);
  let q="";
  if(p.fl){const me=p.fl==="s"?!!m.mine:!m.mine;q=`<div class="tg-quote" data-q="${p.id}"><div class="tg-qn">${me?"Вы":esc(peerName())}</div>${esc(p.snip)}</div>`}
  const r=getReact(m.id), tm=`<span class="tg-time">${fmtTime(m.at)}${m.mine?(chatIsRead(m)?TG_TICK2:TG_TICK):""}</span>`;
  const me=state.profile||{};
  const foot=r?`<div class="tg-foot"><span class="tg-react">${RI[r]}<span class="rav">${avatarHTML(me.photo,me.nickname)}</span></span>${tm}</div>`:tm;
  return `<div class="tg-msg ${cls}" data-id="${m.id}">${q}${esc(p.body)}${foot}</div>`;
};
function rerender(){const b=gid("chatMsgs"),s=b.scrollTop;chatRender();b.scrollTop=s}
function popEmoji(e,x,y){const d=document.createElement("div");d.className="tg-pop";d.innerHTML=RI[e];d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);setTimeout(()=>d.remove(),800)}
function patchMsg(el,id,kind){
  const m=__chatMsgs.find(z=>z.id===id);if(!m||!el.isConnected)return;
  const t=document.createElement("div");
  t.innerHTML=chatMsgHTML(m,el.classList.contains("first"),el.classList.contains("last"));
  const n=t.firstChild;
  if(kind==="new"){const f=n.querySelector(".tg-foot");f&&f.classList.add("new")}
  if(kind==="swap"){const p=n.querySelector(".tg-react");p&&p.classList.add("swap")}
  el.innerHTML=n.innerHTML;
}
function doubleTapReact(el,x,y){
  const id=+el.dataset.id,e=dblEmoji(),cur=getReact(id),box=gid("chatMsgs");
  const stick=box.scrollHeight-box.scrollTop-box.clientHeight<6;
  const foot=el.querySelector(".tg-foot");
  if(cur===e){
    setReact(id,"");
    if(foot){foot.classList.add("leaving");setTimeout(()=>patchMsg(el,id),270)}
  }else{
    setReact(id,e);popEmoji(e,x,y);
    patchMsg(el,id,foot?"swap":"new");
  }
  if(stick){const t0=performance.now();(function f(){box.scrollTop=box.scrollHeight;if(performance.now()-t0<400)requestAnimationFrame(f)})()}
  if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}
}

/* --- ответ на сообщение --- */
let reply=null;
window.chatClearReply=function(){reply=null;gid("chatReplyBar").hidden=true};
function setReply(id){
  const m=__chatMsgs.find(x=>x.id===id);if(!m||gid("chatCompose").style.display==="none")return;
  reply={id:m.id,mine:!!m.mine,snip:chatParse(m.text).body.replace(/\s+/g," ").split(SEP).join("").slice(0,40)};
  gid("chatReplyTxt").innerHTML=`<b>${m.mine?"Вы":esc(peerName())}</b>${esc(reply.snip)}`;
  gid("chatReplyBar").hidden=false;gid("chatInput").focus();
  if(navigator.vibrate)try{navigator.vibrate(10)}catch(_){}
}
const _send=chatSend;
chatSend=async function(){
  const inp=gid("chatInput"),raw=inp.value;
  if(!reply||!raw.trim())return _send();
  const h=SEP+(reply.mine?"s":"r")+SEP+reply.id+SEP+reply.snip+SEP;
  inp.value=h+raw.trim().slice(0,500-h.length);
  await _send();
  if(inp.value)inp.value=raw;else chatClearReply();
  chatInputSync();
};
document.addEventListener("click",e=>{const q=e.target.closest&&e.target.closest(".tg-quote");if(!q)return;
  const t=gid("chatMsgs").querySelector(`.tg-msg[data-id="${q.dataset.q}"]`);if(t){t.scrollIntoView({block:"center",behavior:"smooth"});t.classList.remove("flash");void t.offsetWidth;t.classList.add("flash")}});

/* --- жесты: двойной тап, свайп влево = ответ, свайп вправо = закрыть --- */
(function(){
  const ov=gid("chatOverlay"),ico=document.createElement("div");
  ico.className="tg-swipe-ic";ico.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/></svg>';
  document.body.appendChild(ico);
  let g=null,last={id:0,t:0};
  const msgAt=(x,y,t)=>{
    if(!t||!t.closest||!t.closest("#chatMsgs"))return null;
    const list=[...gid("chatMsgs").querySelectorAll(".tg-msg[data-id]")];
    for(let i=0;i<list.length;i++){
      const r=list[i].getBoundingClientRect(),pv=list[i-1],nx=list[i+1];
      const up=pv?Math.min(10,(r.top-pv.getBoundingClientRect().bottom)/2):6;
      const dn=nx?Math.min(10,(nx.getBoundingClientRect().top-r.bottom)/2):6;
      if(y>=r.top-Math.max(up,0)&&y<=r.bottom+Math.max(dn,0))return list[i];
    }
    return null};
  window.__msgAt=msgAt;
  const reset=()=>{if(g&&g.msg){g.msg.style.transition="transform .2s";g.msg.style.transform="";}ico.style.opacity=0;g=null};
  ov.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;if(e.target.closest&&e.target.closest("textarea,input"))return;
    g={x:e.clientX,y:e.clientY,t:Date.now(),msg:msgAt(e.clientX,e.clientY,e.target),mode:null,dx:0,moved:false};if(g.msg)g.msg.style.transition="none"});
  ov.addEventListener("pointermove",e=>{if(!g)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(Math.abs(dx)>8||Math.abs(dy)>8)g.moved=true;
    if(!g.mode){
      if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){g.mode="v";return}
      if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.3){
        if(dx>0){g.mode="close";if(gid("chatsOverlay").hidden){g.opened=true;openChats()}}
        else if(g.msg&&g.msg.dataset.id){g.mode="reply";g.dir=-1;const r=g.msg.getBoundingClientRect();
          ico.style.top=(r.top+r.height/2-17)+"px";ico.style.right="14px";ico.style.left="auto"}
        else{g=null;return}
        try{ov.setPointerCapture(e.pointerId)}catch(_){}
      }else return;
    }
    g.dx=dx;
    if(g.mode==="reply"){const mv=Math.max(0,dx*g.dir),x=g.dir*Math.min(90,mv*.85);g.msg.style.transform=`translateX(${x}px)`;
      const p=Math.min(1,Math.abs(x)/60);ico.style.opacity=p;ico.style.transform=`scale(${.4+.6*p})`}
    else if(g.mode==="close"){const x=Math.max(0,dx);ov.classList.add("dragging");ov.style.transform=`translateX(${x}px)`;ov.style.opacity=1-Math.min(.5,x/(innerWidth*1.2))}
  });
  ov.addEventListener("pointerup",e=>{if(!g)return;const m=g.mode,dx=g.dx;
    if(m==="reply"){const id=+g.msg.dataset.id;const go=g.dir*dx>60;reset();if(go)setReply(id);return}
    if(m==="close"){ov.classList.remove("dragging");
      if(dx>90||(dx>40&&dx/(Date.now()-g.t+1)>.6)){ov.style.transition="transform .2s ease-out, opacity .2s";ov.style.transform="translateX(100%)";ov.style.opacity=0;
        setTimeout(()=>{ov.style.transition="";ov.style.transform="";ov.style.opacity="";closeChat()},200)}
      else{ov.style.transition="transform .2s, opacity .2s";ov.style.transform="";ov.style.opacity="";setTimeout(()=>ov.style.transition="",220);
        if(g.opened)setTimeout(()=>{gid("chatsOverlay").hidden=true},220)}
      g=null;return}
    const tap=!g.moved&&Date.now()-g.t<300,msg=g.msg;g=null;
    if(tap&&msg&&msg.dataset.id){const id=+msg.dataset.id,now=Date.now();
      if(last.id===id&&now-last.t<320){last={id:0,t:0};doubleTapReact(msg,e.clientX,e.clientY)}else last={id,t:now}}
  });
  ov.addEventListener("pointercancel",()=>{if(g&&g.mode==="close"){ov.classList.remove("dragging");ov.style.transform="";ov.style.opacity="";if(g.opened)gid("chatsOverlay").hidden=true}reset()});
  ov.addEventListener("dblclick",e=>{const m=window.__msgAt(e.clientX,e.clientY,e.target);if(m&&m.dataset.id&&e.pointerType==="mouse")doubleTapReact(m,e.clientX,e.clientY)});
})();

/* --- обои --- */
const wpGet=t=>ls("amg_wp_"+t)||"";
window.applyChatWp=function(){const b=gid("chatMsgs"),w=(__chatPid&&wpGet(__chatPid))||wpGet("*");
  if(!w){b.style.background="";return}
  const d=(+(ls("amg_wp_dim")??25))/100;
  b.style.background=`linear-gradient(rgba(0,0,0,${d}),rgba(0,0,0,${d})),url("${w}") center/cover no-repeat`};
window.wpRefresh=function(){applyChatWp();document.querySelectorAll(".wp-prev").forEach(el=>{const t=el.dataset.t,w=wpGet(t);
  el.style.backgroundImage=w?`url("${w}")`:"";el.textContent=w?"":(t==="*"?"Не выбраны":"Как в общих настройках")})};
let wpT="";
window.pickWp=t=>{wpT=t;const f=gid("wpFile");f.value="";f.click()};
window.clearWp=t=>{ls("amg_wp_"+t,null);wpRefresh()};
gid("wpFile").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;
  const url=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{const s=Math.min(1,1000/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(url);
    if(ls("amg_wp_"+wpT,c.toDataURL("image/jpeg",.72))===false)alert("Не удалось сохранить обои: не хватает места");
    wpRefresh()};
  img.onerror=()=>URL.revokeObjectURL(url);img.src=url});

/* --- профиль собеседника поверх чата, с анимацией; обои чата --- */
const _uah=userActionsHTML;
userActionsHTML=function(u){const base=_uah(u);if(u.isMe)return base;const p=esc(u.publicId);
  return base+`<div class="up-actions"><div class="pg-sub">Обои этого чата</div><div class="wp-prev" data-t="${p}"></div>
  <div class="up-two"><button class="ghost-btn" onclick="pickWp('${p}')">Из галереи</button><button class="ghost-btn" onclick="clearWp('${p}')">Сбросить</button></div></div>`};
const _oup=openUserProfile;
openUserProfile=async function(pid,silent){const r=await _oup(pid,silent);wpRefresh();return r};
chatOpenPeerProfile=function(){if(!__chatPeer)return;const ov=gid("userOverlay");ov.classList.remove("anim");void ov.offsetWidth;ov.classList.add("over","anim");openUserProfile(__chatPeer.publicId)};
const _cup=closeUserProfile;
closeUserProfile=function(){_cup();const ov=gid("userOverlay");ov.classList.remove("over","anim");applyChatWp()};
const _oc=openChat;
openChat=function(pid){chatClearReply();const r=_oc(pid);applyChatWp();return r};
const _cc=closeChat;
closeChat=function(){chatClearReply();_cc()};

/* --- настройки сообщений --- */
window.setDblReact=e=>{ls("amg_dbl_react",e);document.querySelectorAll("#reactPick button").forEach(b=>b.classList.toggle("sel",b.dataset.e===e))};
window.openMsgSettings=function(){
  const cur=dblEmoji(),dim=ls("amg_wp_dim")??25;
  openMisc(miscHead(ic("users",24),"Настройки сообщений","Реакции и обои")+`
  <div class="reg-body" style="overflow-y:auto;min-height:0">
    <div class="misc-hint">Реакция по двойному тапу на сообщение</div>
    <div class="react-pick" id="reactPick">${RKEYS.map(e=>`<button data-e="${e}" class="${e===cur?"sel":""}" onclick="setDblReact('${e}')" aria-label="${e}">${RI[e]}</button>`).join("")}</div>
    <div class="misc-hint">Общие обои всех чатов</div>
    <div class="wp-prev" data-t="*"></div>
    <div class="up-two"><button class="ghost-btn" onclick="pickWp('*')">Из галереи</button><button class="ghost-btn" onclick="clearWp('*')">Сбросить</button></div>
    <div class="vol-row"><label><span>Затемнение обоев</span><b id="wpDimV">${dim}%</b></label>
      <input type="range" min="0" max="80" step="5" value="${dim}" oninput="ls_dim(this.value)"></div>
    <div class="misc-hint">Свайп влево по сообщению — ответить. Свайп вправо в любом месте чата, в том числе по сообщению, — закрыть диалог и открыть список сообщений. Обои отдельного чата меняются в профиле собеседника: нажмите на его имя вверху чата.</div>
  </div>`);
  wpRefresh();
};
window.ls_dim=v=>{ls("amg_wp_dim",String(v));gid("wpDimV").textContent=v+"%";applyChatWp()};
})();
