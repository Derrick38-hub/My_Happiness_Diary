const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const app=require('./script.js');
const {defaultState,validateState,addReflection,calculatePoints,ensureMonthlyTree,monthlyTarget,getStageIndex,calendarCells,localDateKey,groupJournalEntries,MOOD_EMOJIS,treeSVG}=app;
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
const day='2026-11-20',next='2026-11-21';
const input=(journal='',mood='Calm',extra={})=>({journal,mood,...extra});
const reward=(result,label)=>result.reasons.find(r=>r.label===label)?.points||0;
function withHP(hp,date=day){const s=defaultState(date);s.monthlyTrees[date.slice(0,7)].hp=hp;s.hp=hp;return s;}
check('Monthly targets include common years, leap years, 30 days and 31 days',()=>{
 for(const [month,target] of [['2027-02',420],['2028-02',435],['2026-04',450],['2026-11',450],['2026-12',465],['2100-02',420],['2000-02',435]])assert.equal(monthlyTarget(month),target);
});
check('All moods earn 5 HP once daily with no written reflection bonus',()=>{
 for(const mood of ['Happy','Grateful','Calm','Excited','Neutral']){
  const s=defaultState(day);const first=addReflection(s,input('',mood),day);
  assert.equal(first.points,5);assert.equal(first.reflectionBonus,false);assert.equal(s.entries[0].journal,'');
  assert.equal(addReflection(s,input('','Neutral'),day).points,0);assert.equal(s.hp,5);
 }
});
check('Written reflection after mood-only check-in earns its own 10 HP once',()=>{
 const s=defaultState(day);addReflection(s,input(),day);
 const result=addReflection(s,input('The rain fell beside the river.'),day);
 assert.equal(reward(result,'First daily reflection'),10);assert.equal(reward(result,'Daily mood check-in'),0);
 assert.equal(addReflection(s,input('The rain fell beside the river.'),day).points,0);
 assert.equal(addReflection(s,input('The rain fell beside the river.'),next).points,15);
});
check('Written-first check-in receives both bonuses, unknown words earn nothing',()=>{
 const s=defaultState(day);const r=addReflection(s,input('qzxunknown'),day);assert.equal(r.points,15);assert.equal(reward(r,'Positive words'),0);
});
check('Positive words are case/punctuation insensitive and renew by local day',()=>{
 const s=defaultState(day);assert.equal(addReflection(s,input('HAPPY, happy!'),day).points,20);
 assert.equal(addReflection(s,input('happy peaceful'),day).points,5);
 assert.equal(addReflection(s,input('HAPPY peaceful!'),day).points,0);
 assert.equal(addReflection(s,input('happy peaceful'),next).points,25);
});
check('Memory and gratitude bonuses remain once each daily and require journal text',()=>{
 const s=defaultState(day);const text='I appreciate the time spent beside the river today.';
 assert.equal(addReflection(s,input('','Grateful',{gratitude:true}),day).points,5);
 const r=addReflection(s,input(text,'Grateful',{memory:true}),day);
 assert.equal(reward(r,'Happy memory'),10);assert.equal(reward(r,'Gratitude reflection'),10);assert.equal(reward(r,'First daily reflection'),10);
 assert.equal(addReflection(s,input(text,'Grateful',{memory:true}),day).points,0);
 const tomorrow=addReflection(s,input(text,'Grateful',{memory:true}),next);assert.equal(reward(tomorrow,'Happy memory'),10);assert.equal(reward(tomorrow,'Gratitude reflection'),10);
 assert.ok(addReflection(s,input('short','Happy',{memory:true}),next).error);
});
check('Target cap and completion keep allowing journal history without more HP',()=>{
 const s=withHP(448);const r=addReflection(s,input('happy'),day);assert.equal(r.points,2);assert.equal(s.hp,450);
 assert.equal(s.monthlyTrees['2026-11'].completedDate,day);
 assert.equal(addReflection(s,input('peaceful'),next).points,0);assert.equal(s.entries.length,2);
 assert.equal(s.monthlyTrees['2026-11'].hp,450);assert.equal(s.completedTrees.length,0);
});
check('Month/year rollover preserves partial trees and starts at zero only once',()=>{
 const s=withHP(255,'2026-12-31');addReflection(s,input('qzx'), '2026-12-31');const december=s.hp;
 assert.equal(ensureMonthlyTree(s,'2027-01-01'),true);assert.equal(s.hp,0);assert.equal(s.monthlyTrees['2026-12'].hp,december);
 assert.equal(ensureMonthlyTree(s,'2027-01-01'),false);assert.equal(Object.keys(s.monthlyTrees).length,2);
 addReflection(s,input('happy'),'2027-01-01');assert.equal(s.hp,20);assert.equal(s.monthlyTrees['2026-12'].hp,december);
 const reloaded=validateState(JSON.parse(JSON.stringify(s)),'2027-01-01');assert.equal(reloaded.hp,20);assert.equal(Object.keys(reloaded.monthlyTrees).length,2);
});
check('Dated submissions increase only the tree belonging to their own month',()=>{
 const s=defaultState(day);addReflection(s,input('happy'),'2026-11-30');addReflection(s,input('happy'),'2026-12-01');
 assert.equal(s.monthlyTrees['2026-11'].hp,20);assert.equal(s.monthlyTrees['2026-12'].hp,20);
 addReflection(s,input('peaceful'),'2026-11-30');assert.equal(s.monthlyTrees['2026-11'].hp,25);assert.equal(s.monthlyTrees['2026-12'].hp,20);
});
const legacy={version:3,hp:255,treeId:2,startDate:'2026-10-30',rewardedWords:['happy'],rewardedWordsByDate:{[day]:['happy']},rewardedDates:[day],entries:[{id:'legacy',date:day,time:'10:00 AM',mood:'Happy',words:'',journal:'happy',points:15,treeId:2,memoryBonus:true,gratitudeBonus:true}],completedTrees:[{id:1,hp:350,startDate:'2026-09-01',completedDate:'2026-10-01',days:20}]};
check('Migration preserves 255 HP and exact legacy records without replaying rewards',()=>{
 const original=JSON.stringify(legacy);const s=validateState(legacy,day);
 assert.equal(s.hp,255);assert.equal(s.monthlyTrees['2026-11'].hp,255);assert.deepEqual(s.entries,legacy.entries);assert.deepEqual(s.completedTrees,legacy.completedTrees);
 assert.equal(JSON.stringify(legacy),original);assert.equal(s.legacyProgress.hp,255);
 const result=addReflection(s,input('happy'),day);assert.equal(result.points,5);assert.equal(reward(result,'First daily reflection'),0);assert.equal(reward(result,'Positive words'),0);
 assert.equal(addReflection(s,input('happy'),day).points,0);
 const again=validateState(JSON.parse(JSON.stringify(s)),day);assert.equal(again.hp,260);assert.equal(again.completedTrees.length,1);assert.equal(Object.keys(again.monthlyTrees).length,1);
});
check('Old-month migration archives its balance without increasing the new month',()=>{
 const old={...legacy,entries:legacy.entries.map(e=>({...e,date:'2026-10-31'}))};
 const s=validateState(old,day);assert.equal(s.hp,0);assert.equal(s.monthlyTrees['2026-10'].hp,255);assert.equal(s.monthlyTrees['2026-11'].hp,0);
});
check('Legacy fully grown tree and old schema words are retained',()=>{
 const old={...legacy,version:2,hp:350};delete old.rewardedWordsByDate;
 const s=validateState(old,day);assert.equal(s.hp,350);assert.equal(s.monthlyTrees['2026-11'].target,450);assert.deepEqual(s.rewardedWordsByDate[day],['happy']);assert.equal(s.completedTrees[0].hp,350);
});
check('Reload keeps mood-only check-ins distinct from written rewards',()=>{
 const s=defaultState(day);addReflection(s,input(),day);const loaded=validateState(JSON.parse(JSON.stringify(s)),day);
 assert.equal(addReflection(loaded,input(),day).points,0);assert.equal(addReflection(loaded,input('qzx'),day).points,10);
});
check('Growth stages scale to the monthly target and all five SVGs remain distinct',()=>{
 for(const target of [420,435,450,465]){assert.equal(getStageIndex(0,target),0);assert.equal(getStageIndex(target-1,target),3);assert.equal(getStageIndex(target,target),4);}
 assert.equal(new Set([0,1,2,3,4].map(treeSVG)).size,5);
});
check('Calendar alignment is unchanged across all months from 2000 through 2040',()=>{
 for(let y=2000;y<=2040;y++)for(let m=0;m<12;m++){
  const cells=calendarCells(y,m);assert.equal(cells.length%7,0);assert.equal(cells.filter(Boolean).length,new Date(y,m+1,0).getDate());assert.equal(cells.findIndex(Boolean),(new Date(y,m,1).getDay()+6)%7);
 }
});
// A minimal DOM/storage adapter exercises actual handlers without touching personal browser data.
class Element {
 constructor(){this.open=false;this.isConnected=true;this.focused=false;this.attributes={};this.value='';this.checked=false;this.dataset={};this.listeners={};this.style={};this.children=[];this.textContent='';this.classList={add(){},remove(){},toggle(){}};}
 setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k];}append(...c){this.children.push(...c);}replaceChildren(){this.children=[];}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}focus(){this.focused=true;}addEventListener(t,fn){this.listeners[t]=fn;}reset(){}click(){}
}
function page(storage,date=day){
 const elements=new Map([...fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const get=id=>{assert.ok(elements.has(id),'Missing element '+id);return elements.get(id);};
 const moods=['Happy','Grateful','Calm','Excited','Neutral'].map(m=>{const e=new Element();e.dataset.mood=m;return e;});
 let clock=date;class Clock extends Date{constructor(...args){super(...(args.length?args:[clock+'T12:00:00']));}static now(){return new Date(clock+'T12:00:00').getTime();}}
 const document={body:new Element(),hidden:false,listeners:{},addEventListener(t,fn){this.listeners[t]=fn;},getElementById:get,querySelectorAll:()=>moods,querySelector:()=>new Element(),createElement:()=>new Element()};let timer;
 vm.runInNewContext(fs.readFileSync('script.js','utf8'),{document,Date:Clock,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},setInterval:fn=>{timer=fn;},setTimeout,Blob,URL,console});
 return {get,moods,document,tick(date){clock=date;timer();}};
}
const key='myHappinessTrackerV1';
check('UI migrates once and displays November 255/450 and 57% with dynamic instructions',()=>{
 const storage={[key]:JSON.stringify(legacy)},ui=page(storage);assert.equal(ui.get('currentHP').textContent,255);assert.equal(ui.get('targetHP').textContent,450);assert.equal(ui.get('progressText').textContent,'57% grown');assert.match(ui.get('treeMonth').textContent,/November 2026/);assert.match(ui.get('monthlyTargetInfo').textContent,/450 HP/);
 assert.equal(storage[key+'BeforeMonthlyV4'],JSON.stringify(legacy));const first=storage[key];page(storage);assert.equal(storage[key],first);assert.equal(JSON.parse(first).entries.length,1);
 ui.moods[4].listeners.click();ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.match(ui.get('feedback').textContent,/Mood saved/);assert.equal(JSON.parse(storage[key]).hp,260);
});
check('Open page automatically rolls over without duplicating trees or losing old progress',()=>{
 const s=withHP(255,'2026-12-31'),storage={[key]:JSON.stringify(s)},ui=page(storage,'2026-12-31');
 ui.tick('2027-01-01');assert.equal(ui.get('currentHP').textContent,0);assert.match(ui.get('treeMonth').textContent,/January 2027/);assert.equal(ui.get('completedGarden').children.length,1);
 const saved=JSON.parse(storage[key]);assert.equal(saved.monthlyTrees['2026-12'].hp,255);assert.equal(Object.keys(saved.monthlyTrees).length,2);
 ui.tick('2027-01-01');assert.equal(storage[key],JSON.stringify(saved));
});
check('Calendar mood-only entries, journal modal, and help modal still work safely',()=>{
 const s=defaultState(day);addReflection(s,input('qzx','Happy'),day,'09:00');addReflection(s,input('','Neutral'),day,'12:00');
 const storage={[key]:JSON.stringify(s)},ui=page(storage);const before=storage[key];const cell=ui.get('calendarDays').children.find(c=>c.dataset.date===day);
 assert.equal(cell.children[1].children.length,2);cell.listeners.click();assert.equal(ui.get('journalDialog').open,true);
 const cards=ui.get('journalDialogEntries').children;assert.equal(cards.length,2);assert.equal(cards[0].children[0].children[1].textContent,'Neutral');
 ui.get('closeJournalDialog').listeners.click();assert.equal(ui.get('journalDialog').open,false);assert.equal(cell.focused,true);
 ui.get('openGrowthGuide').listeners.click();assert.equal(ui.get('growthGuideDialog').open,true);ui.get('growthGuideDialog').listeners.cancel({preventDefault(){}});assert.equal(ui.get('growthGuideDialog').open,false);
 assert.equal(storage[key],before);
 ui.get('nextMonth').listeners.click();assert.match(ui.get('calendarNote').textContent,/No reflections/);ui.get('previousMonth').listeners.click();
});


check('A legacy tree already archived is not copied into a second monthly tree',()=>{
 const saved={...legacy,hp:350,completedTrees:[...legacy.completedTrees,{id:2,hp:350,completedDate:day,startDate:day}]};
 const s=validateState(saved,day);assert.equal(s.hp,0);assert.equal(s.legacyProgress.hp,350);assert.equal(s.legacyProgress.alreadyArchived,true);assert.deepEqual(s.completedTrees,saved.completedTrees);
});
check('Migration backup is kept intact and never replaced on subsequent saves',()=>{
 const storage={[key]:JSON.stringify(legacy),[key+'BeforeMonthlyV4']:'previous backup'};
 const ui=page(storage);assert.equal(storage[key+'BeforeMonthlyV4'],'previous backup');ui.moods[0].listeners.click();ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key+'BeforeMonthlyV4'],'previous backup');
});


