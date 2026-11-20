var DAY=864e5;
function today(){var d=new Date();d.setHours(0,0,0,0);return d.getTime()}
var BOOKS=[
{id:1,t:"The Left Hand of Darkness",a:"Ursula K. Le Guin",s:"Science fiction",c:"FIC LEG",l:"Fiction, aisle 4",y:1969,due:null},
{id:2,t:"Braiding Sweetgrass",a:"Robin Wall Kimmerer",s:"Nature",c:"581.6 KIM",l:"Nonfiction, aisle 9",y:2013,due:6},
{id:3,t:"Sapiens",a:"Yuval Noah Harari",s:"History",c:"909 HAR",l:"Nonfiction, aisle 2",y:2011,due:null},
{id:4,t:"Pride and Prejudice",a:"Jane Austen",s:"Classics",c:"FIC AUS",l:"Fiction, aisle 1",y:1813,due:null},
{id:5,t:"The Remains of the Day",a:"Kazuo Ishiguro",s:"Literary fiction",c:"FIC ISH",l:"Fiction, aisle 3",y:1989,due:11},
{id:6,t:"A Brief History of Time",a:"Stephen Hawking",s:"Science",c:"523.1 HAW",l:"Nonfiction, aisle 6",y:1988,due:null},
{id:7,t:"Educated",a:"Tara Westover",s:"Memoir",c:"B WES",l:"Biography, aisle 8",y:2018,due:3},
{id:8,t:"Project Hail Mary",a:"Andy Weir",s:"Science fiction",c:"FIC WEI",l:"Fiction, aisle 5",y:2021,due:null},
{id:9,t:"The Name of the Wind",a:"Patrick Rothfuss",s:"Fantasy",c:"FIC ROT",l:"Fiction, aisle 4",y:2007,due:16},
{id:10,t:"Atomic Habits",a:"James Clear",s:"Self-help",c:"158.1 CLE",l:"Nonfiction, aisle 7",y:2018,due:null},
{id:11,t:"One Hundred Years of Solitude",a:"Gabriel García Márquez",s:"Classics",c:"FIC GAR",l:"Fiction, aisle 2",y:1967,due:null},
{id:12,t:"The Soul of an Octopus",a:"Sy Montgomery",s:"Nature",c:"594 MON",l:"Nonfiction, aisle 9",y:2015,due:null}
];
var loans={}; // id -> due timestamp (mine)
var filter="all",tab="find";
function save(){try{localStorage.setItem("lib-loans",JSON.stringify(loans))}catch(e){}}
try{var s=localStorage.getItem("lib-loans");if(s)loans=JSON.parse(s)||{}}catch(e){loans={}}
BOOKS.forEach(function(b){b.out=b.due!==null?today()+b.due*DAY:null});
function fmt(ts){return new Date(ts).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
function left(ts){return Math.round((ts-today())/DAY)}
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(m){var t=document.getElementById("toast");t.textContent=m;t.classList.add("show");setTimeout(function(){t.classList.remove("show")},2200)}
var subs=[...new Set(BOOKS.map(function(b){return b.s}))].sort();
var sel=document.getElementById("sub");
subs.forEach(function(x){var o=document.createElement("option");o.value=x;o.textContent=x;sel.appendChild(o)});
function renderFind(){
var q=document.getElementById("q").value.trim().toLowerCase(),sb=sel.value;
var list=BOOKS.filter(function(b){
var mine=loans[b.id]!==undefined,avail=b.out===null&&!mine;
if(filter==="in"&&!avail)return false;
if(filter==="out"&&avail)return false;
if(sb&&b.s!==sb)return false;
return !q||(b.t+" "+b.a+" "+b.s+" "+b.c).toLowerCase().indexOf(q)>-1});
document.getElementById("count").textContent=list.length+(list.length===1?" book found":" books found");
var h=list.map(function(b){
var mine=loans[b.id]!==undefined,st,btn;
if(mine){st='<div class="status ok">On your loan, due '+fmt(loans[b.id])+'</div>';btn='<button class="btn alt" data-go="loans">View loan</button>'}
else if(b.out!==null){st='<div class="status warn">On loan, due back '+fmt(b.out)+'</div>';btn='<button class="btn alt" data-hold="'+b.id+'">Place hold</button>'}
else{st='<div class="status ok">Available on shelf</div>';btn='<button class="btn" data-b="'+b.id+'">Borrow</button>'}
return '<article class="item"><div class="call">'+esc(b.c)+'<small>'+esc(b.l)+'</small></div><div><h3>'+esc(b.t)+'</h3><div class="meta">'+esc(b.a)+' · '+b.y+' · '+esc(b.s)+'</div>'+st+'</div><div class="acts">'+btn+'</div></article>'}).join("");
document.getElementById("results").innerHTML=h||'<div class="empty">No books match. Try a different title, author or subject, or clear the filters.</div>'}
function renderLoans(){
var ids=Object.keys(loans).map(Number).sort(function(a,b){return loans[a]-loans[b]});
var late=ids.filter(function(i){return left(loans[i])<0}).length;
var next=ids.length?fmt(loans[ids[0]]):"None";
var h='<div class="summary"><div><b>'+ids.length+'</b>Books borrowed</div><div><b class="'+(late?"bad":"")+'">'+late+'</b>Overdue</div><div><b style="font-size:1.1rem;line-height:1.7">'+next+'</b>Next due date</div></div>';
h+=ids.map(function(i){
var b=BOOKS.filter(function(x){return x.id===i})[0],d=left(loans[i]),cls="",msg;
if(d<0){cls="late";msg='<span class="bad">Overdue by '+(-d)+(d===-1?" day":" days")+'</span>'}
else if(d<=3){cls="soon";msg='<span class="warn">'+(d===0?"Due today":"Due in "+d+(d===1?" day":" days"))+'</span>'}
else msg='<span class="ok">Due in '+d+' days</span>';
return '<article class="item '+cls+'"><div class="call">'+esc(b.c)+'<small>'+esc(b.l)+'</small></div><div><h3>'+esc(b.t)+'</h3><div class="meta">'+esc(b.a)+'</div><div class="status">'+msg+' · '+fmt(loans[i])+'</div></div><div class="acts"><button class="btn alt" data-r="'+i+'">Renew 14 days</button><button class="btn" data-ret="'+i+'">Return</button></div></article>'}).join("");
if(!ids.length)h+='<div class="empty">You have no books on loan. Search the catalog and choose Borrow to start a loan.</div>';
document.getElementById("loans").innerHTML=h}
function badge(){document.getElementById("lc").textContent=Object.keys(loans).length}
function show(t){tab=t;
document.getElementById("find").hidden=t!=="find";document.getElementById("loans").hidden=t!=="loans";
document.getElementById("t-find").setAttribute("aria-selected",t==="find");
document.getElementById("t-loans").setAttribute("aria-selected",t==="loans");
t==="find"?renderFind():renderLoans()}
function refresh(){badge();show(tab)}
document.addEventListener("click",function(e){
var el=e.target.closest("button");if(!el)return;
if(el.id==="t-find")show("find");
else if(el.id==="t-loans")show("loans");
else if(el.dataset.f){filter=el.dataset.f;document.querySelectorAll(".chip").forEach(function(c){c.setAttribute("aria-pressed",c===el)});renderFind()}
else if(el.dataset.go)show("loans");
else if(el.dataset.b){loans[el.dataset.b]=today()+21*DAY;save();toast("Borrowed. Due "+fmt(loans[el.dataset.b]));refresh()}
else if(el.dataset.r){loans[el.dataset.r]+=14*DAY;save();toast("Renewed. New due date "+fmt(loans[el.dataset.r]));refresh()}
else if(el.dataset.ret){delete loans[el.dataset.ret];save();toast("Returned. Thank you!");refresh()}
else if(el.dataset.hold)toast("Hold placed. We’ll notify you when it’s back.")});
document.getElementById("q").addEventListener("input",renderFind);
sel.addEventListener("change",renderFind);
// Start with two sample loans on first visit so due dates are visible
var seeded=false;try{seeded=!!localStorage.getItem("lib-seeded")}catch(e){}
if(!Object.keys(loans).length&&!seeded){try{localStorage.setItem("lib-seeded","1")}catch(e){}
loans[7]=today()+2*DAY;loans[4]=today()-3*DAY;BOOKS.forEach(function(b){if(b.id===7||b.id===4)b.out=null});save()}
refresh();
