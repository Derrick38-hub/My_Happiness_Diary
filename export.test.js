const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const XLSX=require('./assets/vendor/xlsx.full.min.js');const zip=require('./assets/vendor/fflate.min.js');
const Excel=require('./excel-export');const app=require('./script.js');
const formulas=['=SUM(1,2)','+SUM(1,2)','-1+1','@HYPERLINK("https://example.com")','\t=SUM(1,2)','A < B & "lovely"\n第二行 😊'];
const source={...app.defaultState('2026-11-20'),hp:255,monthlyTrees:{'2026-09':{month:'2026-09',target:450,hp:450},'2026-10':{month:'2026-10',target:465,hp:120},'2026-11':{month:'2026-11',target:450,hp:255}},completedTrees:[{id:1,completedDate:'2026-08-31',hp:350}],entries:formulas.map((journal,i)=>({id:i,date:i<3?'2026-11-20':'2026-10-01',time:'10:00 AM',mood:i%2?'Happy':'Neutral',journal,words:'',points:i*5}))};
let checks=0;function check(name,fn){fn();console.log('PASS '+name);checks++;}
const before=JSON.stringify(source),bytes=Excel.createFile(source,XLSX,zip),book=XLSX.read(bytes,{type:'array',cellNF:true,cellStyles:true});
check('Real SheetJS XLSX contains the three requested worksheets and all historical records',()=>{
 assert.deepEqual(book.SheetNames,['Happiness Journal','Monthly Tree Progress','Happiness Summary']);
 assert.equal(XLSX.utils.decode_range(book.Sheets['Happiness Journal']['!ref']).e.r,6);
 assert.equal(XLSX.utils.decode_range(book.Sheets['Monthly Tree Progress']['!ref']).e.r,4);
 assert.equal(book.Sheets['Monthly Tree Progress'].B2.v,450);assert.equal(book.Sheets['Monthly Tree Progress'].C4.v,255);
 assert.equal(book.Sheets['Monthly Tree Progress'].B5.v,350);assert.match(book.Sheets['Monthly Tree Progress'].A5.v,/Legacy Tree 1/);
 assert.equal(book.Sheets['Monthly Tree Progress'].E2.v,'Completed');assert.equal(book.Sheets['Monthly Tree Progress'].E3.v,'In Progress');
});
check('Every user reflection remains exact literal text, with no Excel formulas',()=>{
 const sheet=book.Sheets['Happiness Journal'];for(let i=0;i<formulas.length;i++){const cell=sheet['D'+(i+2)];assert.equal(cell.t,'s');assert.equal(cell.v,formulas[i]);assert.equal(cell.f,undefined);}
 for(const [path,data]of Object.entries(zip.unzipSync(bytes)))if(/worksheets\/sheet\d+\.xml/.test(path))assert.doesNotMatch(zip.strFromU8(data),/<f(?:\s|>)/);
 assert.equal(JSON.stringify(source),before);
});
check('Dates and percentages are numeric and have real Excel number formats',()=>{
 assert.equal(book.Sheets['Happiness Journal'].A2.z,'yyyy-mm-dd');assert.equal(book.Sheets['Happiness Journal'].A2.w,'2026-11-20');
 assert.equal(book.Sheets['Monthly Tree Progress'].A2.z,'mmmm yyyy');assert.equal(book.Sheets['Monthly Tree Progress'].D4.z,'0%');assert.equal(book.Sheets['Monthly Tree Progress'].D4.w,'57%');
 const leap=Excel.buildWorkbook({...source,entries:[{...source.entries[0],date:'2028-02-29'}]},XLSX);
 assert.equal(XLSX.SSF.format('yyyy-mm-dd',leap.Sheets['Happiness Journal'].A2.v),'2028-02-29');
});
check('Summary uses all tree balances without double-counting journal rewards and includes tied moods',()=>{
 const s=book.Sheets['Happiness Summary'];assert.equal(s.B2.v,6);assert.equal(s.B3.v,2);assert.equal(s.B4.v,1175);assert.equal(s.B5.v,2);assert.equal(s.B6.v,'Happy, Neutral');
});
check('Workbook has bold brand headers, wrap, widths, percentage formats, and frozen headers',()=>{
 const files=zip.unzipSync(bytes),styles=zip.strFromU8(files['xl/styles.xml']);
 assert.match(styles,/<b\/>/);assert.match(styles,/FF304F6D/);assert.match(styles,/FFE2F3FD/);assert.match(styles,/FFFFE1A0/);assert.match(styles,/wrapText="1"/);
 const journal=zip.strFromU8(files['xl/worksheets/sheet1.xml']);assert.match(journal,/<c r="A1"[^>]*s="1"/);assert.match(journal,/width="76/);assert.match(journal,/state="frozen"/);assert.match(journal,/showGridLines="0"/);
});
check('Empty data generates headers and a zero summary instead of failing',()=>{
 const empty=XLSX.read(Excel.createFile({entries:[],monthlyTrees:{},completedTrees:[]},XLSX,zip),{type:'array'});
 assert.equal(empty.Sheets['Happiness Journal']['!ref'],'A1:E1');assert.equal(empty.Sheets['Happiness Summary'].B2.v,0);assert.equal(empty.Sheets['Happiness Summary'].B4.v,0);assert.equal(empty.Sheets['Happiness Summary'].B6.v,'No moods recorded');
});
check('Missing libraries and overlong Excel cell data produce helpful errors',()=>{
 assert.throws(()=>Excel.createFile(source,null,zip),/library could not be loaded/);assert.throws(()=>Excel.createFile(source,XLSX,null),/formatting could not be loaded/);
 assert.throws(()=>Excel.createFile({...source,entries:[{...source.entries[0],journal:'x'.repeat(32768)}]},XLSX,zip),/32,767/);
});
class Element{
 constructor(){this.listeners={};this.style={};this.children=[];this.value='';this.checked=false;this.dataset={};this.attributes={};this.classList={add(){},remove(){},toggle(){}};this.open=false;}
 setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k];}append(...c){this.children.push(...c);}replaceChildren(){this.children=[];}addEventListener(t,fn){this.listeners[t]=fn;}focus(){}reset(){}showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}click(){this.clicked=true;}remove(){this.removed=true;}
}
async function testDownload(mode){
 const elements=new Map([...fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));const get=id=>elements.get(id);
 const local=JSON.stringify(source),writes=[];let blob,link;
 const document={body:new Element(),addEventListener(){},getElementById:get,querySelectorAll:()=>[],querySelector:()=>new Element(),createElement:tag=>{const e=new Element();if(tag==='a')link=e;return e;}};
 const context={document,Date,console,Blob,URL:{createObjectURL(value){blob=value;return 'blob:test';},revokeObjectURL(){}},localStorage:{getItem(){return local;},setItem(...args){writes.push(args);}},setInterval(){},setTimeout(fn){fn();},HappinessExcel:Excel,XLSX:mode==='missing'?null:XLSX,fflate:zip};
 // Match the runtime month to avoid a real monthly rollover during unrelated export tests.
 const snapshot=JSON.parse(local);snapshot.activeMonth=app.monthKey();snapshot.monthlyTrees[snapshot.activeMonth]||={hp:0,target:app.monthlyTarget(snapshot.activeMonth),month:snapshot.activeMonth};context.localStorage.getItem=()=>JSON.stringify(snapshot);
 vm.runInNewContext(fs.readFileSync('script.js','utf8'),context);writes.length=0;
 await get('exportBtn').listeners.click();assert.deepEqual(writes,[]);assert.equal(get('exportBtn').disabled,false);assert.equal(get('exportBtn').textContent,'Export to Excel');
 if(mode==='missing'){assert.match(get('exportFeedback').textContent,/Export failed/);assert.equal(blob,undefined);return;}
 assert.equal(link.download,`My_Happiness_Tracker_${app.localDateKey()}.xlsx`);assert.equal(link.clicked,true);assert.equal(link.removed,true);assert.match(blob.type,/spreadsheetml/);
 assert.equal(XLSX.read(await blob.arrayBuffer(),{type:'array'}).SheetNames.length,3);assert.match(get('exportFeedback').textContent,/download started/);
}
(async()=>{
 await testDownload('normal');console.log('PASS Actual export handler uses XLSX filename/MIME, restores controls and never writes storage');checks++;
 await testDownload('missing');console.log('PASS Actual export handler reports failures and restores controls without writing storage');checks++;
 console.log(`${checks} export checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