check('Only the five selected moods are offered and accepted for new check-ins',()=>{
 const expected=['Happy','Grateful','Calm','Excited','Neutral'];
 const html=fs.readFileSync('index.html','utf8');assert.deepEqual([...html.matchAll(/data-mood="([^"]+)"/g)].map(m=>m[1]),expected);
 assert.deepEqual(app.MOODS,expected);assert.deepEqual(Object.keys(MOOD_EMOJIS),expected);
 for(const mood of expected){const s=defaultState(day);assert.equal(addReflection(s,input('',mood),day).points,5);assert.equal(addReflection(s,input('',mood),day).points,0);assert.equal(addReflection(s,input('',mood),next).points,5);}
 for(const mood of ['Sad','Angry','Stressed','Difficult']){const s=withHP(255);const before=JSON.stringify(s);assert.ok(addReflection(s,input('',mood),day).error);assert.equal(JSON.stringify(s),before);}
 assert.ok(html.includes('How did your happy moment make you feel today?'));
 assert.ok(html.includes('Even the smallest moments can bring happiness. Take a moment to remember yours.'));
});
check('Historical removed moods keep their names, rewards and calendar/modal visibility',()=>{
 const s=withHP(255);
 s.entries=['Sad','Stressed','Angry','Difficult'].map((mood,i)=>({id:'historic'+i,date:day,time:`${10+i}:00`,mood,words:'',journal:'Saved memory '+i,points:5,treeId:1}));
 const loaded=validateState(JSON.parse(JSON.stringify(s)),day);assert.deepEqual(loaded.entries,s.entries);assert.equal(loaded.hp,255);
 const storage={[key]:JSON.stringify(s)},before=storage[key],ui=page(storage);
 const cell=ui.get('calendarDays').children.find(c=>c.dataset.date===day);assert.equal(cell.children[1].children.length,3);
 assert.ok(cell.children[1].children.every(c=>typeof c.textContent==='string'&&c.textContent.length>0));
 cell.listeners.click();const cards=ui.get('journalDialogEntries').children;
 assert.deepEqual(cards.map(c=>c.children[0].children[1].textContent),['Difficult','Angry','Stressed','Sad']);
 assert.ok(cards.every(c=>c.children[0].children[0].textContent));assert.equal(storage[key],before);
});
console.log(`${checks} checks passed.`);
