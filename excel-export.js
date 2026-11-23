/* Excel export is read-only. SheetJS creates the workbook; fflate applies native XLSX styles. */
(function(root){
  'use strict';
  const HEADERS={journal:['Date','Time','Mood','Journal Reflection','Happiness Points Earned'],trees:['Month and Year','Monthly HP Target','Total HP Earned','Growth Percentage','Tree Status','Original Pre-limit HP']};
  const literal=value=>({t:'s',v:String(value??'')});
  const number=value=>({t:'n',v:Number.isFinite(value)?value:0});
  function excelDate(date){
    const [year,month,day]=date.split('-').map(Number);
    return {t:'n',v:(Date.UTC(year,month-1,day)-Date.UTC(1899,11,30))/86400000,z:'yyyy-mm-dd'};
  }
  function makeSheet(XLSX,headers,rows,widths){
    const data=[headers.map(literal),...rows];
    for(const row of data)for(const cell of row)if(cell.t==='s'&&cell.v.length>32767)throw new Error('One journal entry exceeds Excel’s 32,767-character cell limit. No data has been changed.');
    const sheet=XLSX.utils.aoa_to_sheet(data);
    sheet['!cols']=widths.map(wch=>({wch}));
    sheet['!rows']=data.map((row,index)=>({hpt:index===0?34:Math.min(409,Math.max(30,...row.map((cell,col)=>{
      if(cell.t!=='s')return 30;
      const lines=cell.v.split(/\r?\n/).reduce((sum,line)=>sum+Math.max(1,Math.ceil([...line].length/(widths[col]-3))),0);
      return lines*15+12;
    })))}));
    sheet['!autofilter']={ref:sheet['!ref']};
    return sheet;
  }
  function buildWorkbook(source,XLSX){
    if(!XLSX?.utils||!XLSX.write)throw new Error('The Excel library could not be loaded. Reload the page and try again.');
    const entries=Array.isArray(source.entries)?source.entries:[];
    const monthly=Object.entries(source.monthlyTrees||{}).filter(([month,t])=>/^\d{4}-\d{2}$/.test(month)&&t&&Number.isFinite(t.hp)&&Number.isFinite(t.target));
    const legacy=Array.isArray(source.completedTrees)?source.completedTrees:[];
    const ordered=[...entries].sort((a,b)=>b.date.localeCompare(a.date));
    const journals=ordered.map(e=>[
      excelDate(e.date),literal(e.time),literal(e.mood),
      // Force user-written text to a string cell, even when it begins with =, +, - or @.
      literal(e.journal),number(e.points)
    ]);
    const trees=monthly.sort(([a],[b])=>a.localeCompare(b)).map(([month,tree])=>[
      {...excelDate(month+'-01'),z:'mmmm yyyy'},number(1000),number(Math.min(1000,tree.hp)),
      {t:'n',v:Math.min(1,Math.max(0,tree.hp)/1000),z:'0%'},literal(tree.hp>=1000?'Completed':'In Progress'),number(tree.preCapHP||(tree.hp>1000?tree.hp:0))
    ]);
    legacy.forEach((tree,index)=>trees.push([
      literal(`Legacy Tree ${tree.id??index+1} (completed ${tree.completedDate})`),
      number(tree.target??350),number(tree.hp),{t:'n',v:tree.hp/(tree.target??350),z:'0%'},literal('Completed'),literal('Legacy record, unchanged')
    ]));
    const moodCounts=new Map();entries.forEach(e=>moodCounts.set(e.mood,(moodCounts.get(e.mood)||0)+1));
    const highest=Math.max(0,...moodCounts.values());
    const topMoods=[...moodCounts].filter(([,count])=>count===highest).map(([mood])=>mood).sort();
    const totalHP=monthly.reduce((sum,[,tree])=>sum+Math.min(1000,tree.hp),0)+legacy.reduce((sum,tree)=>sum+(Number.isFinite(tree.hp)?tree.hp:0),0);
    const completed=monthly.filter(([,tree])=>tree.hp>=1000).length+legacy.length;
    const summary=[
      [literal('Total Journal Entries'),number(entries.length)],
      [literal('Total Reflection Days'),number(new Set(entries.map(e=>e.date)).size)],
      [literal('Total Happiness Points Earned'),number(totalHP)],
      [literal('Completed Trees'),number(completed)],
      [literal('Most Frequently Selected Mood'),literal(topMoods.length?topMoods.join(', '):'No moods recorded')]
    ];
    const workbook=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,makeSheet(XLSX,HEADERS.journal,journals,[16,16,18,76,27]),'Happiness Journal');
    XLSX.utils.book_append_sheet(workbook,makeSheet(XLSX,HEADERS.trees,trees,[46,24,24,24,22,28]),'Monthly Tree Progress');
    const summarySheet=makeSheet(XLSX,['Metric','Value'],summary,[38,76]);
    summarySheet['A8']=literal('HP total basis');summarySheet['B8']=literal('Capped monthly balances plus unchanged legacy completed-tree balances. Original pre-limit balances are retained in the monthly sheet; journal rewards are not added again.');
    summarySheet['A9']=literal('Historical records');summarySheet['B9']=literal('Original pre-limit monthly balances are explicitly exported; historical journal awards and legacy trees remain unchanged. Reflection days count dates with a saved journal entry or mood check-in. Tied moods are listed together.');
    summarySheet['!ref']='A1:B9';summarySheet['!autofilter']={ref:'A1:B6'};summarySheet['!rows'][7]={hpt:44};summarySheet['!rows'][8]={hpt:58};
    XLSX.utils.book_append_sheet(workbook,summarySheet,'Happiness Summary');
    workbook.Props={Title:'My Happiness Diary',Subject:'Happiness memories and monthly tree progress',Author:'My Happiness Diary'};
    return workbook;
  }
  // CE writes values and number formats; these native OpenXML styles supply bold fonts,
  // palette fills and wrapping without a paid library or an HTML-to-spreadsheet conversion.
  function styleXml(){
    const xf=(font,fill,num=0)=>`<xf numFmtId="${num}" fontId="${font}" fillId="${fill}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1" applyNumberFormat="1"><alignment ${font===1?'horizontal="center" vertical="center"':'vertical="top"'} wrapText="1"/></xf>`;
    const xfs=[xf(0,2),xf(1,4),xf(0,2),xf(0,3),xf(0,2,164),xf(0,3,164),xf(0,2,9),xf(0,3,9),xf(0,2,165),xf(0,3,165),xf(2,5),xf(2,6),xf(0,2)];
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/><numFmt numFmtId="165" formatCode="mmmm yyyy"/></numFmts><fonts count="3"><font><sz val="11"/><color rgb="FF304F6D"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF304F6D"/><name val="Calibri"/></font></fonts><fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${['FFFFFF','E2F3FD','304F6D','E6E1DD','FFE1A0'].map(color=>`<fill><patternFill patternType="solid"><fgColor rgb="FF${color}"/><bgColor indexed="64"/></patternFill></fill>`).join('')}</fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/></styleSheet>`;
  }
  function createFile(source,XLSX,zip){
    if(!zip?.unzipSync||!zip.zipSync)throw new Error('Excel formatting could not be loaded. Reload the page and try again.');
    const workbook=buildWorkbook(source,XLSX);
    const files=zip.unzipSync(new Uint8Array(XLSX.write(workbook,{bookType:'xlsx',type:'array',compression:true,bookSST:true})));
    files['xl/styles.xml']=zip.strToU8(styleXml());
    workbook.SheetNames.forEach((name,index)=>{
      const path=`xl/worksheets/sheet${index+1}.xml`;
      let xml=zip.strFromU8(files[path]);
      xml=xml.replace(/<c\b([^>]*)>/g,(tag,attributes)=>{
        const address=/\br="([A-Z]+)(\d+)"/.exec(attributes);if(!address)return tag;
        const [,col,line]=address,row=Number(line),alt=row%2===1;let style=alt?3:2;
        if(row===1)style=1;
        else if(index===0&&col==='A')style=alt?5:4;
        else if(index===1&&col==='A'&&workbook.Sheets[name][`${col}${row}`]?.t==='n')style=alt?9:8;
        else if(index===1&&col==='D')style=alt?7:6;
        else if(index===2&&row<=6)style=col==='A'?10:11;
        else if(index===2)style=12;
        return `<c${attributes.replace(/\s+s="\d+"/g,'')} s="${style}">`;
      });
      const views='<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>';
      xml=xml.replace(/<sheetViews[\s\S]*?<\/sheetViews>/,views);
      files[path]=zip.strToU8(xml);
    });
    return zip.zipSync(files,{level:6});
  }
  const api={buildWorkbook,createFile};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.HappinessExcel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
