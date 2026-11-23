const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const app=require('./script.js');
const {defaultState,validateState,addReflection,calculatePoints,ensureMonthlyTree,getStageIndex,calendarCells,localDateKey,groupJournalEntries,MOOD_EMOJIS,treeSVG}=app;
let checks=0;const tests=[];function check(name,fn){tests.push([name,fn]);}
const day='2026-11-20',next='2026-11-21';
const input=(journal='',mood='Calm',extra={})=>({journal,mood,...extra});
const reward=(result,label)=>result.reasons.find(r=>r.label===label)?.points||0;
function withHP(hp,date=day){const s=defaultState(date);s.monthlyTrees[date.slice(0,7)].hp=hp;s.hp=hp;return s;}
check('Every new month has a 1,000 HP growth target',async()=>{
 for(const month of ['2027-02','2028-02','2026-04','2026-12'])assert.equal(defaultState(month+'-01').monthlyTrees[month].target,1000);
});
check('All moods earn 5 HP once daily with no written reflection bonus',async()=>{
 for(const mood of ['Happy','Grateful','Calm','Excited','Neutral']){
  const s=defaultState(day);const first=addReflection(s,input('',mood),day);
  assert.equal(first.points,5);assert.equal(first.reflectionBonus,false);assert.equal(s.entries[0].journal,'');
  assert.equal(addReflection(s,input('','Neutral'),day).points,0);assert.equal(s.hp,5);
 }
});
check('Written reflection after mood-only check-in earns its own 10 HP once',async()=>{
 const s=defaultState(day);addReflection(s,input(),day);
 const result=addReflection(s,input('The rain fell beside the river.'),day);
 assert.equal(reward(result,'First daily reflection'),10);assert.equal(reward(result,'Daily mood check-in'),0);
 assert.equal(addReflection(s,input('The rain fell beside the river.'),day).points,0);
 assert.equal(addReflection(s,input('The rain fell beside the river.'),next).points,15);
});
check('Written-first check-in receives both bonuses, unknown words earn nothing',async()=>{
 const s=defaultState(day);const r=addReflection(s,input('qzxunknown'),day);assert.equal(r.points,15);assert.equal(reward(r,'Positive words'),0);
});
check('Positive words are case/punctuation insensitive and renew by local day',async()=>{
 const s=defaultState(day);assert.equal(addReflection(s,input('HAPPY, happy!'),day).points,17);
 assert.equal(addReflection(s,input('happy peaceful'),day).points,2);
 assert.equal(addReflection(s,input('HAPPY peaceful!'),day).points,0);
 assert.equal(addReflection(s,input('happy peaceful'),next).points,19);
});
check('Memory and gratitude bonuses remain once each daily and require journal text',async()=>{
 const s=defaultState(day);const text='I appreciate the time spent beside the river today.';
 assert.equal(addReflection(s,input('','Grateful',{gratitude:true}),day).points,5);
 const r=addReflection(s,input(text,'Grateful',{memory:true}),day);
 assert.equal(reward(r,'Happy memory'),7);assert.equal(reward(r,'Gratitude reflection'),8);assert.equal(reward(r,'First daily reflection'),10);
 assert.equal(addReflection(s,input(text,'Grateful',{memory:true}),day).points,0);
 const tomorrow=addReflection(s,input(text,'Grateful',{memory:true}),next);assert.equal(reward(tomorrow,'Happy memory'),7);assert.equal(reward(tomorrow,'Gratitude reflection'),8);
 assert.ok(addReflection(s,input('short','Happy',{memory:true}),next).error);
});
check('Crossing 1,000 HP caps the award while later entries are locked',async()=>{
 const s=withHP(998);const r=addReflection(s,input('happy'),day);assert.equal(r.points,2);assert.equal(s.hp,1000);
 assert.equal(r.reasons.reduce((sum,r)=>sum+r.points,0),2);
 assert.equal(s.monthlyTrees['2026-11'].completedDate,day);
 assert.equal(addReflection(s,input('peaceful'),next).locked,true);assert.equal(s.entries.length,1);
 assert.equal(s.monthlyTrees['2026-11'].hp,1000);assert.equal(s.completedTrees.length,0);
 assert.equal(s.monthlyTrees['2026-11'].completedDate,day);
});
check('Month/year rollover preserves partial trees and starts at zero only once',async()=>{
 const s=withHP(255,'2026-12-31');addReflection(s,input('qzx'), '2026-12-31');const december=s.hp;
 assert.equal(ensureMonthlyTree(s,'2027-01-01'),true);assert.equal(s.hp,0);assert.equal(s.monthlyTrees['2026-12'].hp,december);
 assert.equal(ensureMonthlyTree(s,'2027-01-01'),false);assert.equal(Object.keys(s.monthlyTrees).length,2);
 addReflection(s,input('happy'),'2027-01-01');assert.equal(s.hp,17);assert.equal(s.monthlyTrees['2026-12'].hp,december);
 const reloaded=validateState(JSON.parse(JSON.stringify(s)),'2027-01-01');assert.equal(reloaded.hp,17);assert.equal(Object.keys(reloaded.monthlyTrees).length,2);
});
check('Dated submissions increase only the tree belonging to their own month',async()=>{
 const s=defaultState(day);addReflection(s,input('happy'),'2026-11-30');addReflection(s,input('happy'),'2026-12-01');
 assert.equal(s.monthlyTrees['2026-11'].hp,17);assert.equal(s.monthlyTrees['2026-12'].hp,17);
 addReflection(s,input('peaceful'),'2026-11-30');assert.equal(s.monthlyTrees['2026-11'].hp,19);assert.equal(s.monthlyTrees['2026-12'].hp,17);
});
const legacy={version:3,hp:255,treeId:2,startDate:'2026-10-30',rewardedWords:['happy'],rewardedWordsByDate:{[day]:['happy']},rewardedDates:[day],entries:[{id:'legacy',date:day,time:'10:00 AM',mood:'Happy',words:'',journal:'happy',points:15,treeId:2,memoryBonus:true,gratitudeBonus:true}],completedTrees:[{id:1,hp:350,startDate:'2026-09-01',completedDate:'2026-10-01',days:20}]};
check('Migration preserves 255 HP and exact legacy records without replaying rewards',async()=>{
 const original=JSON.stringify(legacy);const s=validateState(legacy,day);
 assert.equal(s.hp,255);assert.equal(s.monthlyTrees['2026-11'].hp,255);assert.deepEqual(s.entries,legacy.entries);assert.deepEqual(s.completedTrees,legacy.completedTrees);
 assert.equal(JSON.stringify(legacy),original);assert.equal(s.legacyProgress.hp,255);
 const result=addReflection(s,input('happy'),day);assert.equal(result.points,5);assert.equal(reward(result,'First daily reflection'),0);assert.equal(reward(result,'Positive words'),0);
 assert.equal(addReflection(s,input('happy'),day).points,0);
 const again=validateState(JSON.parse(JSON.stringify(s)),day);assert.equal(again.hp,260);assert.equal(again.completedTrees.length,1);assert.equal(Object.keys(again.monthlyTrees).length,1);
});
check('Old-month migration archives its balance without increasing the new month',async()=>{
 const old={...legacy,entries:legacy.entries.map(e=>({...e,date:'2026-10-31'}))};
 const s=validateState(old,day);assert.equal(s.hp,0);assert.equal(s.monthlyTrees['2026-10'].hp,255);assert.equal(s.monthlyTrees['2026-11'].hp,0);
});
check('Legacy fully grown tree and old schema words are retained',async()=>{
 const old={...legacy,version:2,hp:350};delete old.rewardedWordsByDate;
 const s=validateState(old,day);assert.equal(s.hp,350);assert.equal(s.monthlyTrees['2026-11'].target,1000);assert.deepEqual(s.rewardedWordsByDate[day],['happy']);assert.equal(s.completedTrees[0].hp,350);
});
check('Reload keeps mood-only check-ins distinct from written rewards',async()=>{
 const s=defaultState(day);addReflection(s,input(),day);const loaded=validateState(JSON.parse(JSON.stringify(s)),day);
 assert.equal(addReflection(loaded,input(),day).points,0);assert.equal(addReflection(loaded,input('qzx'),day).points,10);
});
check('Growth stages scale to the monthly target and all five SVGs remain distinct',async()=>{
 for(const target of [420,435,450,465]){assert.equal(getStageIndex(0,target),0);assert.equal(getStageIndex(target-1,target),3);assert.equal(getStageIndex(target,target),4);}
 assert.equal(new Set([0,1,2,3,4].map(treeSVG)).size,5);
});
check('Calendar alignment is unchanged across all months from 2000 through 2040',async()=>{
 for(let y=2000;y<=2040;y++)for(let m=0;m<12;m++){
  const cells=calendarCells(y,m);assert.equal(cells.length%7,0);assert.equal(cells.filter(Boolean).length,new Date(y,m+1,0).getDate());assert.equal(cells.findIndex(Boolean),(new Date(y,m,1).getDay()+6)%7);
 }
});
// A minimal DOM/storage adapter exercises actual handlers without touching personal browser data.
class Element {
 constructor(){this.open=false;this.isConnected=true;this.focused=false;this.attributes={};this.value='';this.checked=false;this.dataset={};this.listeners={};this.style={};this.children=[];this.textContent='';this.classList={add(){},remove(){},toggle(){}};}
 setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k];}append(...c){this.children.push(...c);}replaceChildren(...c){this.children=c;}remove(){}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}focus(){this.focused=true;}addEventListener(t,fn){this.listeners[t]=fn;}reset(){}click(){}
}
const lockManagers=new WeakMap();function lockFor(storage){if(!lockManagers.has(storage)){let tail=Promise.resolve();lockManagers.set(storage,{request(name,options,fn){const task=tail.then(fn);tail=task.catch(()=>{});return task;}});}return lockManagers.get(storage);}
async function page(storage,date=day,{confirm=()=>false,write=(key,value)=>storage[key]=value,read=k=>storage[k]||null,locking=true}={}){
 const elements=new Map([...fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 // Mirror initial ARIA values from HTML in the isolated DOM adapter.
 for(const tag of fs.readFileSync('index.html','utf8').matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){
  for(const attribute of tag[0].matchAll(/\s(aria-[\w-]+)="([^"]*)"/g))elements.get(tag[1]).setAttribute(attribute[1],attribute[2]);
 }
 const get=id=>{assert.ok(elements.has(id),'Missing element '+id);return elements.get(id);};
 const moods=['Happy','Grateful','Calm','Excited','Neutral'].map(m=>{const e=new Element();e.dataset.mood=m;return e;});
 let clock=date;class Clock extends Date{constructor(...args){super(...(args.length?args:[clock+'T12:00:00']));}static now(){return new Date(clock+'T12:00:00').getTime();}}
 const document={body:new Element(),hidden:false,listeners:{},addEventListener(t,fn){this.listeners[t]=fn;},getElementById:get,querySelectorAll:()=>moods,querySelector:()=>new Element(),createElement:()=>new Element()};let timer;
 let download;
 const locks=locking?lockFor(storage):null,win={confirm,listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}};
 vm.runInNewContext(fs.readFileSync('script.js','utf8'),{document,Date:Clock,localStorage:{getItem:read,setItem:write},window:win,navigator:{locks},setInterval:fn=>{timer=fn;},setTimeout,Blob,URL:{createObjectURL(blob){download=blob;return 'blob:test';},revokeObjectURL(){}},console});
 get('reflectionForm').reset=()=>{get('journalText').value='';get('happyMemory').checked=false;get('gratitude').checked=false;};
 await win.diaryReady;
 return {get,moods,document,window:win,download:()=>download,tick(date){clock=date;return timer();}};
}
const key='myHappinessTrackerV1';
check('All saved monthly trees adopt 1,000 HP while earned points and earlier goal metadata survive',async()=>{
 const previous=withHP(600,'2026-10-31').monthlyTrees['2026-10'];previous.completedDate='2026-10-31';previous.target=600;
 const saved=withHP(450);saved.monthlyTrees['2026-10']=previous;Object.assign(saved.monthlyTrees['2026-11'],{target:600,completedDate:day});
 const storage={[key]:JSON.stringify(saved)},ui=(await page(storage)),migrated=JSON.parse(storage[key]);
 assert.equal(migrated.monthlyTrees['2026-10'].hp,600);assert.equal(migrated.monthlyTrees['2026-10'].target,1000);assert.equal(migrated.monthlyTrees['2026-10'].completedDate,null);
 assert.deepEqual(migrated.monthlyTrees['2026-10'].growthGoalHistory,[{target:600,completedDate:'2026-10-31'}]);
 assert.equal(migrated.monthlyTrees['2026-11'].hp,450);assert.equal(migrated.monthlyTrees['2026-11'].completedDate,null);assert.equal(ui.get('targetHP').textContent,'1,000');
 const first=storage[key];(await page(storage));assert.equal(storage[key],first);
 const full=(await page({[key]:JSON.stringify(withHP(1200))}));assert.equal(full.get('currentHP').textContent,'1,000');assert.equal(full.get('totalHP').textContent,'1,000');assert.equal(full.get('progressText').textContent,'100% grown');assert.equal(full.get('progressFill').style.width,'100%');
});
check('UI migrates once and displays November 255/1,000 with dynamic instructions',async()=>{
 const storage={[key]:JSON.stringify(legacy)},ui=(await page(storage));assert.equal(ui.get('currentHP').textContent,'255');assert.equal(ui.get('targetHP').textContent,'1,000');assert.equal(ui.get('progressText').textContent,'25.5% grown');assert.match(ui.get('treeMonth').textContent,/November 2026/);assert.match(ui.get('monthlyTargetInfo').textContent,/1,000 HP/);
 assert.equal(storage[key+'BeforeMonthlyV4'],JSON.stringify(legacy));const first=storage[key];(await page(storage));assert.equal(storage[key],first);assert.equal(JSON.parse(first).entries.length,1);
 await ui.moods[4].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.match(ui.get('feedback').textContent,/Mood saved/);assert.equal(JSON.parse(storage[key]).hp,260);
});
check('Open page automatically rolls over without duplicating trees or losing old progress',async()=>{
 const s=withHP(255,'2026-12-31'),storage={[key]:JSON.stringify(s)},ui=(await page(storage,'2026-12-31'));
 await ui.tick('2027-01-01');assert.equal(ui.get('currentHP').textContent,'0');assert.match(ui.get('treeMonth').textContent,/January 2027/);assert.equal(ui.get('completedGarden').children.length,1);
 const saved=JSON.parse(storage[key]);assert.equal(saved.monthlyTrees['2026-12'].hp,255);assert.equal(Object.keys(saved.monthlyTrees).length,2);
 await ui.tick('2027-01-01');assert.equal(storage[key],JSON.stringify(saved));
});
check('Calendar mood-only entries, journal modal, and help modal still work safely',async()=>{
 const s=defaultState(day);addReflection(s,input('qzx','Happy'),day,'09:00');addReflection(s,input('','Neutral'),day,'12:00');
 const storage={[key]:JSON.stringify(s)},ui=(await page(storage));const before=storage[key];const cell=ui.get('calendarDays').children.find(c=>c.dataset.date===day);
 assert.equal(cell.children[1].children.length,2);await cell.listeners.click();assert.equal(ui.get('journalDialog').open,true);
 const cards=ui.get('journalDialogEntries').children;assert.equal(cards.length,2);assert.equal(cards[0].children[0].children[1].textContent,'Neutral');
 await ui.get('closeJournalDialog').listeners.click();assert.equal(ui.get('journalDialog').open,false);assert.equal(cell.focused,true);
 await ui.get('openGrowthGuide').listeners.click();assert.equal(ui.get('growthGuideDialog').open,true);ui.get('growthGuideDialog').listeners.cancel({preventDefault(){}});assert.equal(ui.get('growthGuideDialog').open,false);
 assert.equal(storage[key],before);
 await ui.get('nextMonth').listeners.click();assert.match(ui.get('calendarNote').textContent,/No reflections/);await ui.get('previousMonth').listeners.click();
});


check('A legacy tree already archived is not copied into a second monthly tree',async()=>{
 const saved={...legacy,hp:350,completedTrees:[...legacy.completedTrees,{id:2,hp:350,completedDate:day,startDate:day}]};
 const s=validateState(saved,day);assert.equal(s.hp,0);assert.equal(s.legacyProgress.hp,350);assert.equal(s.legacyProgress.alreadyArchived,true);assert.deepEqual(s.completedTrees,saved.completedTrees);
});
check('Migration backup is kept intact and never replaced on subsequent saves',async()=>{
 const storage={[key]:JSON.stringify(legacy),[key+'BeforeMonthlyV4']:'previous backup'};
 const ui=(await page(storage));assert.equal(storage[key+'BeforeMonthlyV4'],'previous backup');await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key+'BeforeMonthlyV4'],'previous backup');
});


