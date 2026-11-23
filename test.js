const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const app=require('./script.js');
const {defaultState,validateState,addReflection,calculatePoints,ensureMonthlyTree,getStageIndex,calendarCells,localDateKey,groupJournalEntries,MOOD_EMOJIS,treeSVG}=app;
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
const day='2026-11-20',next='2026-11-21';
const input=(journal='',mood='Calm',extra={})=>({journal,mood,...extra});
const reward=(result,label)=>result.reasons.find(r=>r.label===label)?.points||0;
function withHP(hp,date=day){const s=defaultState(date);s.monthlyTrees[date.slice(0,7)].hp=hp;s.hp=hp;return s;}
check('Every new month has a 600 HP growth target',()=>{
 for(const month of ['2027-02','2028-02','2026-04','2026-12'])assert.equal(defaultState(month+'-01').monthlyTrees[month].target,600);
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
check('Crossing 600 HP completes the tree and later entries still earn points',()=>{
 const s=withHP(598);const r=addReflection(s,input('happy'),day);assert.equal(r.points,20);assert.equal(s.hp,618);
 assert.equal(s.monthlyTrees['2026-11'].completedDate,day);
 assert.equal(addReflection(s,input('peaceful'),next).points,20);assert.equal(s.entries.length,2);
 assert.equal(s.monthlyTrees['2026-11'].hp,638);assert.equal(s.completedTrees.length,0);
 assert.equal(s.monthlyTrees['2026-11'].completedDate,day);
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
 const s=validateState(old,day);assert.equal(s.hp,350);assert.equal(s.monthlyTrees['2026-11'].target,600);assert.deepEqual(s.rewardedWordsByDate[day],['happy']);assert.equal(s.completedTrees[0].hp,350);
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
 setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k];}append(...c){this.children.push(...c);}replaceChildren(...c){this.children=c;}remove(){}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}focus(){this.focused=true;}addEventListener(t,fn){this.listeners[t]=fn;}reset(){}click(){}
}
function page(storage,date=day,{confirm=()=>false,write=(key,value)=>storage[key]=value}={}){
 const elements=new Map([...fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const get=id=>{assert.ok(elements.has(id),'Missing element '+id);return elements.get(id);};
 const moods=['Happy','Grateful','Calm','Excited','Neutral'].map(m=>{const e=new Element();e.dataset.mood=m;return e;});
 let clock=date;class Clock extends Date{constructor(...args){super(...(args.length?args:[clock+'T12:00:00']));}static now(){return new Date(clock+'T12:00:00').getTime();}}
 const document={body:new Element(),hidden:false,listeners:{},addEventListener(t,fn){this.listeners[t]=fn;},getElementById:get,querySelectorAll:()=>moods,querySelector:()=>new Element(),createElement:()=>new Element()};let timer;
 let download;
 vm.runInNewContext(fs.readFileSync('script.js','utf8'),{document,Date:Clock,localStorage:{getItem:k=>storage[k]||null,setItem:write},window:{confirm},setInterval:fn=>{timer=fn;},setTimeout,Blob,URL:{createObjectURL(blob){download=blob;return 'blob:test';},revokeObjectURL(){}},console});
 return {get,moods,document,download:()=>download,tick(date){clock=date;timer();}};
}
const key='myHappinessTrackerV1';
check('Current tree migrates to 600 HP while past targets and surplus points are preserved',()=>{
 const previous=withHP(465,'2026-10-31').monthlyTrees['2026-10'];
 previous.completedDate='2026-10-31';
 previous.target=465;
 const saved=withHP(450);
 saved.monthlyTrees['2026-10']=previous;
 Object.assign(saved.monthlyTrees['2026-11'],{target:450,completedDate:day});
 const storage={[key]:JSON.stringify(saved)};
 const ui=page(storage);
 const migrated=JSON.parse(storage[key]);
 assert.deepEqual(migrated.monthlyTrees['2026-10'],previous);
 assert.equal(migrated.monthlyTrees['2026-11'].completedDate,null);
 assert.equal(ui.get('targetHP').textContent,600);
 const full=page({[key]:JSON.stringify(withHP(650))});
 assert.equal(full.get('currentHP').textContent,650);
 assert.equal(full.get('progressText').textContent,'100% grown');
 assert.equal(full.get('progressFill').style.width,'100%');
});
check('UI migrates once and displays November 255/600 with dynamic instructions',()=>{
 const storage={[key]:JSON.stringify(legacy)},ui=page(storage);assert.equal(ui.get('currentHP').textContent,255);assert.equal(ui.get('targetHP').textContent,600);assert.equal(ui.get('progressText').textContent,'43% grown');assert.match(ui.get('treeMonth').textContent,/November 2026/);assert.match(ui.get('monthlyTargetInfo').textContent,/600 HP/);
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
 assert.match(html,/Even the smallest moments can bring happiness\. Take a moment to\s+remember yours\./);
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
check('Editing journal text preserves rewards and rolls back failed writes',()=>{
 const saved=defaultState(day);
 addReflection(saved,input('happy and peaceful'),day,'09:00');
 addReflection(saved,input('','Neutral'),day,'12:00');
 const original=JSON.stringify(saved),storage={[key]:original};
 let fail=true;
 const ui=page(storage,day,{write(key,value){if(fail)throw Error('Storage full');storage[key]=value;}});
 const cell=ui.get('calendarDays').children.find(cell=>cell.dataset.date===day);
 cell.listeners.click();
 const [moodOnly,written]=ui.get('journalDialogEntries').children;
 assert.equal(moodOnly.children.length,2);
 const [,reflection,edit,form,feedback]=written.children;
 const [text,actions]=form.children;
 const [,cancel]=actions.children;
 const submit=()=>form.listeners.submit({preventDefault(){}});
 edit.listeners.click();
 assert.equal(text.value,'happy and peaceful');
 text.value='   ';
 submit();
 assert.match(feedback.textContent,/Enter some text/);
 text.value='Discard this draft';
 cancel.listeners.click();
 assert.equal(storage[key],original);
 assert.equal(form.hidden,true);
 edit.listeners.click();
 text.value='Revised reflection';
 submit();
 assert.equal(storage[key],original);
 assert.equal(reflection.textContent,'happy and peaceful');
 assert.equal(form.hidden,false);
 fail=false;
 submit();
 const expected=JSON.parse(original);
 expected.entries.find(entry=>entry.journal).journal='Revised reflection';
 assert.deepEqual(JSON.parse(storage[key]),expected);
 assert.equal(reflection.textContent,'Revised reflection');
 assert.equal(edit.focused,true);
 ui.get('closeJournalDialog').listeners.click();
 cell.listeners.click();
 assert.equal(ui.get('journalDialogEntries').children[1].children[1].textContent,'Revised reflection');
});
check('Only today’s written reflections can be edited, including across midnight',()=>{
 const saved=defaultState(day);
 addReflection(saved,input('A past memory'),'2026-11-19');
 addReflection(saved,input('Today’s memory'),day);
 const original=JSON.stringify(saved),storage={[key]:original},ui=page(storage);
 const open=date=>ui.get('calendarDays').children.find(cell=>cell.dataset.date===date).listeners.click();
 open('2026-11-19');
 assert.equal(ui.get('journalDialogEntries').children[0].children.length,2);
 ui.get('closeJournalDialog').listeners.click();
 open(day);
 const [meta,reflection,edit,form,feedback]=ui.get('journalDialogEntries').children[0].children;
 edit.listeners.click();
 form.children[0].value='Late revision';
 ui.tick(next);
 form.listeners.submit({preventDefault(){}});
 assert.equal(storage[key],original);
 assert.equal(reflection.textContent,'Today’s memory');
 assert.equal(edit.hidden,true);
 assert.match(feedback.textContent,/Only today/);
});
check('Monthly graph adds daily HP and follows the selected calendar month',()=>{
 const saved=defaultState(day);
 addReflection(saved,input('','Calm'),day);
 addReflection(saved,input('happy','Calm'),day);
 addReflection(saved,input('','Happy'),'2026-12-01');
 ensureMonthlyTree(saved,day);
 const original=JSON.stringify(saved),storage={[key]:original},ui=page(storage);
 ui.get('nextMonth').listeners.click();
 ui.get('openMonthlyGraph').listeners.click();
 assert.equal(ui.get('monthlyGraphDialog').open,true);
 assert.equal(ui.get('graphMonth').textContent,ui.get('calendarMonth').textContent);
 assert.equal(ui.get('graphBars').children.length,31);
 assert.equal(ui.get('graphDailyPoints').children[0].textContent,'Day 1: 5 HP');
 ui.get('graphPreviousMonth').listeners.click();
 assert.equal(ui.get('graphBars').children.length,30);
 assert.equal(ui.get('graphScale').children[0].textContent,'100');
 assert.equal(ui.get('graphBars').children[19].style.height,'20%');
 assert.equal(ui.get('graphDailyPoints').children[19].textContent,'Day 20: 20 HP');
 assert.match(ui.get('graphSummary').textContent,/^20 HP/);
 ui.get('graphPreviousMonth').listeners.click();
 assert.match(ui.get('graphSummary').textContent,/No check-ins/);
 ui.get('closeMonthlyGraph').listeners.click();
 assert.equal(ui.get('monthlyGraphDialog').open,false);
 assert.equal(ui.get('openMonthlyGraph').focused,true);
 assert.equal(storage[key],original);
});
async function checkBackupRestore(){
 const source=withHP(598);
 addReflection(source,input('happy and peaceful'),day);
 const original={[key]:JSON.stringify(source)},oldBrowser=page(original);
 oldBrowser.get('backupBtn').listeners.click();
 oldBrowser.get('downloadBackup').listeners.click();
 const backup=await oldBrowser.download().text();
 assert.deepEqual(JSON.parse(backup).state,source);
 assert.equal(original[key],JSON.stringify(source));

 const target={},newBrowser=page(target);
 assert.equal(newBrowser.get('backupDialog').open,true);
 async function restore(browser,text){
  const file=browser.get('backupFile');
  file.files=[{text:async()=>text}];
  await file.listeners.change();
 }
 await restore(newBrowser,'{"format":"unrelated"}');
 assert.equal(target[key],undefined);
 assert.match(newBrowser.get('backupFeedback').textContent,/valid My Happiness Tracker/);
 await restore(newBrowser,backup);
 const restored=JSON.parse(target[key]);
 assert.deepEqual(restored,source);
 assert.equal(calculatePoints(restored,input('happy and peaceful'),day).points,0);
 assert.equal(newBrowser.get('backupDialog').open,false);
 assert.equal(newBrowser.get('currentHP').textContent,source.hp);
 assert.equal(page(target).get('backupDialog').open,false);

 const current={[key]:JSON.stringify(withHP(10))},before=current[key];
 let confirmed=0;
 const existing=page(current,day,{confirm:()=>++confirmed===2});
 existing.get('backupBtn').listeners.click();
 await restore(existing,backup);
 assert.equal(current[key],before);
 await restore(existing,backup);
 assert.equal(current[key],target[key]);
 const unavailable=page({},day,{write:()=>{throw new Error('Storage full');}});
 await restore(unavailable,backup);
 assert.equal(unavailable.get('currentHP').textContent,0);
 assert.match(unavailable.get('backupFeedback').textContent,/Storage full/);
 console.log('PASS Backup round trip, first-visit prompt, validation, replacement and failed writes');
 console.log(`${checks+1} checks passed.`);
}
checkBackupRestore().catch(error=>{console.error(error);process.exitCode=1;});
