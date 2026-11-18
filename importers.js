/* PROBA · Importación local de TXT, DOCX, XLSX y PDF */
(()=>{'use strict';
const PDF_VERSION='6.5.438';
const PDF_MODULE=`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_VERSION}/build/pdf.mjs`;
const PDF_WORKER=`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_VERSION}/build/pdf.worker.mjs`;
let pdfModulePromise;
const decoder=new TextDecoder('utf-8');
const extOf=name=>(String(name).split('.').pop()||'').toLowerCase();
const xmlText=node=>Array.from(node?.getElementsByTagName('t')||[]).map(n=>n.textContent||'').join('');
function cleanCell(value){return String(value??'').replace(/\u00a0/g,' ').replace(/[\t\r]+/g,' ').trim();}
async function unzipEntries(file){
  const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let eocd=-1;
  for(let i=Math.max(0,bytes.length-65557);i<=bytes.length-22;i++){if(view.getUint32(i,true)===0x06054b50)eocd=i;}
  if(eocd<0)throw new Error('El archivo no tiene una estructura ZIP válida.');
  const count=view.getUint16(eocd+10,true),centralOffset=view.getUint32(eocd+16,true),entries=new Map();let p=centralOffset;
  for(let i=0;i<count;i++){
    if(view.getUint32(p,true)!==0x02014b50)throw new Error('No se pudo leer el contenido del archivo.');
    const method=view.getUint16(p+10,true),compressedSize=view.getUint32(p+20,true),nameLen=view.getUint16(p+28,true),extraLen=view.getUint16(p+30,true),commentLen=view.getUint16(p+32,true),localOffset=view.getUint32(p+42,true);
    const name=decoder.decode(bytes.slice(p+46,p+46+nameLen));p+=46+nameLen+extraLen+commentLen;
    if(name.endsWith('/'))continue;
    const localNameLen=view.getUint16(localOffset+26,true),localExtraLen=view.getUint16(localOffset+28,true),dataStart=localOffset+30+localNameLen+localExtraLen;
    const compressed=bytes.slice(dataStart,dataStart+compressedSize);let content;
    if(method===0)content=compressed;
    else if(method===8){
      if(typeof DecompressionStream==='undefined')throw new Error('Este navegador no permite descomprimir documentos Office. Actualízalo para importar DOCX y XLSX.');
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      content=new Uint8Array(await new Response(stream).arrayBuffer());
    }else continue;
    entries.set(name,decoder.decode(content));
  }
  return entries;
}
function parseDocx(entries){
  const xml=entries.get('word/document.xml');if(!xml)throw new Error('No se encontró el texto principal del Word.');
  const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw new Error('El documento Word está dañado o no se pudo interpretar.');
  const paragraphs=Array.from(doc.getElementsByTagName('w:p')).map(p=>{
    const parts=[];for(const node of Array.from(p.childNodes)){
      if(node.nodeType!==1)continue;
      const name=node.localName;
      if(name==='r'){for(const child of Array.from(node.childNodes)){if(child.nodeType===1&&child.localName==='t')parts.push(child.textContent||'');else if(child.nodeType===1&&child.localName==='tab')parts.push(' ');else if(child.nodeType===1&&child.localName==='br')parts.push('\n');}}
      else if(name==='hyperlink'){for(const t of Array.from(node.getElementsByTagName('w:t')))parts.push(t.textContent||'');}
    }
    return parts.join('').trim();
  }).filter(Boolean);
  // Las tablas de Word están formadas por párrafos; se preserva el contenido en orden de lectura.
  return paragraphs.join('\n');
}
function colIndex(ref){const letters=(String(ref||'').match(/^[A-Z]+/i)||['A'])[0].toUpperCase();let n=0;for(const c of letters)n=n*26+c.charCodeAt(0)-64;return n-1;}
function parseXlsx(entries){
  const sheetName=[...entries.keys()].filter(k=>/^xl\/worksheets\/sheet\d+\.xml$/i.test(k)).sort((a,b)=>Number(a.match(/sheet(\d+)/i)?.[1]||1)-Number(b.match(/sheet(\d+)/i)?.[1]||1))[0];
  if(!sheetName)throw new Error('No se encontró una hoja de cálculo legible.');
  const shared=[];const sharedXML=entries.get('xl/sharedStrings.xml');
  if(sharedXML){const sx=new DOMParser().parseFromString(sharedXML,'application/xml');for(const si of Array.from(sx.getElementsByTagName('si')))shared.push(Array.from(si.getElementsByTagName('t')).map(t=>t.textContent||'').join(''));}
  const xml=entries.get(sheetName),doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw new Error('No se pudo interpretar la hoja de cálculo.');
  const rows=[];
  for(const row of Array.from(doc.getElementsByTagName('row'))){const cells=[];
    for(const cell of Array.from(row.getElementsByTagName('c'))){const index=colIndex(cell.getAttribute('r'));let value='';const type=cell.getAttribute('t');
      if(type==='inlineStr')value=Array.from(cell.getElementsByTagName('t')).map(t=>t.textContent||'').join('');
      else{const v=cell.getElementsByTagName('v')[0]?.textContent||'';value=type==='s'?(shared[Number(v)]??''):type==='b'?(v==='1'?'VERDADERO':'FALSO'):v;}
      cells[index]=cleanCell(value);
    }
    rows.push(cells.map(v=>v??''));
  }
  return rows;
}
function normalizeHeader(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function parseSpreadsheetRows(rows){
  const first=(rows.find(r=>r.some(v=>cleanCell(v)))||[]).map(normalizeHeader);
  const qKeys=['pregunta','question','enunciado'];
  const qIndex=first.findIndex(v=>qKeys.includes(v));
  if(qIndex>=0){
    const colFor=(keys,fallback)=>{const idx=first.findIndex(v=>keys.includes(v));return idx>=0?idx:fallback;};
    const a=colFor(['a','opciona','alternativaa'],1),b=colFor(['b','opcionb','alternativab'],2),c=colFor(['c','opcionc','alternativac'],3),d=colFor(['d','opciond','alternativad'],4),answer=colFor(['respuesta','respuestacorrecta','correcta','answer','clave'],5),explain=colFor(['explicacion','justificacion','comentario'],6);
    const headerRow=rows.findIndex(r=>r.map(normalizeHeader).some(v=>qKeys.includes(v)));
    return rows.slice(headerRow+1).map(r=>({text:cleanCell(r[qIndex]),options:[a,b,c,d].map(i=>cleanCell(r[i])),answer:cleanCell(r[answer]),explanation:cleanCell(r[explain])})).filter(q=>q.text);
  }
  return rows.filter(r=>r.some(v=>cleanCell(v))).map(r=>({text:cleanCell(r[0]),options:[1,2,3,4].map(i=>cleanCell(r[i])),answer:cleanCell(r[5]),explanation:cleanCell(r[6])})).filter(q=>q.text);
}
function answerIndex(value,options){
  const raw=String(value||'').trim();if(!raw)return -1;
  const letter=raw.match(/(?:opci[oó]n\s*)?([A-D])\b/i);if(letter)return letter[1].toUpperCase().charCodeAt(0)-65;
  const number=raw.match(/^[1-4]$/);if(number)return Number(raw)-1;
  const clean=raw.replace(/^(?:la\s+)?(?:respuesta\s+)?(?:correcta\s*(?:es|:)?\s*)/i,'').trim().toLowerCase();
  return options.findIndex(o=>o.toLowerCase()===clean);
}
function normalizeQuestion(q,index,documentName){
  const options=Array.from({length:4},(_,i)=>cleanCell(q.options?.[i]));
  const answer=answerIndex(q.answer,options);
  if(!q.text||options.some(v=>!v)||answer<0||answer>3)return null;
  return {id:crypto.randomUUID?crypto.randomUUID():`q-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,text:cleanCell(q.text),options,answer,explanation:cleanCell(q.explanation||''),source:documentName,createdAt:Date.now()};
}
function parseQuestionText(text,documentName){
  const lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split('\n').map(x=>x.trim()).filter(Boolean);
  const candidates=[];let current=null;
  const startRe=/^(?:pregunta\s*)?(\d{1,3})\s*[.)\-:]\s*(.+)$/i;
  const optionRe=/^(?:\(?([A-D])\)?\s*[).:\-]|([A-D])\s*[-–])\s*(.+)$/i;
  const answerRe=/^(?:respuesta(?:\s+correcta)?|correcta|clave|answer)\s*[:\-]\s*(.+)$/i;
  const explainRe=/^(?:explicaci[oó]n|justificaci[oó]n|por\s+qu[eé])\s*[:\-]\s*(.+)$/i;
  const push=()=>{if(current)candidates.push(current);current=null;};
  for(const line of lines){
    const start=line.match(startRe),option=line.match(optionRe),answer=line.match(answerRe),explain=line.match(explainRe);
    if(start){push();current={text:start[2],options:[],answer:'',explanation:''};continue;}
    if(!current){if(/^\d+\s*[.)-]/.test(line))continue;continue;}
    if(option){const letter=(option[1]||option[2]).toUpperCase().charCodeAt(0)-65;current.options[letter]=option[3].trim();continue;}
    if(answer){current.answer=answer[1].trim();continue;}
    if(explain){current.explanation=explain[1].trim();continue;}
    if(current.options.filter(Boolean).length<4)current.text+=' '+line;
    else if(!current.explanation&&!current.answer)current.explanation=line;
  }
  push();
  return candidates.map((q,i)=>normalizeQuestion(q,i,documentName)).filter(Boolean);
}
async function cachePdfAssets(){
  if(!('caches' in window))return;
  const cache=await caches.open(`proba-pdfjs-${PDF_VERSION}`);
  for(const url of [PDF_MODULE,PDF_WORKER]){
    if(await cache.match(url))continue;
    const response=await fetch(url,{mode:'cors'});
    if(response.ok&&response.type!=='opaque')await cache.put(new Request(url),response.clone());
  }
}
async function loadPdf(){
  if(!pdfModulePromise){pdfModulePromise=import(PDF_MODULE).then(async pdf=>{pdf.GlobalWorkerOptions.workerSrc=PDF_WORKER;cachePdfAssets().catch(()=>{});return pdf;}).catch(error=>{pdfModulePromise=null;throw new Error('No se pudo cargar el lector PDF. Conéctate una vez a internet para habilitar la importación de PDF. Detalle: '+error.message);});}
  return pdfModulePromise;
}
async function parsePdf(file){
  const pdfjs=await loadPdf(),data=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjs.getDocument({data}).promise,lines=[];
  for(let pageNum=1;pageNum<=pdf.numPages;pageNum++){
    const page=await pdf.getPage(pageNum),content=await page.getTextContent(),byY=new Map();
    for(const item of content.items){if(!item.str?.trim())continue;const y=Math.round(item.transform?.[5]||0);if(!byY.has(y))byY.set(y,[]);byY.get(y).push({x:item.transform?.[4]||0,text:item.str});}
    const pageLines=[...byY.entries()].sort((a,b)=>b[0]-a[0]).map(([,items])=>items.sort((a,b)=>a.x-b.x).map(x=>x.text).join(' ').trim()).filter(Boolean);
    lines.push(...pageLines,'');
  }
  return lines.join('\n');
}
async function readDocument(file){
  const ext=extOf(file.name);let raw='',rows=null;
  if(ext==='txt')raw=await file.text();
  else if(ext==='docx'){const entries=await unzipEntries(file);raw=parseDocx(entries);}
  else if(ext==='xlsx'){const entries=await unzipEntries(file);rows=parseXlsx(entries);}
  else if(ext==='pdf')raw=await parsePdf(file);
  else throw new Error('Formato no compatible. Usa DOCX, PDF, XLSX o TXT.');
  let questions=rows?parseSpreadsheetRows(rows):parseQuestionText(raw,file.name);
  if(!questions.length)throw new Error('No encontré preguntas completas con cuatro opciones y una respuesta correcta. Revisa la plantilla de PROBA y vuelve a importar.');
  return {questions,rawText:raw,rows,format:ext};
}
window.ProbaImport={readDocument,parseQuestionText,parseSpreadsheetRows,unzipEntries};
})();