check('Only the five selected moods are offered and accepted for new check-ins',async()=>{
 const expected=['Happy','Grateful','Calm','Excited','Neutral'];
 const html=fs.readFileSync('index.html','utf8');assert.deepEqual([...html.matchAll(/data-mood="([^"]+)"/g)].map(m=>m[1]),expected);
 assert.deepEqual(app.MOODS,expected);assert.deepEqual(Object.keys(MOOD_EMOJIS),expected);
 for(const mood of expected){const s=defaultState(day);assert.equal(addReflection(s,input('',mood),day).points,5);assert.equal(addReflection(s,input('',mood),day).points,0);assert.equal(addReflection(s,input('',mood),next).points,5);}
 for(const mood of ['Sad','Angry','Stressed','Difficult']){const s=withHP(255);const before=JSON.stringify(s);assert.ok(addReflection(s,input('',mood),day).error);assert.equal(JSON.stringify(s),before);}
 assert.ok(html.includes('How did your happy moment make you feel today?'));
 assert.match(html,/Even the smallest moments can bring happiness\. Take a moment to\s+remember yours\./);
});
check('Historical removed moods keep their names, rewards and calendar/modal visibility',async()=>{
 const s=withHP(255);
 s.entries=['Sad','Stressed','Angry','Difficult'].map((mood,i)=>({id:'historic'+i,date:day,time:`${10+i}:00`,mood,words:'',journal:'Saved memory '+i,points:5,treeId:1}));
 const loaded=validateState(JSON.parse(JSON.stringify(s)),day);assert.deepEqual(loaded.entries,s.entries);assert.equal(loaded.hp,255);
 const storage={[key]:JSON.stringify(s)},ui=(await page(storage)),before=storage[key];
 const cell=ui.get('calendarDays').children.find(c=>c.dataset.date===day);assert.equal(cell.children[1].children.length,3);
 assert.ok(cell.children[1].children.every(c=>typeof c.textContent==='string'&&c.textContent.length>0));
 await cell.listeners.click();const cards=ui.get('journalDialogEntries').children;
 assert.deepEqual(cards.map(c=>c.children[0].children[1].textContent),['Difficult','Angry','Stressed','Sad']);
 assert.ok(cards.every(c=>c.children[0].children[0].textContent));assert.equal(storage[key],before);
});
check('Editing journal text preserves rewards and rolls back failed writes',async()=>{
 const saved=defaultState(day);
 addReflection(saved,input('happy and peaceful'),day,'09:00');
 addReflection(saved,input('','Neutral'),day,'12:00');
 const original=JSON.stringify(saved),storage={[key]:original};
 let fail=true;
 const ui=(await page(storage,day,{write(key,value){if(fail)throw Error('Storage full');storage[key]=value;}}));
 const cell=ui.get('calendarDays').children.find(cell=>cell.dataset.date===day);
 await cell.listeners.click();
 const [moodOnly,written]=ui.get('journalDialogEntries').children;
 assert.equal(moodOnly.children.length,2);
 const [,reflection,edit,form,feedback]=written.children;
 const [text,actions]=form.children;
 const [,cancel]=actions.children;
 const submit=async()=>await form.listeners.submit({preventDefault(){}});
 await edit.listeners.click();
 assert.equal(text.value,'happy and peaceful');
 text.value='   ';
 await submit();
 assert.match(feedback.textContent,/Enter some text/);
 text.value='Discard this draft';
 await cancel.listeners.click();
 assert.equal(storage[key],original);
 assert.equal(form.hidden,true);
 await edit.listeners.click();
 text.value='Revised reflection';
 await submit();
 assert.equal(storage[key],original);
 assert.equal(reflection.textContent,'happy and peaceful');
 assert.equal(form.hidden,false);
 fail=false;
 await submit();
 const expected=JSON.parse(original);
 expected.entries.find(entry=>entry.journal).journal='Revised reflection';
 const actual=JSON.parse(storage[key]);assert.deepEqual(actual.entries,expected.entries);assert.equal(actual.hp,expected.hp);assert.deepEqual(actual.rewardedWordsByDate,expected.rewardedWordsByDate);assert.ok(actual.revision>0);
 assert.equal(reflection.textContent,'Revised reflection');
 assert.equal(edit.focused,true);
 await ui.get('closeJournalDialog').listeners.click();
 await cell.listeners.click();
 assert.equal(ui.get('journalDialogEntries').children[1].children[1].textContent,'Revised reflection');
});
check('Only todayâ€™s written reflections can be edited, including across midnight',async()=>{
 const saved=defaultState(day);
 addReflection(saved,input('A past memory'),'2026-11-19');
 addReflection(saved,input('Todayâ€™s memory'),day);
 const storage={[key]:JSON.stringify(saved)},ui=(await page(storage)),original=storage[key];
 const open=date=>ui.get('calendarDays').children.find(cell=>cell.dataset.date===date).listeners.click();
 open('2026-11-19');
 assert.equal(ui.get('journalDialogEntries').children[0].children.length,2);
 await ui.get('closeJournalDialog').listeners.click();
 open(day);
 const [meta,reflection,edit,form,feedback]=ui.get('journalDialogEntries').children[0].children;
 await edit.listeners.click();
 form.children[0].value='Late revision';
 await ui.tick(next);
 await form.listeners.submit({preventDefault(){}});
 assert.equal(storage[key],original);
 assert.equal(reflection.textContent,'Todayâ€™s memory');
 assert.equal(edit.hidden,true);
 assert.match(feedback.textContent,/Only today/);
});
check('Monthly graph adds daily HP and follows the selected calendar month',async()=>{
 const saved=defaultState(day);
 addReflection(saved,input('','Calm'),day);
 addReflection(saved,input('happy','Calm'),day);
 addReflection(saved,input('','Happy'),'2026-12-01');
 ensureMonthlyTree(saved,day);
 const storage={[key]:JSON.stringify(saved)},ui=(await page(storage)),original=storage[key];
 await ui.get('nextMonth').listeners.click();
 await ui.get('openMonthlyGraph').listeners.click();
 assert.equal(ui.get('monthlyGraphDialog').open,true);
 assert.equal(ui.get('graphMonth').textContent,ui.get('calendarMonth').textContent);
 assert.equal(ui.get('graphBars').children.length,31);
 assert.equal(ui.get('graphDailyPoints').children[0].children[1].textContent,'+5 HP');
 assert.equal(ui.get('dailyPointsTotal').textContent,'5 HP');
 await ui.get('graphPreviousMonth').listeners.click();
 assert.equal(ui.get('graphBars').children.length,30);
 assert.equal(ui.get('graphScale').children[0].textContent,'100');
 assert.equal(ui.get('graphBars').children[19].style.height,'17%');
 assert.equal(ui.get('graphDailyPoints').children[19].children[1].textContent,'+17 HP');
 assert.equal(ui.get('dailyPointsTotal').textContent,'17 HP');
 assert.equal(ui.get('graphDailyPoints').children.length,30);
 assert.match(ui.get('graphSummary').textContent,/^17 HP/);
 await ui.get('graphPreviousMonth').listeners.click();
 assert.match(ui.get('graphSummary').textContent,/No check-ins/);
 await ui.get('closeMonthlyGraph').listeners.click();
 assert.equal(ui.get('monthlyGraphDialog').open,false);
 assert.equal(ui.get('openMonthlyGraph').focused,true);
 assert.equal(storage[key],original);
});
check('Daily points pill toggles accessibly, refreshes real totals, and shows every calendar day',async()=>{
 const saved=defaultState(day);
 addReflection(saved,input('happy'),day);
 addReflection(saved,input(''),next);
 addReflection(saved,input(''),next);
 const storage={[key]:JSON.stringify(saved)},ui=(await page(storage)),original=storage[key];
 await ui.get('openMonthlyGraph').listeners.click();
 const button=ui.get('dailyPointsToggle'),panel=ui.get('dailyPointsPanel');
 assert.equal(button.getAttribute('aria-expanded'),'false');
 await button.listeners.click();assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(panel.getAttribute('aria-hidden'),'false');assert.equal(panel.inert,false);
 const records=ui.get('graphDailyPoints').children;
 assert.equal(records.length,30);assert.equal(records[19].children[0].dateTime,day);assert.equal(records[20].children[0].dateTime,next);assert.equal(records[0].children[1].textContent,'0 HP');
 assert.equal(records[19].children[1].textContent,'+17 HP');assert.equal(records[20].children[1].textContent,'+5 HP');
 assert.equal(ui.get('dailyPointsTotal').textContent,'22 HP');
 await ui.get('graphNextMonth').listeners.click();assert.equal(ui.get('dailyPointsTotal').textContent,'0 HP');assert.equal(ui.get('graphDailyPoints').children.length,31);assert.ok(ui.get('graphDailyPoints').children.every(row=>row.children[1].textContent==='0 HP'));
 await ui.get('graphPreviousMonth').listeners.click();assert.equal(ui.get('dailyPointsTotal').textContent,'22 HP');
 await button.listeners.click();assert.equal(button.getAttribute('aria-expanded'),'false');assert.equal(panel.getAttribute('aria-hidden'),'true');assert.equal(panel.inert,true);
 assert.equal(storage[key],original);
});
check('Graph daily rows cover 28/29/30/31 days, stay chronological, and sum to its existing monthly total',async()=>{
 for(const [month,count] of [['2027-02',28],['2028-02',29],['2026-04',30],['2026-11',30],['2026-12',31]]){
  const first=month+'-01',last=month+'-'+count;
  const saved=defaultState(first);addReflection(saved,input('happy'),first);addReflection(saved,input('peaceful'),last);ensureMonthlyTree(saved,first);
  const storage={[key]:JSON.stringify(saved)},ui=(await page(storage,first)),original=storage[key];
  await ui.get('openMonthlyGraph').listeners.click();
  const rows=ui.get('graphDailyPoints').children;assert.equal(rows.length,count);
  assert.equal(rows[0].children[0].dateTime,first);assert.equal(rows.at(-1).children[0].dateTime,last);
  rows.forEach((row,index)=>assert.equal(Number(row.children[0].dateTime.slice(-2)),index+1));
  const sum=rows.reduce((total,row)=>total+parseInt(row.children[1].textContent,10),0);
  const earned=saved.entries.reduce((total,entry)=>total+entry.points,0);
  assert.equal(sum,earned);assert.equal(ui.get('dailyPointsTotal').textContent,`${sum} HP`);
  assert.equal(rows[1].children[1].textContent,'0 HP');assert.match(rows[1].children[1].className,/is-zero/);
  await ui.get('graphNextMonth').listeners.click();assert.ok(ui.get('graphDailyPoints').children.every(row=>row.children[1].textContent==='0 HP'));
  await ui.get('graphPreviousMonth').listeners.click();assert.equal(ui.get('graphDailyPoints').children.length,count);assert.equal(ui.get('dailyPointsTotal').textContent,`${sum} HP`);
  assert.equal(ui.get('closeMonthlyGraph').getAttribute('aria-label'),'Close monthly happiness graph');
  await ui.get('closeMonthlyGraph').listeners.click();assert.equal(ui.get('monthlyGraphDialog').open,false);assert.equal(ui.get('openMonthlyGraph').focused,true);
  assert.equal(storage[key],original);
 }
});
check('Exact progress, stages, totals and accessible progress values at every requested boundary',async()=>{
 for(const [hp,percent] of [[0,0],[100,10],[250,25],[500,50],[600,60],[750,75],[900,90],[999,99.9],[1000,100],[1200,100],[1500,100]]){
  assert.ok(Math.abs(app.getGrowthProgress(hp)-percent)<1e-9);
  const saved=withHP(hp),storage={[key]:JSON.stringify(saved)},ui=(await page(storage));
  assert.equal(ui.get('progressText').textContent,`${percent}% grown`);assert.ok(Math.abs(parseFloat(ui.get('progressFill').style.width)-percent)<1e-9);
  assert.equal(ui.get('currentHP').textContent,Math.min(hp,1000).toLocaleString('en-US'));assert.equal(ui.get('totalHP').textContent,Math.min(hp,1000).toLocaleString('en-US'));
  assert.equal(ui.get('growthProgress').getAttribute('aria-valuenow'),Math.min(hp,1000));assert.equal(ui.get('growthProgress').getAttribute('aria-valuemax'),1000);
  assert.equal(ui.get('treeStage').textContent==='Fully Grown Happiness Tree',hp>=1000);
  assert.equal(JSON.parse(storage[key]).hp,Math.min(hp,1000));
 }
});
check('Universal goal applies across months and years, including historical and future saved records',async()=>{
 for(const year of [1900,2000,2026,2027,2028,2100])for(let month=1;month<=12;month++){
  const key=year+'-'+String(month).padStart(2,'0'),s=defaultState(key+'-01');assert.equal(s.monthlyTrees[key].target,1000);
 }
 const saved=withHP(1200);saved.monthlyTrees['2026-11'].target=600;
 saved.monthlyTrees['2025-02']={hp:600,target:600,startDate:'2025-02-01',completedDate:'2025-02-28'};
 saved.monthlyTrees['2028-02']={hp:1500,target:435,startDate:'2028-02-01',completedDate:'2028-02-29'};
 const before=JSON.stringify(saved),normalized=validateState(saved,day);assert.equal(JSON.stringify(saved),before);
 for(const month of Object.keys(saved.monthlyTrees)){assert.equal(normalized.monthlyTrees[month].hp,Math.min(1000,saved.monthlyTrees[month].hp));assert.equal(normalized.monthlyTrees[month].target,1000);}
 assert.deepEqual(normalized.entries,saved.entries);assert.deepEqual(normalized.completedTrees,saved.completedTrees);
});
check('Selected-month tree and guide follow calendar/graph navigation without creating records',async()=>{
 const saved=withHP(250);saved.monthlyTrees['2026-10']={hp:600,target:600,startDate:'2026-10-01',completedDate:'2026-10-31'};
 const storage={[key]:JSON.stringify(saved)},ui=(await page(storage)),before=storage[key];
 await ui.get('previousMonth').listeners.click();assert.match(ui.get('treeMonth').textContent,/October 2026/);assert.equal(ui.get('progressText').textContent,'60% grown');assert.equal(ui.get('currentHP').textContent,'600');
 assert.equal(ui.get('monthlyTargetInfo').textContent,'October 2026: 1,000 HP monthly maximum.');
 await ui.get('openMonthlyGraph').listeners.click();await ui.get('graphNextMonth').listeners.click();assert.equal(ui.get('progressText').textContent,'25% grown');
 await ui.get('graphNextMonth').listeners.click();assert.match(ui.get('treeMonth').textContent,/December 2026/);assert.equal(ui.get('progressText').textContent,'0% grown');assert.equal(ui.get('instructionGrowthTarget').textContent,'1,000');
 assert.equal(storage[key],before);assert.equal(JSON.parse(storage[key]).monthlyTrees['2026-12'],undefined);
});
check('Old 600 HP backups restore safely with the universal goal and over-limit balances remain explicitly archived',async()=>{
 const saved=withHP(1200);saved.monthlyTrees['2026-11'].target=600;
 const code=fs.readFileSync('script.js','utf8');const scope={module:{exports:{}},console};vm.runInNewContext(code,scope);
 const restored=vm.runInNewContext(`readBackup(${JSON.stringify(JSON.stringify({format:'my-happiness-tracker',version:1,state:saved}))})`,scope);
 assert.equal(restored.hp,1000);assert.equal(restored.monthlyTrees['2026-11'].hp,1000);assert.equal(restored.monthlyTrees['2026-11'].preCapHP,1200);assert.equal(restored.monthlyTrees['2026-11'].target,1000);
 const s=withHP(1200);assert.equal(addReflection(s,input('happy'),day).locked,true);assert.equal(s.hp,1000);assert.equal(app.getGrowthProgress(s.hp),100);
});
check('Daily base maximum is 36 HP with only three rewarded words across submissions and refreshes',async()=>{
 let s=defaultState(day);
 const r=addReflection(s,input('happy peaceful joyful wonderful beautiful sunshine memories today','Grateful',{memory:true,gratitude:true}),day);
 assert.equal(r.points,36);assert.equal(reward(r,'Positive words'),6);assert.equal(r.newWords.length,3);
 s=validateState(JSON.parse(JSON.stringify(s)),day);
 assert.equal(addReflection(s,input('lovely kind hopeful memories of this afternoon','Grateful',{memory:true,gratitude:true}),day).points,0);
 assert.equal(addReflection(s,input('happy peaceful joyful wonderful beautiful sunshine memories today','Grateful',{memory:true,gratitude:true}),next).points,36);
 const split=defaultState(day);assert.equal(addReflection(split,input('happy'),day).points,17);
 assert.equal(addReflection(split,input('happy peaceful'),day).points,2);
 assert.equal(addReflection(split,input('joyful wonderful'),day).points,2);
 assert.equal(addReflection(split,input('beautiful'),day).points,0);
});
check('Every month length obeys the monthly cap, reconciles daily awards and starts the next month at zero',async()=>{
 for(const month of ['2027-02','2028-02','2026-04','2026-12']){
  const count=new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate();
  let s=defaultState(month+'-01');
  for(let d=1;d<=count;d++){
   const date=month+'-'+String(d).padStart(2,'0');
   addReflection(s,input('happy peaceful joyful wonderful this was a lovely afternoon','Grateful',{memory:true,gratitude:true}),date);
   addReflection(s,input('happy kind hopeful memories of this afternoon','Grateful',{memory:true,gratitude:true}),date);
   s=validateState(JSON.parse(JSON.stringify(s)),date);
   assert.ok(s.hp<=1000);
  }
  assert.equal(s.hp,Math.min(1000,count*36));
  assert.equal(s.entries.reduce((sum,e)=>sum+e.points,0),s.hp);
  assert.equal([...app.monthlyDailyPoints(s,month).values()].reduce((a,b)=>a+b,0),s.hp);
  const old=s.hp;ensureMonthlyTree(s,localDateKey(new Date(Number(month.slice(0,4)),Number(month.slice(5)),1,12)));
  assert.equal(s.hp,0);assert.equal(s.monthlyTrees[month].hp,old);
 }
});
check('Partial rewards, locked submissions and historical migration remain accurate in graphs and backups',async()=>{
 const s=withHP(995);s.rewardedDates.push(day);s.moodRewardedDates.push(day);
 const result=addReflection(s,input('The rain fell beside the river.'),next);
 assert.equal(result.calculatedReward,15);assert.equal(result.points,5);assert.equal(s.entries[0].points,5);assert.equal(s.hp,1000);
 const after=addReflection(s,input('happy'),next);assert.equal(after.locked,true);assert.equal(s.entries.length,1);
 const old=withHP(1200);old.hpPolicyVersion=undefined;
 old.entries=[{id:'original',date:day,time:'09:00',mood:'Happy',journal:'original memory',points:1200}];
 const raw=JSON.stringify(old),storage={[key]:raw},ui=(await page(storage));
 assert.equal(storage[key+'BeforeMonthlyCap'],raw);
 const migrated=JSON.parse(storage[key]);assert.equal(migrated.hp,1000);assert.equal(migrated.monthlyTrees['2026-11'].preCapHP,1200);
 assert.deepEqual(migrated.entries,validateState(old,day).entries);
 await ui.get('openMonthlyGraph').listeners.click();assert.equal(ui.get('dailyPointsTotal').textContent,'1000 HP');assert.match(ui.get('graphSummary').textContent,/Original pre-limit balance: 1,200 HP/);
 const first=storage[key];(await page(storage));assert.equal(storage[key],first);assert.equal(storage[key+'BeforeMonthlyCap'],raw);
});
check('A ten-point reward at 995 HP awards exactly five in every month length',async()=>{
 for(const month of ['2027-02','2028-02','2026-04','2026-12']){
  const date=month+'-01',s=withHP(995,date);s.moodRewardedDates.push(date);
  const r=addReflection(s,input('The rain fell beside the river.'),date);
  assert.equal(r.calculatedReward,10);assert.equal(r.points,5);assert.equal(s.hp,1000);
  assert.equal(addReflection(s,input('happy'),date).locked,true);
  assert.equal(s.entries.length,1);assert.equal(s.entries.reduce((n,e)=>n+e.points,0),5);
 }
});
check('Previously rewarded words prevent duplicate or excess word bonuses after migration',async()=>{
 const saved=defaultState(day);saved.rewardedWordsByDate[day]=['happy','peaceful','joyful','wonderful'];
 saved.moodRewardedDates.push(day);saved.rewardedDates.push(day);
 const migrated=validateState(saved,day);
 const r=addReflection(migrated,input('happy wonderful lovely kind'),day);
 assert.equal(r.points,0);assert.equal(r.newWords.length,0);
 assert.equal(reward(addReflection(migrated,input('happy peaceful joyful wonderful'),next),'Positive words'),6);
});
check('Reaching 1,000 mid-month locks every new submission while saved memories remain viewable',async()=>{
 const saved=withHP(995),storage={[key]:JSON.stringify(saved)},ui=(await page(storage));
 await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 const complete=JSON.parse(storage[key]);assert.equal(complete.hp,1000);assert.equal(complete.entries[0].points,5);
 for(const id of ['journalText','happyMemory','gratitude','saveBtn'])assert.equal(ui.get(id).disabled,true);
 assert.ok(ui.moods.every(b=>b.disabled));assert.equal(ui.get('monthlyLockMessage').textContent,app.MONTHLY_LOCK_MESSAGE);
 const unchanged=storage[key];await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key],unchanged);
 const cell=ui.get('calendarDays').children.find(c=>c.dataset.date===day);await cell.listeners.click();assert.equal(ui.get('journalDialog').open,true);assert.equal(ui.get('journalDialogEntries').children.length,1);
 await ui.get('closeJournalDialog').listeners.click();await ui.get('openMonthlyGraph').listeners.click();assert.equal(ui.get('dailyPointsTotal').textContent,'1000 HP');await ui.get('closeMonthlyGraph').listeners.click();
 const reopened=(await page(storage));assert.equal(reopened.get('saveBtn').disabled,true);assert.equal(reopened.get('monthlyLockMessage').textContent,app.MONTHLY_LOCK_MESSAGE);
});
check('The next month automatically unlocks the form and preserves the fully grown previous month',async()=>{
 const saved=withHP(995),storage={[key]:JSON.stringify(saved)},ui=(await page(storage));
 await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 const entries=JSON.parse(storage[key]).entries;await ui.tick('2026-12-01');
 for(const id of ['journalText','happyMemory','gratitude','saveBtn'])assert.equal(ui.get(id).disabled,false);
 assert.ok(ui.moods.every(b=>b.disabled===false));assert.equal(ui.get('monthlyLockMessage').hidden,true);assert.equal(ui.get('feedback').textContent,'');
 let current=JSON.parse(storage[key]);assert.equal(current.hp,0);assert.equal(current.monthlyTrees['2026-11'].hp,1000);assert.deepEqual(current.entries,entries);
 await ui.get('previousMonth').listeners.click();assert.equal(ui.get('saveBtn').disabled,false);await ui.get('nextMonth').listeners.click();
 await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 current=JSON.parse(storage[key]);assert.equal(current.hp,5);assert.equal(current.monthlyTrees['2026-11'].hp,1000);assert.equal(current.entries.length,entries.length+1);
 await ui.tick('2026-12-01');assert.equal(Object.keys(JSON.parse(storage[key]).monthlyTrees).length,2);
});
check('Daily limits account for earlier historical awards and the API rejects locked months without adding entries',async()=>{
 const s=defaultState(day);s.entries.push({date:day,journal:'historical',mood:'Happy',points:35,time:'09:00'});s.hp=35;s.monthlyTrees['2026-11'].hp=35;
 const result=addReflection(s,input('happy peaceful joyful a beautiful afternoon','Grateful',{memory:true,gratitude:true}),day);
 assert.equal(result.points,1);assert.equal(s.hp,36);assert.equal(addReflection(s,input('wonderful'),day).points,0);
 for(const date of ['2027-02-10','2028-02-10','2026-04-10','2026-12-10']){
  const locked=withHP(1000,date),before=JSON.stringify(locked);const result=addReflection(locked,input('happy'),date);
  assert.equal(result.error,app.MONTHLY_LOCK_MESSAGE);assert.equal(result.locked,true);assert.equal(JSON.stringify(locked),before);
 }
});

