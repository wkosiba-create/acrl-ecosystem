import PptxGenJS from 'pptxgenjs';

const DIMS = [
  { id:'trl',    label:'Technology Readiness (TRL)',    short:'TRL',      color:'97C459' },
  { id:'frl',    label:'Funding Readiness (FRL)',       short:'Funding',  color:'FAC775' },
  { id:'brl',    label:'Business Readiness (BRL)',      short:'Business', color:'5DCAA5' },
  { id:'iprl',   label:'IP Readiness (IP-RL)',          short:'IP',       color:'AFA9EC' },
  { id:'mrl',    label:'Manufacturing Readiness (MRL)', short:'Mfg',      color:'85B7EB' },
  { id:'teamrl', label:'Team Readiness (TEAM-RL)',      short:'Team',     color:'F0997B' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const s = req.body;
  if (!s || !s.orgname) return res.status(400).json({ error: 'Missing submission data' });

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // SLIDE 1: Cover
  const cover = pres.addSlide();
  cover.background = { color: '1E2761' };
  cover.addShape(pres.shapes.RECTANGLE, { x:7.5,y:0,w:2.5,h:5.625, fill:{color:'534AB7',transparency:60}, line:{color:'534AB7',transparency:60} });
  cover.addText('L2M', { x:0.5,y:0.35,w:1.4,h:0.42, fontSize:13,fontFace:'Calibri',bold:true,color:'FFFFFF',align:'center',valign:'middle',fill:{color:'534AB7'},margin:0 });
  cover.addText('Innovation Ecosystem Mapping Exercise', { x:0.5,y:0.9,w:7.0,h:0.3, fontSize:11,fontFace:'Calibri',color:'CADCFC',align:'left',valign:'middle',margin:0 });
  cover.addText(s.progname || s.orgname, { x:0.5,y:1.4,w:6.8,h:1.6, fontSize:(s.progname||s.orgname).length>25?30:38, fontFace:'Calibri',bold:true,color:'FFFFFF',align:'left',valign:'middle',margin:0 });
  if (s.progname) cover.addText(s.orgname, { x:0.5,y:3.05,w:6.8,h:0.4, fontSize:14,fontFace:'Calibri',italic:true,color:'CADCFC',align:'left',valign:'middle',margin:0 });
  cover.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:0.5,y:3.7,w:1.1,h:0.32, fill:{color:'28337A'},line:{color:'7F77DD',width:1},rectRadius:0.05 });
  cover.addText(s.province||'—', { x:0.5,y:3.7,w:1.1,h:0.32, fontSize:10,fontFace:'Calibri',bold:true,color:'CADCFC',align:'center',valign:'middle',margin:0 });
  cover.addText((s.orgtype||'').split('(')[0].trim(), { x:1.75,y:3.7,w:5.5,h:0.32, fontSize:11,fontFace:'Calibri',color:'CADCFC',align:'left',valign:'middle',margin:0 });
  cover.addShape(pres.shapes.RECTANGLE, { x:0.5,y:4.2,w:6.8,h:0.03, fill:{color:'534AB7'},line:{color:'534AB7'} });
  cover.addText(s.role||'', { x:0.5,y:4.35,w:7.0,h:0.3, fontSize:9,fontFace:'Calibri',color:'8899CC',align:'left',valign:'middle',margin:0 });

  // SLIDE 2: Summary
  const sum = pres.addSlide();
  sum.background = { color: 'FFFFFF' };
  sum.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:10,h:0.55, fill:{color:'1E2761'},line:{color:'1E2761'} });
  sum.addText('Organization Profile Summary', { x:0.4,y:0,w:7,h:0.55, fontSize:13,fontFace:'Calibri',bold:true,color:'FFFFFF',align:'left',valign:'middle',margin:0 });
  sum.addText(s.orgname, { x:7,y:0,w:2.7,h:0.55, fontSize:10,fontFace:'Calibri',color:'CADCFC',align:'right',valign:'middle',margin:0 });

  function addBlock(slide,x,y,w,h,label,value,accent){
    slide.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:'F7F8FC'},line:{color:'E5E7EB',width:0.5}});
    slide.addShape(pres.shapes.RECTANGLE,{x,y,w:0.07,h,fill:{color:accent||'534AB7'},line:{color:accent||'534AB7'}});
    slide.addText(label,{x:x+0.15,y:y+0.06,w:w-0.2,h:0.2,fontSize:8,fontFace:'Calibri',bold:true,color:'6B7280',align:'left',valign:'top',margin:0});
    slide.addText(value||'—',{x:x+0.15,y:y+0.27,w:w-0.2,h:h-0.32,fontSize:10,fontFace:'Calibri',color:'111827',align:'left',valign:'top',margin:0,wrap:true});
  }

  const c1=0.3,c2=5.2,bw=4.6,gap=0.18;let y=0.65;
  addBlock(sum,c1,y,bw,0.65,'ORGANIZATION TYPE',(s.orgtype||'').split('(')[0].trim(),'534AB7');
  addBlock(sum,c2,y,bw,0.65,'INTAKE & STRUCTURE',`${s.intake||'—'} · ${s.structure||'—'}${s.duration?' ('+s.duration+' mo)':''}` ,'534AB7');y+=0.65+gap;
  addBlock(sum,c1,y,bw,0.65,'SECTOR FOCUS',(s.sectors||[]).join(', ')||'—','1D9E75');
  addBlock(sum,c2,y,bw,0.65,'FUNDING SOURCES',(s.funding||[]).map(f=>f.split('(')[0].trim()).slice(0,3).join(', ')||'—','1D9E75');y+=0.65+gap;
  const acrlDims=Object.keys(s.acrl||{});
  const acrlDetail=acrlDims.length>0?acrlDims.map(id=>{const d=DIMS.find(x=>x.id===id);const v=s.acrl[id];return `${d?d.short:id}: Lvl ${v.entry||'?'}→${v.exit||'?'}`;}).join(' | '):'—';
  addBlock(sum,c1,y,bw,0.65,'TRL CONTINUUM',s.trl_min?`Entry TRL ${s.trl_min}  →  Exit TRL ${s.trl_exit||'?'}`:'—','FAC775');
  addBlock(sum,c2,y,bw,0.65,'ACRL DIMENSIONS',acrlDetail,'AFA9EC');y+=0.65+gap;
  if(s.frl_supports&&s.frl_supports.length>0){
    addBlock(sum,c1,y,9.4,0.65,'FUNDING SUPPORTS (no direct resources)',s.frl_supports.map(id=>DIMS.find(d=>d.id===id)?.label||id).join(', '),'FAC775');y+=0.65+gap;
  }
  if(s.kpis) addBlock(sum,c1,y,9.4,0.6,'KPIs',s.kpis.substring(0,180),'5DCAA5');

  sum.addShape(pres.shapes.RECTANGLE,{x:0,y:5.3,w:10,h:0.32,fill:{color:'F3F4F6'},line:{color:'E5E7EB',width:0.5}});
  sum.addText(`L2M Innovation Ecosystem Mapping · ${s.province||''} · ${(s.orgtype||'').split('(')[0].trim()}`,{x:0.3,y:5.3,w:9.4,h:0.32,fontSize:8,fontFace:'Calibri',color:'9CA3AF',align:'left',valign:'middle',margin:0});

  const pptxBuffer = await pres.write({ outputType: 'nodebuffer' });
  const filename = `${(s.orgname||'org').replace(/[^a-z0-9]/gi,'_')}_${(s.progname||'program').replace(/[^a-z0-9]/gi,'_')}_L2M.pptx`;
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);
  res.status(200).send(pptxBuffer);
}
