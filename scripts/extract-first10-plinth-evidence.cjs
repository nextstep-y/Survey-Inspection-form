const fs=require('fs'),cp=require('child_process');
const dir='/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE/Pier Column';
const offset=Number(process.env.AUDIT_OFFSET||0),folder=offset?'output/next10-plinth-audit':'output/first10-plinth-audit';
fs.mkdirSync(folder,{recursive:true});
for(let i=0;i<10;i++){
 const id='P-'+(826+offset+i),num=String(20002+(offset+i)*7).padStart(6,'0');
 const file=fs.readdirSync(dir).find(f=>f.startsWith('NSCR-ITD-N03-ZWD-DWG-ST-'+num+'-')&&f.endsWith('.pdf'));if(!file)throw Error(id+' missing');
 const out=folder+'/'+id;
 cp.execFileSync('pdftotext',['-layout',dir+'/'+file,out+'.txt']);
 cp.execFileSync('pdftoppm',['-scale-to','1600','-png','-singlefile',dir+'/'+file,out]);
 const text=fs.readFileSync(out+'.txt','utf8');console.log(id,file,text.split('\n').filter(s=>s.includes(id)||/PIER TYPE|023000|PIER HEAD/.test(s)).map(s=>s.trim()).join(' / '));
}