check('F1 concurrent submissions serialize, merge entries, recalculate daily rewards and synchronize tabs',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))},a=await page(storage),b=await page(storage);
 await a.moods[0].listeners.click();a.get('journalText').value='happy';
 await b.moods[2].listeners.click();b.get('journalText').value='peaceful';
 await b.get('openMonthlyGraph').listeners.click();
 await Promise.all([a.get('reflectionForm').listeners.submit({preventDefault(){}}),b.get('reflectionForm').listeners.submit({preventDefault(){}})]);
 const saved=JSON.parse(storage[key]);assert.equal(saved.entries.length,2);assert.equal(saved.hp,19);assert.equal(saved.entries.reduce((n,e)=>n+e.points,0),19);assert.ok(saved.revision>=3);app.assertDiaryDocument(saved);
 a.window.listeners.storage({key});b.window.listeners.storage({key});
 assert.equal(a.get('currentHP').textContent,'19');assert.equal(b.get('dailyPointsTotal').textContent,'19 HP');assert.match(a.get('storageNotice').textContent,/another tab/);
});
check('F1 conflicting edits preserve the newer saved text and the losing draft',async()=>{
 const seed=defaultState(day);addReflection(seed,input('Original happy memory'),day);
 const storage={[key]:JSON.stringify(seed)},a=await page(storage),b=await page(storage);
 const editor=async ui=>{await ui.get('calendarDays').children.find(c=>c.dataset.date===day).listeners.click();const card=ui.get('journalDialogEntries').children[0];await card.children[2].listeners.click();return {text:card.children[3].children[0],form:card.children[3],feedback:card.children[4]};};
 const first=await editor(a),second=await editor(b);first.text.value='Edit from first tab';second.text.value='Keep this second draft';
 await first.form.listeners.submit({preventDefault(){}});const committed=storage[key];b.window.listeners.storage({key});
 await second.form.listeners.submit({preventDefault(){}});
 assert.equal(storage[key],committed);assert.equal(JSON.parse(storage[key]).entries[0].journal,'Edit from first tab');assert.equal(second.text.value,'Keep this second draft');assert.equal(second.form.hidden,false);assert.match(second.feedback.textContent,/Another tab edited/);
});
check('F1 independent entry edits merge without changing HP',async()=>{
 const seed=defaultState(day);addReflection(seed,input('First reflection'),day,'09:00');addReflection(seed,input('Second reflection'),day,'10:00');
 const storage={[key]:JSON.stringify(seed)},a=await page(storage),b=await page(storage);
 const edit=async(ui,index,text)=>{await ui.get('calendarDays').children.find(c=>c.dataset.date===day).listeners.click();const card=ui.get('journalDialogEntries').children[index];await card.children[2].listeners.click();card.children[3].children[0].value=text;return ()=>card.children[3].listeners.submit({preventDefault(){}});};
 const one=await edit(a,0,'New second reflection'),two=await edit(b,1,'New first reflection');await Promise.all([one(),two()]);
 const saved=JSON.parse(storage[key]);assert.deepEqual(saved.entries.map(e=>e.journal),['New second reflection','New first reflection']);assert.equal(saved.hp,seed.hp);
});
check('F1 safe saving blocks without Web Locks instead of using a racy fallback',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))},raw=storage[key],ui=await page(storage,day,{locking:false});await ui.moods[0].listeners.click();ui.get('journalText').value='Keep my draft';await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 assert.equal(storage[key],raw);assert.equal(ui.get('journalText').value,'Keep my draft');assert.match(ui.get('feedback').textContent,/Web Locks/);
});
check('F2 malformed, null and structurally corrupt storage is quarantined and downloadable verbatim',async()=>{
 for(const raw of ['{broken','null','[]',JSON.stringify({version:4,hp:0,entries:[],completedTrees:[]})]){
  const storage={[key]:raw},ui=await page(storage);assert.equal(ui.get('saveBtn').disabled,true);assert.match(ui.get('storageNotice').textContent,/not been overwritten/);
  await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key],raw);
  await ui.get('downloadOriginal').listeners.click();assert.equal(await ui.download().text(),raw);
 }
});
check('F2 explicit restore archives corrupt raw data and preserves existing backup keys',async()=>{
 const raw='{broken history',storage={[key]:raw,[key+'BeforeIntegrityV1']:'existing backup'},ui=await page(storage,day,{confirm:()=>true});
 await ui.get('backupBtn').listeners.click();const file=ui.get('backupFile');file.files=[{text:async()=>JSON.stringify({format:'my-happiness-tracker',version:1,state:defaultState(day)})}];await file.listeners.change();
 assert.equal(JSON.parse(storage[key]).hp,0);assert.ok(Object.entries(storage).some(([k,v])=>k.startsWith(key+'BeforeRestore-')&&v===raw));assert.equal(storage[key+'BeforeIntegrityV1'],'existing backup');assert.equal(ui.get('downloadOriginal').hidden,true);
});
check('F2 unavailable storage never silently becomes a writable empty diary',async()=>{
 const ui=await page({},day,{read(){throw Error('Storage blocked');}});await ui.moods[0].listeners.click();ui.get('journalText').value='Unsaved';await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 assert.match(ui.get('storageNotice').textContent,/Storage blocked/);assert.equal(ui.get('journalText').value,'Unsaved');assert.match(ui.get('feedback').textContent,/Not saved/);
});
check('F3 quota failure preserves every field and retry awards HP exactly once',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))};let fail=false;const ui=await page(storage,day,{write(k,v){if(fail)throw Error('QuotaExceededError');storage[k]=v;}}),before=storage[key];
 await ui.moods[1].listeners.click();ui.get('journalText').value='happy peaceful joyful memories of this beautiful afternoon';ui.get('happyMemory').checked=true;ui.get('gratitude').checked=true;fail=true;
 await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key],before);assert.match(ui.get('feedback').textContent,/Not saved/);assert.equal(ui.get('happyMemory').checked,true);assert.equal(ui.get('gratitude').checked,true);assert.ok(ui.get('journalText').value);
 fail=false;await ui.get('reflectionForm').listeners.submit({preventDefault(){}});const saved=JSON.parse(storage[key]);assert.equal(saved.entries.length,1);assert.equal(saved.hp,36);assert.equal(saved.entries[0].mood,'Grateful');assert.equal(ui.get('journalText').value,'');
});
check('F3 retry after a committed write with failed confirmation is idempotent',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))};let trigger=false,throwNext=false;const ui=await page(storage,day,{write(k,v){storage[k]=v;if(trigger&&k===key)throwNext=true;},read(k){if(throwNext&&k===key){throwNext=false;throw Error('Confirmation failed');}return storage[k]||null;}});
 await ui.moods[0].listeners.click();ui.get('journalText').value='happy';trigger=true;await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.match(ui.get('feedback').textContent,/Not saved/);assert.equal(JSON.parse(storage[key]).entries.length,1);
 trigger=false;await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(JSON.parse(storage[key]).entries.length,1);assert.equal(JSON.parse(storage[key]).hp,17);
});
check('F4 backup validation rejects invalid IDs, points, times, months and accounting without mutation',async()=>{
 let raw=null;const storage={getItem:k=>k===key?raw:null,setItem:(k,v)=>{if(k===key)raw=v;}};const store=app.createDiaryStore({storage,locks:{request:(n,o,f)=>Promise.resolve().then(f)},date:()=>day});
 await store.transaction(s=>addReflection(s,input('happy'),day,'09:00','test-entry'));
 const valid=JSON.parse(raw),original=JSON.stringify(valid);
 const mutations=[s=>s.entries.push({...s.entries[0]}),s=>s.entries[0].points=-1,s=>s.entries[0].points=NaN,s=>s.entries[0].time='25:99',s=>s.entries[0].monthId='2026-10',s=>delete s.monthlyTrees['2026-11'],s=>s.monthlyTrees['2026-11'].hp++,s=>s.entries[0].rewardBreakdown[0].points++,s=>s.rewardedWordsByDate[day]=[],s=>s.entries[0].createdAt='not-a-date'];
 for(const mutate of mutations){const bad=JSON.parse(original);mutate(bad);assert.throws(()=>app.readBackup(JSON.stringify({format:'my-happiness-tracker',version:1,state:bad})));assert.equal(raw,original);}
 const duplicate=JSON.parse(original);duplicate.entries.push({...duplicate.entries[0],id:'different-id'});duplicate.hp+=17;duplicate.monthlyTrees['2026-11'].hp+=17;assert.throws(()=>app.assertDiaryDocument(duplicate),/Duplicate daily|Daily reward|positive-word/);
 assert.equal(app.readBackup(JSON.stringify({format:'my-happiness-tracker',version:1,state:valid})).entries.length,1);
});
check('F4 missing historical months reject while supported legacy backups retain all original records',async()=>{
 const bad=defaultState(day);bad.entries=[{id:'older',date:'2026-10-01',time:'09:00',mood:'Happy',journal:'old',points:42}];assert.throws(()=>app.readBackup(JSON.stringify({format:'my-happiness-tracker',version:1,state:bad})),/no matching monthly/);
 const raw=JSON.stringify(legacy),restored=app.readBackup(raw);assert.deepEqual(restored.entries,legacy.entries);assert.deepEqual(restored.completedTrees,legacy.completedTrees);assert.equal(restored.monthlyTrees['2026-11'].hp,255);assert.equal(restored.monthlyTrees['2026-11'].accounting.openingHP,255);assert.match(restored.monthlyTrees['2026-11'].accounting.note,/legacy balance/);assert.equal(JSON.stringify(legacy),raw);
});
check('F4 stale restore and failed archive writes leave the current diary untouched',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))},a=await page(storage),b=await page(storage,day,{confirm:()=>true});await b.get('backupBtn').listeners.click();let release;const file=b.get('backupFile');file.files=[{text:()=>new Promise(r=>release=r)}];const pending=file.listeners.change();
 await a.moods[0].listeners.click();await a.get('reflectionForm').listeners.submit({preventDefault(){}});const latest=storage[key];release(JSON.stringify({format:'my-happiness-tracker',version:1,state:defaultState(day)}));await pending;assert.equal(storage[key],latest);assert.match(b.get('backupFeedback').textContent,/Another tab changed/);
 let fail=false;const ui=await page(storage,day,{confirm:()=>true,write(k,v){if(fail)throw Error('Archive storage full');storage[k]=v;}});await ui.get('backupBtn').listeners.click();ui.get('backupFile').files=[{text:async()=>JSON.stringify({format:'my-happiness-tracker',version:1,state:defaultState(day)})}];fail=true;await ui.get('backupFile').listeners.change();assert.equal(storage[key],latest);assert.match(ui.get('backupFeedback').textContent,/Archive storage full/);
});
check('F4 legacy numeric IDs and original unknown metadata survive migration and later writes',async()=>{
 const old=JSON.parse(JSON.stringify(legacy));old.entries[0].id=123456;old.originalNote={keep:'all original metadata'};
 const normalized=app.readBackup(JSON.stringify(old));assert.equal(normalized.entries[0].id,123456);assert.deepEqual(normalized.originalNote,old.originalNote);app.assertDiaryDocument(normalized);
 const storage={[key]:JSON.stringify(old)},ui=await page(storage);await ui.moods[0].listeners.click();await ui.get('reflectionForm').listeners.submit({preventDefault(){}});
 const saved=JSON.parse(storage[key]);assert.equal(saved.entries.find(e=>e.id===123456).points,15);assert.deepEqual(saved.originalNote,old.originalNote);assert.equal(storage[key+'BeforeIntegrityV1'],JSON.stringify(old));
});
check('F4 ambiguous legacy accounting requires explicit review even in an empty browser',async()=>{
 let allow=false;const target={},ui=await page(target,day,{confirm:()=>allow});const file=ui.get('backupFile');file.files=[{text:async()=>JSON.stringify(legacy)}];await file.listeners.change();assert.equal(target[key],undefined);
 allow=true;file.files=[{text:async()=>JSON.stringify(legacy)}];await file.listeners.change();const restored=JSON.parse(target[key]);assert.equal(restored.hp,255);assert.equal(restored.legacyReview.required,false);assert.deepEqual(restored.entries,legacy.entries);
 const memory={};const store=app.createDiaryStore({storage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v},locks:{request:(n,o,f)=>Promise.resolve().then(f)},date:()=>day});await assert.rejects(store.restore(app.readBackup(JSON.stringify(legacy)),null),/explicit review/);assert.equal(memory[key],undefined);
});
check('F3 transient storage read failure keeps the draft retryable without replacing old history',async()=>{
 const storage={[key]:JSON.stringify(defaultState(day))};let fail=false;const ui=await page(storage,day,{read(k){if(fail){fail=false;throw Error('Temporary read failure');}return storage[k]||null;}}),before=storage[key];
 await ui.moods[0].listeners.click();ui.get('journalText').value='happy';fail=true;await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(storage[key],before);assert.equal(ui.get('journalText').value,'happy');assert.equal(ui.get('saveBtn').disabled,false);
 await ui.get('reflectionForm').listeners.submit({preventDefault(){}});assert.equal(JSON.parse(storage[key]).entries.length,1);assert.equal(JSON.parse(storage[key]).hp,17);
});
async function checkBackupRestore(){
 let source=withHP(598);
 addReflection(source,input('happy and peaceful'),day);
 const original={[key]:JSON.stringify(source)},oldBrowser=(await page(original));source=JSON.parse(original[key]);
 await oldBrowser.get('backupBtn').listeners.click();
 await oldBrowser.get('downloadBackup').listeners.click();
 const backup=await oldBrowser.download().text();
 assert.deepEqual(JSON.parse(backup).state,source);
 assert.equal(original[key],JSON.stringify(source));

 const target={},newBrowser=(await page(target));
 assert.equal(newBrowser.get('backupDialog').open,true);
 async function restore(browser,text){
  const file=browser.get('backupFile');
  file.files=[{text:async()=>text}];
  await file.listeners.change();
 }
 await restore(newBrowser,'{"format":"unrelated"}');
 assert.equal(target[key],undefined);
 assert.match(newBrowser.get('backupFeedback').textContent,/valid My Happiness Diary/);
 await restore(newBrowser,backup);
 const restored=JSON.parse(target[key]);
 assert.deepEqual(restored.entries,source.entries);assert.deepEqual(restored.monthlyTrees,source.monthlyTrees);assert.equal(restored.hp,source.hp);
 assert.equal(calculatePoints(restored,input('happy and peaceful'),day).points,0);
 assert.equal(newBrowser.get('backupDialog').open,false);
 assert.equal(newBrowser.get('currentHP').textContent,Math.min(source.hp,1000).toLocaleString('en-US'));
 assert.equal((await page(target)).get('backupDialog').open,false);

 const current={[key]:JSON.stringify(withHP(10))};let before;
 let confirmed=0;
 const existing=(await page(current,day,{confirm:()=>++confirmed===2}));before=current[key];
 await existing.get('backupBtn').listeners.click();
 await restore(existing,backup);
 assert.equal(current[key],before);
 await restore(existing,backup);
 assert.deepEqual(JSON.parse(current[key]).entries,JSON.parse(target[key]).entries);assert.equal(JSON.parse(current[key]).hp,JSON.parse(target[key]).hp);
 const unavailable=(await page({},day,{write:()=>{throw new Error('Storage full');}}));
 await restore(unavailable,backup);
 assert.equal(unavailable.get('currentHP').textContent,'0');
 assert.match(unavailable.get('backupFeedback').textContent,/Storage full/);
 console.log('PASS Backup round trip, first-visit prompt, validation, replacement and failed writes');
 console.log(`${checks+1} checks passed.`);
}
(async()=>{let failures=0;for(const [name,fn]of tests){try{await fn();checks++;console.log('PASS '+name);}catch(error){failures++;console.error('FAIL '+name+' '+error.message);}}try{await checkBackupRestore();}catch(error){failures++;console.error('FAIL Backup/restore '+error.message);}if(failures)process.exitCode=1;})().catch(error=>{console.error(error);process.exitCode=1;});
