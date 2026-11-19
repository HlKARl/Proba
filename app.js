/* PROBA — client-side study RPG. All progress and imported banks stay on this device. */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const CLASS_INFO = {
  ninja:{name:'Ninja',icon:'影',tag:'Velocidad y precisión',desc:'Acumula saltos tras responder correctamente y decide cuándo utilizarlos al dominar la clase.',ability:'2 saltos por cada 3 aciertos',color:'green'},
  thief:{name:'Ladrón',icon:'♜',tag:'Astucia y oportunidad',desc:'Elimina automáticamente alternativas incorrectas para reducir el riesgo de cada respuesta.',ability:'Elimina 1 alternativa por pregunta',color:'gold'},
  mage:{name:'Mago',icon:'✧',tag:'Conocimiento arcano',desc:'A partir de la pregunta 10, altera la campaña con uno de seis resultados aleatorios.',ability:'Dados del destino en la pregunta 10',color:'purple'},
  berserker:{name:'Berserker',icon:'⚔',tag:'Riesgo y recompensa',desc:'Multiplica el oro obtenido, pero una derrota destruye el oro de campaña y cuesta el 10 % de tu cartera.',ability:'Oro x2 · riesgo extremo',color:'red'}
};
const CLASS_BASE = {
 ninja:{name:'Instinto de sombra',desc:'Cada 3 respuestas correctas consecutivas, obtienes 2 saltos. Al principio se usan automáticamente.'},
 thief:{name:'Robo de respuestas',desc:'Elimina automáticamente una alternativa incorrecta en cada pregunta.'},
 mage:{name:'Dados del destino',desc:'Al llegar a la pregunta 10, puedes lanzar un dado con uno de seis efectos especiales.'},
 berserker:{name:'Furia',desc:'Obtienes el doble de oro por cada respuesta correcta que genere recompensa. Al fallar, pierdes todo el oro de campaña y el 10 % de tu cartera.'}
};
const SKILLS = {
 ninja:[
  {id:'ninja-sacrifice1',level:2,kind:'sacrifice',name:'Nivel II · Desapego',desc:'Comienzas cada campaña sin el comodín Reintentar.',cost:100000,icon:'⌁'},
  {id:'ninja-upgrade1',level:3,kind:'upgrade',name:'Nivel III · Control del impulso',desc:'Puedes decidir cuándo gastar tus saltos en vez de utilizarlos automáticamente. Aumenta la reserva máxima a 4.',cost:400000,icon:'➶'},
  {id:'ninja-sacrifice2',level:4,kind:'sacrifice',name:'Nivel IV · Impulso costoso',desc:'Cada salto consume 2 cargas en lugar de una. Necesitas al menos 2 cargas para saltar una pregunta.',cost:650000,icon:'◈'},
  {id:'ninja-mastery',level:5,kind:'mastery',name:'Nivel V · Almacén de sombras',desc:'Aumenta la reserva máxima de saltos de 4 a 6.',cost:1000000,icon:'✧'}
 ],
 thief:[
  {id:'thief-sacrifice1',level:2,kind:'sacrifice',name:'Nivel II · Codicia',desc:'Comienzas cada campaña sin el comodín Reintentar.',cost:100000,icon:'⌁'},
  {id:'thief-upgrade1',level:3,kind:'upgrade',name:'Nivel III · Hurto preciso',desc:'En las preguntas 5, 10, 15, 20, 25 y 30, elimina una segunda alternativa incorrecta.',cost:400000,icon:'⟡'},
  {id:'thief-sacrifice2',level:4,kind:'sacrifice',name:'Nivel IV · Apuesta peligrosa',desc:'No puedes utilizar el comodín 50/50, ni siquiera durante Frenesí.',cost:650000,icon:'♜'},
  {id:'thief-mastery',level:5,kind:'mastery',name:'Nivel V · Maestro del engaño',desc:'Elimina automáticamente dos alternativas incorrectas en cada pregunta.',cost:1000000,icon:'♢'}
 ],
 mage:[
  {id:'mage-sacrifice1',level:2,kind:'sacrifice',name:'Nivel II · Pacto arcano',desc:'Comienzas cada campaña sin el comodín Reintentar.',cost:100000,icon:'⌁'},
  {id:'mage-upgrade1',level:3,kind:'upgrade',name:'Nivel III · Manipulación del destino',desc:'Una vez por campaña, puedes posponer el lanzamiento de los dados de la pregunta 10 hasta la pregunta 15.',cost:400000,icon:'✧'},
  {id:'mage-sacrifice2',level:4,kind:'sacrifice',name:'Nivel IV · Deuda mágica',desc:'Todas tus campañas tienen 5 preguntas adicionales. Necesitas al menos 35 preguntas diferentes en tus fuentes activas.',cost:650000,icon:'⌁'},
  {id:'mage-mastery',level:5,kind:'mastery',name:'Nivel V · Doble destino',desc:'Lanzas dos dados y eliges cuál de los dos resultados aplicar.',cost:1000000,icon:'✧'}
 ],
 berserker:[
  {id:'berserker-sacrifice1',level:2,kind:'sacrifice',name:'Nivel II · Descontrol',desc:'Comienzas cada campaña sin el comodín Reintentar.',cost:200000,icon:'⌁'},
  {id:'berserker-upgrade1',level:3,kind:'upgrade',name:'Nivel III · Sed de sangre',desc:'El multiplicador de oro por respuestas nuevas aumenta de ×2 a ×3.',cost:700000,icon:'🔥'},
  {id:'berserker-sacrifice2',level:4,kind:'sacrifice',name:'Nivel IV · Sin retirada',desc:'Si te retiras voluntariamente, pierdes todo el oro acumulado en esa campaña.',cost:1100000,icon:'⚔'},
  {id:'berserker-mastery',level:5,kind:'mastery',name:'Nivel V · Furia absoluta',desc:'El multiplicador de oro aumenta de ×3 a ×4. La bonificación por victoria es de 50.000.',cost:1800000,icon:'⚡'}
 ]
};
const LEVELS=[{name:'Nivel I',size:5,bonus:5000},{name:'Nivel II',size:10,bonus:10000},{name:'Nivel III',size:15,bonus:15000}];
const MAGE_DICE = {
  1:{name:'Transmutación ×4',desc:'Multiplica por ×4 las futuras ganancias de oro de esta campaña.'},
  2:{name:'Salto dimensional',desc:'Salta las próximas 10 preguntas, sin responderlas ni obtener oro por ellas.'},
  3:{name:'Caos alternado',desc:'Reduce a la mitad las preguntas restantes: salta una sí y otra no.'},
  4:{name:'Retorno al origen',desc:'Regresa a la pregunta 1 conservando el oro acumulado. Las preguntas ya dominadas no vuelven a pagar.'},
  5:{name:'Deuda del destino',desc:'Añade 5 preguntas a la campaña.'},
  6:{name:'Robo arcano',desc:'Obtienes 2 usos adicionales de comodines aleatorios.'}
};
const DEFAULT_STATE={version:5,gold:1000,subjects:[],selectedDocuments:[],unlocks:{ninja:[],thief:[],mage:[],berserker:[]},masteredQuestions:{},history:[],totals:{correct:0,answered:0,completed:0,failed:0,frenzyBest:null},settings:{questionGold:1000,frenzySeconds:90,frenzyActivationSeconds:150,activeClass:'ninja'}};
let state=structuredClone(DEFAULT_STATE),db=null,selectedMode='campaign',selectedClass='ninja',game=null,toastTimer=null,clockTimer=null;
function openDB(){return new Promise(resolve=>{try{if(!('indexedDB'in window)||!window.indexedDB){resolve(null);return;}const req=window.indexedDB.open('proba-local-v1',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('app'))req.result.createObjectStore('app');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);req.onblocked=()=>resolve(null);}catch{resolve(null);}});}
async function loadState(){db=await openDB();if(db){const value=await new Promise(resolve=>{const tx=db.transaction('app','readonly'),r=tx.objectStore('app').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});if(value)state=mergeState(value);}else{try{const value=JSON.parse(localStorage.getItem('proba-state')||'null');if(value)state=mergeState(value);}catch{}}}
function mergeState(v){
 const merged={...structuredClone(DEFAULT_STATE),...v,version:5,totals:{...DEFAULT_STATE.totals,...(v.totals||{})},settings:{...DEFAULT_STATE.settings,...(v.settings||{})},masteredQuestions:{...(v.masteredQuestions||{})}};
 if((Number(v.version)||0)<2&&Number(v.gold||0)<=0)merged.gold=1000;
 if(!Number.isFinite(Number(merged.gold)))merged.gold=1000;
 const oldUnlocks=v.unlocks||{};merged.unlocks={};
 for(const id of Object.keys(CLASS_INFO)){
  const stored=Array.isArray(oldUnlocks[id])?oldUnlocks[id]:[],validIds=SKILLS[id].map(n=>n.id);
  const count=Number(v.version)>=5?Math.min(4,validIds.filter(skillId=>stored.includes(skillId)).length):Math.min(4,stored.length);
  merged.unlocks[id]=SKILLS[id].slice(0,count).map(n=>n.id);
 }
 const allIds=(merged.subjects||[]).flatMap(sub=>(sub.documents||[]).map(doc=>doc.id));
 merged.selectedDocuments=Array.isArray(v.selectedDocuments)?[...new Set(v.selectedDocuments.filter(id=>allIds.includes(id)))]:allIds;
 if(!['ninja','thief','mage','berserker'].includes(merged.settings.activeClass))merged.settings.activeClass='ninja';
 return merged;
}
async function saveState(render=true){if(db){await new Promise(resolve=>{const tx=db.transaction('app','readwrite');tx.objectStore('app').put(state,'state');tx.oncomplete=resolve;tx.onerror=resolve;});}else{try{localStorage.setItem('proba-state',JSON.stringify(state));}catch{showToast('No se pudo guardar. Exporta una copia de seguridad.');}}if(render)renderAll();}
const fmt=n=>Math.round(Number(n)||0).toLocaleString('es-EC');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);}
function sumQuestions(ids){return state.subjects.flatMap(s=>s.documents.filter(d=>ids.includes(d.id)).map(d=>d.questions)).flat();}
function normalizeKnowledgeText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function questionFingerprint(q){const options=(q.options||[]).map(normalizeKnowledgeText).sort();return JSON.stringify([normalizeKnowledgeText(q.question),options,normalizeKnowledgeText(q.options?.[q.answer]??'')]);}
function uniqueQuestionList(questions){const seen=new Set();return questions.filter(q=>{const key=questionFingerprint(q);if(seen.has(key))return false;seen.add(key);return true;});}
function countQuestions(ids){return uniqueQuestionList(sumQuestions(ids)).length;}
function hasMastered(q){return Boolean(state.masteredQuestions[questionFingerprint(q)]);}
function allDocs(){return state.subjects.flatMap(s=>s.documents.map(d=>({...d,subjectName:s.name,subjectId:s.id})));}
function classLevel(id){return Math.min(5,1+(state.unlocks[id]||[]).length);}
function classHas(id,skill){return (state.unlocks[id]||[]).includes(skill);}
function nextSkill(id){return SKILLS[id].find(n=>!classHas(id,n.id));}
function uuid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function nav(page){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${page}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));window.scrollTo({top:0,behavior:'smooth'});}
function openModal(title,body,eyebrow='PROBA'){$('#modalTitle').textContent=title;$('#modalEyebrow').textContent=eyebrow;$('#modalBody').innerHTML=body;$('#modalBackdrop').classList.remove('hidden');}
function closeModal(){$('#modalBackdrop').classList.add('hidden');$('#modalBody').innerHTML='';}
function levelForQuestion(q){if(q<=5)return 0;if(q<=15)return 1;return 2;}
function gameLevelText(g=game){if(g.mode==='study')return'ESTUDIO';const n=g.index+1;return n>30?'DESAFÍO EXTRA':LEVELS[levelForQuestion(n)]?.name.toUpperCase()||'DESAFÍO EXTRA';}
function renderAll(){renderHeader();renderSubjects();renderAdventure();renderClasses();renderHistory();}
function renderHeader(){$('#goldBalance').textContent=fmt(state.gold);}
function renderSubjects(){const grid=$('#subjectGrid');grid.innerHTML=state.subjects.map(s=>`<article class="subject-card"><span class="eyebrow">${s.documents.length} DOCUMENTO${s.documents.length===1?'':'S'}</span><h3>${esc(s.name)}</h3><p>${s.documents.reduce((n,d)=>n+d.questions.length,0)} preguntas disponibles</p><div class="subject-actions"><button class="small-button" data-subject-action="import" data-id="${s.id}">＋ Importar</button><button class="small-button" data-subject-action="view" data-id="${s.id}">Documentos</button><button class="small-button danger" data-subject-action="delete" data-id="${s.id}">Eliminar</button></div></article>`).join('');$('#emptyLibrary').classList.toggle('hidden',state.subjects.length>0);grid.classList.toggle('hidden',!state.subjects.length);$('#completedCampaigns').textContent=fmt(state.totals.completed);$('#totalCorrect').textContent=fmt(state.totals.correct);const fav=Object.entries(state.history.reduce((o,h)=>{if(h.mode==='campaign')o[h.classId]=(o[h.classId]||0)+1;return o;},{})).sort((a,b)=>b[1]-a[1])[0];$('#favoriteClass').textContent=fav?CLASS_INFO[fav[0]].name:'—';}
function renderAdventure(){const box=$('#adventureDocuments'),docs=allDocs();const validIds=new Set(docs.map(d=>d.id));state.selectedDocuments=(state.selectedDocuments||[]).filter(id=>validIds.has(id));box.innerHTML=docs.map(d=>`<label class="doc-row"><input type="checkbox" class="adventure-check" value="${d.id}" ${state.selectedDocuments.includes(d.id)?'checked':''}/><span><strong>${esc(d.name)}</strong><small>${d.questions.length} preguntas · ${esc(d.subjectName)}</small></span><span class="doc-subject">${esc(d.subjectName)}</span></label>`).join('');$('#noDocsHint').classList.toggle('hidden',docs.length>0);$$('.adventure-check').forEach(c=>c.addEventListener('change',()=>updateAdventure(true)));updateAdventure(false);}
function campaignRequiredQuestions(classId=selectedClass){return classId==='mage'&&classHas('mage','mage-sacrifice2')?35:30;}
function updateAdventure(persist=true){const ids=$$('.adventure-check:checked').map(c=>c.value);state.selectedDocuments=ids;const n=countQuestions(ids),required=campaignRequiredQuestions();$('#selectedCount').textContent=`${ids.length} documento${ids.length===1?'':'s'} seleccionado${ids.length===1?'':'s'}`;$('#availableQuestions').textContent=`${n} preguntas disponibles`;
 $('#chosenClassIcon').textContent=CLASS_INFO[selectedClass].icon;$('#chosenClassName').textContent=`${CLASS_INFO[selectedClass].name} · Nivel ${classLevel(selectedClass)}`;$('#chosenClassAbility').textContent=CLASS_INFO[selectedClass].ability;$('.preview-title span').textContent=`${required} PREGUNTAS`;
 const valid=selectedMode==='campaign'?n>=required:n>=1;const canPlay=valid&&!(selectedMode==='campaign'&&selectedClass==='berserker'&&state.gold<=0);$('#startGameButton').disabled=!canPlay;
 $('#startNote').textContent=selectedMode==='campaign'?(selectedClass==='berserker'&&state.gold<=0?'El Berserker requiere oro en tu cartera para entrar a una campaña.':`Campaña: 5 + 10 + 15 preguntas${required>30?' + 5 de deuda mágica':''}. ${n<required?`El banco activo tiene ${n}; faltan ${required-n} para iniciar.`:'Banco listo. No hay límite de tiempo; el cronómetro solo determina si desbloqueas Frenesí.'}`):`Modo Estudio: ${n} preguntas disponibles en tus fuentes activas.`;
 if(persist)saveState(false);
}
function renderClasses(){
 const cards=$('#classCards');
 cards.innerHTML=Object.entries(CLASS_INFO).map(([id,c])=>`<article class="class-card ${id===selectedClass?'selected':''}" data-class-card="${id}" role="button" tabindex="0"><div class="class-icon">${c.icon}</div><h3>${c.name}</h3><p>${c.desc}</p><div class="class-level">${id===selectedClass?'CLASE ACTIVA · ':''}NIVEL ${classLevel(id)} · ${(state.unlocks[id]||[]).length}/4 MEJORAS</div></article>`).join('');
 const nodes=SKILLS[selectedClass],bought=state.unlocks[selectedClass]||[],next=nextSkill(selectedClass),base=CLASS_BASE[selectedClass];
 $('#treeHeader').innerHTML=`<div class="tree-head"><div><span class="eyebrow">ÁRBOL DE HABILIDADES</span><h2>${CLASS_INFO[selectedClass].name}</h2><p>Nivel ${classLevel(selectedClass)} · ${bought.length} de 4 mejoras adquiridas</p></div><span class="coin">◈ ${fmt(state.gold)} ORO</span></div><p class="tree-wallet-note">La clase elegida es la única activa durante una campaña. Los sacrificios permanecen activos en las campañas de esta clase.</p>`;
 const allNodes=[{id:'base',level:1,kind:'initial',name:'Nivel I · Habilidad inicial',desc:base.desc,cost:0,icon:'Ⅰ'},...nodes];
 $('#skillTree').innerHTML=`<div class="tree-list">${allNodes.map(n=>{const owned=n.id==='base'||bought.includes(n.id),available=n.id!=='base'&&next?.id===n.id;const type=n.kind==='initial'?'HABILIDAD INICIAL':n.kind==='sacrifice'?'SACRIFICIO':n.kind==='mastery'?'MAESTRÍA':'MEJORA';return `<div class="skill-node ${owned?'owned':''} ${n.kind==='sacrifice'?'sacrifice':''}"><div class="node-icon">${n.icon}</div><div class="node-copy"><div class="node-kicker">${type}</div><h4>${esc(n.name)}</h4><p>${esc(n.desc)}</p></div><div class="node-status">${owned?'ADQUIRIDO':available?'DISPONIBLE':'BLOQUEADO'}${available?`<button class="small-button" data-buy-skill="${n.id}" data-class="${selectedClass}">${fmt(n.cost)} ◈</button>`:''}</div></div>`;}).join('')}</div>`;
 updateAdventure(false);
}
function renderHistory(){const hist=state.history.slice(0,30);$('#historyList').innerHTML=hist.length?hist.map(h=>`<div class="history-row"><div><b>${esc(h.subject||'Partida')} · ${esc(h.mode==='campaign'?'Campaña':'Estudio')} ${h.classId?`· ${CLASS_INFO[h.classId].name}`:''}</b><small>${new Date(h.date).toLocaleString('es-EC')} · ${h.correct}/${h.answered} aciertos ${h.outcome?`· ${esc(h.outcome)}`:''}</small>${h.mistakes?.length?`<button class="text-button" data-review-history="${state.history.indexOf(h)}">Repasar ${h.mistakes.length} errores</button>`:''}</div><div class="history-result">${h.gold>=0?'+':''}${fmt(h.gold)} ◈<small>${h.outcome==='victoria'?'Victoria':h.outcome==='derrota'?'Derrota':h.outcome==='retiro'?'Retirada':'Práctica'}</small></div></div>`).join(''):'<div class="inline-empty panel">Todavía no tienes partidas registradas.</div>';$('#statGold').textContent=fmt(state.gold);$('#statRuns').textContent=fmt(state.history.filter(h=>h.mode==='campaign').length);const t=state.totals;$('#statAccuracy').textContent=t.answered?`${Math.round(t.correct/t.answered*100)}%`:'—';$('#statFrenzy').textContent=t.frenzyBest!=null?`${Math.floor(t.frenzyBest/60)}:${String(t.frenzyBest%60).padStart(2,'0')}`:'—';}
function createSubject(){openModal('Nueva materia',`<form id="subjectForm" class="form-stack"><label>Nombre de la materia<input name="name" required maxlength="60" placeholder="Ej. Control industrial" autofocus></label><div class="form-actions"><button type="button" class="secondary-button" id="cancelForm">Cancelar</button><button class="primary-button">Crear materia</button></div></form>`,'BIBLIOTECA');$('#subjectForm').addEventListener('submit',async e=>{e.preventDefault();const name=new FormData(e.currentTarget).get('name').trim();if(!name)return;state.subjects.push({id:uuid(),name,documents:[]});await saveState();closeModal();showToast('Materia creada.');});$('#cancelForm').onclick=closeModal;}
function importToSubject(subjectId){const s=state.subjects.find(x=>x.id===subjectId);if(!s)return;openModal(`Importar a ${esc(s.name)}`,`<form id="importForm" class="form-stack"><label>Selecciona documentos<input type="file" id="questionFiles" multiple accept=".txt,.csv,.md,.docx,.xlsx,.pdf"></label><p class="modal-note">Formatos: TXT, CSV, DOCX, XLSX y PDF con texto seleccionable. Todo se guarda localmente. Los PDF requieren conexión la primera vez para cargar el lector; los PDF escaneados necesitan OCR externo.</p><div class="form-actions"><button type="button" class="secondary-button" id="cancelImport">Cancelar</button><button class="primary-button" type="submit">Importar y revisar</button></div><div id="importProgress" class="modal-note"></div></form>`,'BIBLIOTECA');$('#cancelImport').onclick=closeModal;$('#importForm').addEventListener('submit',async e=>{e.preventDefault();const files=[...$('#questionFiles').files];if(!files.length){showToast('Selecciona archivos.');return;}const btn=e.currentTarget.querySelector('button[type=submit]'),status=$('#importProgress');btn.disabled=true;let added=0,totalQuestions=0;for(const file of files){status.textContent=`Leyendo ${file.name}…`;try{const questions=await readQuestionFile(file);if(!questions.length){showToast(`${file.name}: no encontré preguntas válidas.`);continue;}totalQuestions+=questions.length;const newDoc={id:uuid(),name:file.name.replace(/\.[^.]+$/,''),fileName:file.name,questions,createdAt:new Date().toISOString()};s.documents.push(newDoc);state.selectedDocuments=[...new Set([...(state.selectedDocuments||[]),newDoc.id])];added++;}catch(err){console.error(err);showToast(`${file.name}: ${err.message||'no se pudo leer'}`);}}await saveState();closeModal();if(added){showToast(`${added} documento(s) importado(s): ${totalQuestions} preguntas detectadas.`);openDocumentManager(subjectId);}});}
function openDocumentManager(subjectId){const s=state.subjects.find(x=>x.id===subjectId);if(!s)return;openModal(s.name,`<div class="form-actions" style="justify-content:flex-start;margin-top:0;margin-bottom:12px"><button class="small-button" id="addManualQuestion">＋ Añadir pregunta</button><button class="small-button" id="addMoreFiles">＋ Importar archivos</button></div><div class="question-editor">${s.documents.map(d=>`<div class="editor-question"><button class="small-button danger" data-doc-delete="${d.id}">Eliminar</button><strong>${esc(d.name)}</strong><small>${d.questions.length} preguntas · ${esc(d.fileName||'Creado en Proba')}</small><div class="form-actions" style="justify-content:flex-start"><button class="small-button" data-doc-edit="${d.id}">Revisar preguntas</button><button class="small-button" data-doc-rename="${d.id}">Renombrar</button></div></div>`).join('')||'<p class="modal-note">Todavía no hay documentos en esta materia.</p>'}</div><div class="form-actions"><button class="secondary-button" id="doneDocs">Listo</button></div>`,'MATERIA');$('#doneDocs').onclick=closeModal;$('#addMoreFiles').onclick=()=>{closeModal();importToSubject(subjectId);};$('#addManualQuestion').onclick=()=>{closeModal();addManualQuestion(subjectId);};$$('[data-doc-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar este documento y todas sus preguntas?'))return;s.documents=s.documents.filter(d=>d.id!==b.dataset.docDelete);state.selectedDocuments=(state.selectedDocuments||[]).filter(id=>id!==b.dataset.docDelete);await saveState();openDocumentManager(subjectId);});$$('[data-doc-edit]').forEach(b=>b.onclick=()=>{const doc=s.documents.find(d=>d.id===b.dataset.docEdit);if(doc)editDocumentQuestions(subjectId,doc.id);});$$('[data-doc-rename]').forEach(b=>b.onclick=()=>{const doc=s.documents.find(d=>d.id===b.dataset.docRename);if(!doc)return;closeModal();openModal('Renombrar documento',`<form id="renameDocForm" class="form-stack"><label>Nombre<input name="name" value="${esc(doc.name)}" required></label><div class="form-actions"><button type="button" class="secondary-button" id="cancelRename">Cancelar</button><button class="primary-button">Guardar</button></div></form>`);$('#cancelRename').onclick=closeModal;$('#renameDocForm').onsubmit=async e=>{e.preventDefault();doc.name=new FormData(e.currentTarget).get('name').trim();await saveState();closeModal();openDocumentManager(subjectId);};});}
function addManualQuestion(subjectId){openModal('Añadir pregunta',questionFormHTML(),'EDITOR');wireQuestionForm(async q=>{let s=state.subjects.find(x=>x.id===subjectId);if(!s)return;let d=s.documents.find(x=>x.manual===true);if(!d){d={id:uuid(),name:'Preguntas manuales',fileName:'Creado en Proba',manual:true,questions:[]};s.documents.push(d);}d.questions.push(q);state.selectedDocuments=[...new Set([...(state.selectedDocuments||[]),d.id])];await saveState();closeModal();openDocumentManager(subjectId);});}
function questionFormHTML(q={}){const answers=q.options||['','','',''];return `<form id="questionForm" class="form-stack"><label>Enunciado<textarea name="question" required>${esc(q.question||'')}</textarea></label>${answers.map((v,i)=>`<label>Opción ${'ABCD'[i]}<input name="opt${i}" required value="${esc(v)}"></label>`).join('')}<label>Respuesta correcta<select name="correct">${['A','B','C','D'].map((v,i)=>`<option value="${i}" ${(q.answer===i||q.answer===v)?'selected':''}>${v}</option>`).join('')}</select></label><label>Explicación (opcional)<textarea name="explanation">${esc(q.explanation||'')}</textarea></label><div class="form-actions"><button type="button" class="secondary-button" id="cancelQuestion">Cancelar</button><button class="primary-button">Guardar pregunta</button></div></form>`;}
function wireQuestionForm(onSave){$('#cancelQuestion').onclick=closeModal;$('#questionForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const q={id:uuid(),question:f.get('question').trim(),options:[0,1,2,3].map(i=>f.get(`opt${i}`).trim()),answer:Number(f.get('correct')),explanation:f.get('explanation').trim()};await onSave(q);};}
function editDocumentQuestions(subjectId,docId){const s=state.subjects.find(x=>x.id===subjectId),d=s?.documents.find(x=>x.id===docId);if(!d)return;openModal(`Revisar · ${esc(d.name)}`,`<p class="modal-note">Verifica el enunciado, las cuatro alternativas y la respuesta correcta antes de jugar. Puedes editar o eliminar preguntas.</p><div class="question-editor">${d.questions.map((q,i)=>`<div class="editor-question"><button class="small-button" data-q-edit="${q.id}">Editar</button><button class="small-button danger" data-q-delete="${q.id}">Eliminar</button><strong>${i+1}. ${esc(q.question)}</strong><small>Correcta: ${'ABCD'[q.answer]||'?'} · ${esc(q.options[q.answer]||'')}</small></div>`).join('')}</div><div class="form-actions"><button class="secondary-button" id="backDocManager">Volver</button><button class="primary-button" id="finishReview">Terminar revisión</button></div>`,'REVISIÓN');$('#backDocManager').onclick=()=>openDocumentManager(subjectId);$('#finishReview').onclick=()=>{closeModal();openDocumentManager(subjectId);};$$('[data-q-delete]').forEach(b=>b.onclick=async()=>{d.questions=d.questions.filter(q=>q.id!==b.dataset.qDelete);await saveState();editDocumentQuestions(subjectId,docId);});$$('[data-q-edit]').forEach(b=>b.onclick=()=>{const q=d.questions.find(q=>q.id===b.dataset.qEdit);if(!q)return;const old=q;closeModal();openModal('Editar pregunta',questionFormHTML(old),'EDITOR');wireQuestionForm(async updated=>{Object.assign(old,updated);await saveState();closeModal();editDocumentQuestions(subjectId,docId);});});}

// ---------- File readers ----------
async function readQuestionFile(file){const ext=file.name.split('.').pop().toLowerCase();if(['txt','md'].includes(ext))return parseQuestionText(await file.text());if(ext==='csv')return parseCSV(await file.text());if(ext==='docx')return parseDOCX(file);if(ext==='xlsx')return parseXLSX(file);if(ext==='pdf')return parsePDF(file);throw new Error('Formato no compatible. Usa TXT, CSV, DOCX, XLSX o PDF.');}
function cleanQuestion(s){return s.replace(/^(?:pregunta\s*\d*\s*[:.)-]?|\d+\s*[.)-])\s*/i,'').trim();}
function parseQuestionText(text){
 const normalized=String(text||'').replace(/\r/g,'').replace(/\f/g,'\n').replace(/\u00a0/g,' ');
 const markers=[...normalized.matchAll(/\bPregunta\s*\d+\s*[:.)-]\s*/gi)];
 if(markers.length){
  const chunks=markers.map((m,i)=>normalized.slice(m.index,markers[i+1]?.index??normalized.length));
  return chunks.map(parseNumberedQuestionChunk).filter(Boolean);
 }
 // Fallback for older, unnumbered TXT/Markdown banks.
 let blocks=normalized.split(/\n\s*\n+/).map(x=>x.trim()).filter(Boolean);
 if(blocks.length===1){const lines=normalized.split('\n');blocks=[];let cur=[];for(const line of lines){if(/^(?:pregunta\s*\d*\s*[:.)-]|\d+\s*[.)-])\s*/i.test(line.trim())&&cur.length){blocks.push(cur.join('\n'));cur=[];}if(line.trim())cur.push(line);}if(cur.length)blocks.push(cur.join('\n'));}
 return blocks.map(parseLegacyQuestionBlock).filter(Boolean);
}
function parseNumberedQuestionChunk(chunk){
 const body=chunk.replace(/^\s*Pregunta\s*\d+\s*[:.)-]\s*/i,'').replace(/[\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim();
 const answerMatch=body.match(/\b(?:respuesta(?:\s+correcta)?|correcta|soluci[oó]n|clave(?:\s+correcta)?)\s*[:=\-]\s*([A-D1-4])\b/i);
 if(!answerMatch)return null;
 const explanationMatch=body.match(/\b(?:explicaci[oó]n|justificaci[oó]n|comentario)\s*[:=\-]\s*/i);
 const coreEnd=Math.min(answerMatch.index,explanationMatch?.index??body.length);
 const core=body.slice(0,coreEnd).trim();
 const optionMatches=[...core.matchAll(/(?:^|\s)([A-D])\s*[).:\-]\s*/gi)];
 if(optionMatches.length<3)return null;
 const question=core.slice(0,optionMatches[0].index).trim();
 const optionPairs=optionMatches.map((m,i)=>{
  const letter=m[1].toUpperCase();
  const valueStart=m.index+m[0].length;
  const valueEnd=optionMatches[i+1]?.index??core.length;
  return [letter,core.slice(valueStart,valueEnd).trim()];
 });
 const optionMap={};for(const [letter,value] of optionPairs)optionMap[letter]=value;
 const answerMark=answerMatch[1].toUpperCase();
 const answer=/^[1-4]$/.test(answerMark)?Number(answerMark)-1:'ABCD'.indexOf(answerMark);
 const letters=Object.keys(optionMap).sort();
 const contiguous=letters.every((l,i)=>l==='ABCD'[i]);
 const options=letters.map(l=>optionMap[l]);
 if(!question||!contiguous||!options[answer]||options.some(x=>!x))return null;
 const explanation=explanationMatch?body.slice(explanationMatch.index+explanationMatch[0].length).trim():'';
 return {id:uuid(),question,options,answer,explanation};
}
function parseLegacyQuestionBlock(block){
 const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);let qline='',opts=[],ans=null,explanation='';
 for(const l of lines){let m;
  if((m=l.match(/^(?:respuesta(?:\s+correcta)?|correcta|soluci[oó]n|clave(?:\s+correcta)?)\s*[:=\-]\s*([A-D1-4])\b/i))){const mark=m[1].toUpperCase();ans=/^[1-4]$/.test(mark)?Number(mark)-1:'ABCD'.indexOf(mark);continue;}
  if((m=l.match(/^(?:explicaci[oó]n|justificaci[oó]n|comentario)\s*[:=\-]\s*(.*)$/i))){explanation=m[1];continue;}
  if((m=l.match(/^([A-D])\s*[).:\-]\s*(.+)$/i))){opts['ABCD'.indexOf(m[1].toUpperCase())]=m[2].trim();continue;}
  if(!qline)qline=cleanQuestion(l);else qline+=' '+l;
 }
 if(qline&&opts.filter(Boolean).length>=3&&ans!==null&&opts[ans])return {id:uuid(),question:qline,options:opts.filter(Boolean),answer:ans,explanation};
 return null;
}
function parseCSV(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=!quoted;else if((c===','||c===';'||c==='\t')&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}row.push(field);if(row.some(x=>x.trim()))rows.push(row);return tableToQuestions(rows);}
function tableToQuestions(rows){if(rows.length<2)return[];const headers=rows[0].map(h=>h.trim().toLowerCase());const find=(names)=>headers.findIndex(h=>names.some(n=>h===n)||names.some(n=>n.length>1&&h.includes(n)));const qi=find(['pregunta','enunciado','question']);const oi=['a','b','c','d'].map(x=>headers.findIndex(h=>[`opcion ${x}`,`opción ${x}`,`alternativa ${x}`,`option ${x}`,x].includes(h)));const ai=find(['respuesta correcta','correcta','respuesta','answer','clave']);const ei=find(['explicacion','explicación','justificacion','justificación','explanation']);if(qi<0||oi.some(i=>i<0)||ai<0)return[];return rows.slice(1).map(r=>{const a=String(r[ai]??'').trim().toUpperCase();const answer=/^[1-4]$/.test(a)?Number(a)-1:'ABCD'.indexOf(a[0]);const options=oi.map(i=>String(r[i]??'').trim());if(!String(r[qi]||'').trim()||answer<0||options.some(x=>!x))return null;return{id:uuid(),question:String(r[qi]).trim(),options,answer,explanation:ei>=0?String(r[ei]||'').trim():''};}).filter(Boolean);}
async function readZip(file){const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer);let eocd=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65558);i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}if(eocd<0)throw new Error('El archivo no parece ser un DOCX/XLSX válido.');const total=view.getUint16(eocd+10,true),start=view.getUint32(eocd+16,true),map=new Map();let p=start;for(let n=0;n<total;n++){if(view.getUint32(p,true)!==0x02014b50)break;const method=view.getUint16(p+10,true),size=view.getUint32(p+20,true),nameLen=view.getUint16(p+28,true),extraLen=view.getUint16(p+30,true),commentLen=view.getUint16(p+32,true),localOffset=view.getUint32(p+42,true);const name=new TextDecoder().decode(bytes.slice(p+46,p+46+nameLen));const lp=localOffset,localName=view.getUint16(lp+26,true),localExtra=view.getUint16(lp+28,true),dataStart=lp+30+localName+localExtra,compressed=bytes.slice(dataStart,dataStart+size);let content;if(method===0)content=compressed;else if(method===8){if(!('DecompressionStream'in window))throw new Error('Este navegador no permite descomprimir DOCX/XLSX.');const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));content=new Uint8Array(await new Response(stream).arrayBuffer());}else{p+=46+nameLen+extraLen+commentLen;continue;}map.set(name,content);p+=46+nameLen+extraLen+commentLen;}return map;}
async function parseDOCX(file){const zip=await readZip(file),xml=zip.get('word/document.xml');if(!xml)throw new Error('No se encontró el contenido de Word.');const doc=new DOMParser().parseFromString(new TextDecoder().decode(xml),'application/xml');const paras=[...doc.getElementsByTagName('w:p')].map(p=>[...p.getElementsByTagName('w:t')].map(t=>t.textContent).join(''));return parseQuestionText(paras.join('\n'));}
async function parseXLSX(file){const zip=await readZip(file),shared=zip.get('xl/sharedStrings.xml'),sheet=zip.get('xl/worksheets/sheet1.xml');if(!sheet)throw new Error('No se encontró la primera hoja de cálculo.');const strings=[];if(shared){const d=new DOMParser().parseFromString(new TextDecoder().decode(shared),'application/xml');for(const si of [...d.getElementsByTagName('si')])strings.push([...si.getElementsByTagName('t')].map(x=>x.textContent).join(''));}const d=new DOMParser().parseFromString(new TextDecoder().decode(sheet),'application/xml');const rows=[];for(const row of [...d.getElementsByTagName('row')]){const cells=[];for(const c of [...row.getElementsByTagName('c')]){const ref=c.getAttribute('r')||'',letters=(ref.match(/[A-Z]+/)||['A'])[0];let col=0;for(const ch of letters)col=col*26+ch.charCodeAt(0)-64;col--;const v=c.getElementsByTagName('v')[0]?.textContent??'';let val=c.getAttribute('t')==='s'?strings[Number(v)]??'':c.getAttribute('t')==='inlineStr'?[...c.getElementsByTagName('t')].map(x=>x.textContent).join(''):v;cells[col]=val;}rows.push(cells);}return tableToQuestions(rows);}
let pdfModule=null;async function parsePDF(file){try{if(!pdfModule){pdfModule=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');pdfModule.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';}const pdf=await pdfModule.getDocument({data:await file.arrayBuffer()}).promise;let text='';for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),content=await page.getTextContent();text+=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')+'\n\n';}return parseQuestionText(text);}catch(e){throw new Error('No pude extraer el texto del PDF. Comprueba que tenga texto seleccionable y conexión a Internet la primera vez.');}}

// ---------- Skill shop ----------
async function buySkill(classId,skillId){const skill=SKILLS[classId]?.find(n=>n.id===skillId);if(!skill||classHas(classId,skillId)||nextSkill(classId)?.id!==skillId)return;if(state.gold<skill.cost){showToast('No tienes suficiente oro.');return;}state.gold-=skill.cost;state.unlocks[classId].push(skillId);await saveState();showToast(`${skill.name} desbloqueado.`);}

// ---------- Game engine ----------
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function getClassSettings(id){
 const bought=state.unlocks[id]||[];
 const s={multiplier:1,skipEvery:3,skipCap:2,ninjaManualSkip:false,ninjaSkipCost:1,thiefRemove:1,thiefPeriodic:false,thiefDouble:false,thiefNoFifty:false,mageDelay:false,mageExtraQuestions:false,mageDouble:false,berserkerBonus:50000,berserkerNoRetreat:false,startingJokers:{fifty:1,hint:1,retry:1}};
 if(classHas(id,`${id}-sacrifice1`))s.startingJokers.retry=0;
 if(id==='ninja'){if(bought.includes('ninja-upgrade1')){s.ninjaManualSkip=true;s.skipCap=4;}if(bought.includes('ninja-sacrifice2'))s.ninjaSkipCost=2;if(bought.includes('ninja-mastery'))s.skipCap=6;}
 if(id==='thief'){if(bought.includes('thief-upgrade1'))s.thiefPeriodic=true;if(bought.includes('thief-sacrifice2'))s.thiefNoFifty=true;if(bought.includes('thief-mastery'))s.thiefDouble=true;}
 if(id==='mage'){if(bought.includes('mage-upgrade1'))s.mageDelay=true;if(bought.includes('mage-sacrifice2'))s.mageExtraQuestions=true;if(bought.includes('mage-mastery'))s.mageDouble=true;}
 if(id==='berserker'){s.multiplier=2;if(bought.includes('berserker-upgrade1'))s.multiplier=3;if(bought.includes('berserker-sacrifice2'))s.berserkerNoRetreat=true;if(bought.includes('berserker-mastery'))s.multiplier=4;}
 return s;
}
function selectedDocIds(){return (state.selectedDocuments||[]).slice();}
function startGame(){
 const ids=selectedDocIds(),pool=shuffle(uniqueQuestionList(sumQuestions(ids))),mode=selectedMode;
 if(!ids.length){showToast('Activa al menos un documento en Fuentes activas.');return;}
 const settings=mode==='campaign'?getClassSettings(selectedClass):null,baseLength=mode==='campaign'?(settings.mageExtraQuestions?35:30):0;
 if(mode==='campaign'&&pool.length<baseLength){showToast(`Esta campaña necesita ${baseLength} preguntas diferentes. Ahora tienes ${pool.length}.`);return;}
 if(mode==='campaign'&&selectedClass==='berserker'&&state.gold<=0){showToast('El Berserker exige tener oro en tu cartera.');return;}
 const docs=allDocs().filter(d=>ids.includes(d.id));
 const questions=pool.slice(0,mode==='campaign'?baseLength:Math.min(pool.length,$('#studyCount').value==='all'?pool.length:Number($('#studyCount').value)));
 game={mode,classId:mode==='campaign'?selectedClass:null,settings,questions,questionKeys:questions.map(questionFingerprint),extraQuestionPool:pool.slice(baseLength),newMastery:Array(questions.length).fill(false),index:0,correct:0,answered:0,answerLocked:false,runGold:0,secured:0,unsecured:0,initialGold:state.gold,started:Date.now(),elapsed:0,level1Time:null,level12Time:null,frenzy:false,frenzyChecked:false,frenzyActivated:false,frenzyEnds:0,frenzyJokers:{fifty:0,hint:0,retry:0},skipProgress:0,pendingSkips:0,effectMultiplier:1,skipAlternateActive:false,skipAlternateToggle:false,returnToStartUsed:false,mageDiceResolved:false,mageDicePostponed:false,mageDiceRolled:false,pendingDiceResults:[],pausedForDice:false,jokers:settings?{...settings.startingJokers}:{fifty:1,hint:1,retry:1},retryUsed:false,retryArmed:false,eliminated:[],selected:null,docIds:ids,subject:docs.map(d=>d.subjectName).filter((v,i,a)=>a.indexOf(v)===i).join(', '),wrong:[],levelProcessed:[false,false,false],studyDone:[],extraQuestionsAdded:0};
 $('#gameOverlay').classList.remove('hidden');document.body.classList.add('game-active');$('#gameModeLabel').textContent=mode==='campaign'?'CAMPAÑA':'MODO ESTUDIO';$('#playerClassName').textContent=game.classId?CLASS_INFO[game.classId].name:'Práctica';$('#playerEmblem').textContent=game.classId?CLASS_INFO[game.classId].icon:'✎';$('#playerClassAbility').textContent=game.classId?CLASS_INFO[game.classId].ability:'Sin riesgos: oro solo por preguntas nuevas dominadas';$('#retireGameButton').classList.toggle('hidden',mode==='study');$('#gameFrenzy').classList.add('hidden');$('#mageDicePanel').classList.add('hidden');$('#questionCard').classList.remove('hidden');$('#gameSidebar').classList.remove('hidden');
 if(clockTimer)clearInterval(clockTimer);clockTimer=setInterval(gameTick,250);loadGameQuestion();
}
function gameTick(){if(!game)return;game.elapsed=Math.floor((Date.now()-game.started)/1000);$('#gameTimer').textContent=`${String(Math.floor(game.elapsed/60)).padStart(2,'0')}:${String(game.elapsed%60).padStart(2,'0')}`;if(game.frenzy){const left=Math.max(0,Math.ceil((game.frenzyEnds-Date.now())/1000));$('#frenzyTimer').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(left<=0){game.frenzy=false;$('#gameFrenzy').classList.add('hidden');renderJokers();showToast('El frenesí ha terminado.');}}}
function loadGameQuestion(){
 if(!game)return;if(game.index>=game.questions.length){finishGame('victoria');return;}
 if(game.mode==='campaign'&&game.classId==='mage'&&!game.mageDiceResolved){const trigger=game.mageDicePostponed?14:9;if(game.index===trigger){showMageDicePrompt();return;}}
 if(game.mode==='campaign'&&game.classId==='mage'&&game.skipAlternateActive){if(!game.skipAlternateToggle){game.skipAlternateToggle=true;skipMageQuestion('El Mago saltó esta pregunta por el efecto de caos alternado.');return;}game.skipAlternateToggle=false;}
 const q=game.questions[game.index];game.selected=null;game.answerLocked=false;game.retryUsed=false;game.eliminated=[];
 $('#nextQuestionButton').classList.add('hidden');$('#skipQuestionButton').classList.add('hidden');$('#nextQuestionButton').textContent='Siguiente pregunta →';
 const lvl=game.mode==='campaign'?levelForQuestion(game.index+1):0;$('#gameLevelLabel').textContent=game.mode==='campaign'?(game.index+1>30?'DESAFÍO EXTRA':LEVELS[lvl].name.toUpperCase()):'MODO ESTUDIO';
 $('#gameQuestionLabel').textContent=`PREGUNTA ${game.index+1} / ${game.questions.length}`;$('#gameProgressFill').style.width=`${game.index/game.questions.length*100}%`;
 $('#questionSubject').textContent=game.subject||'BANCO DE PREGUNTAS';const fresh=!state.masteredQuestions[game.questionKeys[game.index]],multiplier=game.mode==='campaign'?campaignGoldMultiplier():1;
 $('#questionReward').textContent=game.mode==='study'?'ESTUDIO · SIN ORO':fresh?`+${fmt(Math.round((state.settings.questionGold||1000)*multiplier))} ◈ NUEVA`:'YA DOMINADA · 0 ◈';$('#questionReward').title=game.mode==='study'?'El modo Estudio no otorga oro':fresh?'Recompensa única por dominar esta pregunta':'Esta pregunta ya fue dominada; no vuelve a generar oro';
 $('#questionText').textContent=q.question;$('#answerHint').textContent='Toca dos veces una opción para confirmar.';$('#explanationBox').classList.add('hidden');$('#explanationBox').textContent='';
 $('#answerList').innerHTML=q.options.map((opt,i)=>`<button class="answer-option" data-answer="${i}"><span class="letter">${'ABCD'[i]}</span><span>${esc(opt)}</span></button>`).join('');$$('[data-answer]').forEach(b=>b.onclick=()=>chooseAnswer(Number(b.dataset.answer)));
 if(game.mode==='campaign'&&game.classId==='thief'){let remove=game.settings.thiefRemove;if(game.settings.thiefDouble||(game.settings.thiefPeriodic&&(game.index+1)%5===0))remove=2;const wrong=shuffle(q.options.map((_,i)=>i).filter(i=>i!==q.answer)).slice(0,Math.min(remove,2));wrong.forEach(i=>game.eliminated.push(i));refreshAnswerOptions();}
 if(game.mode==='campaign'&&game.classId==='ninja'&&game.pendingSkips>0){const cost=game.settings.ninjaSkipCost||1;if(game.settings.ninjaManualSkip){if(game.pendingSkips>=cost){$('#skipQuestionButton').classList.remove('hidden');$('#skipQuestionButton').textContent=`Usar salto · ${cost} carga${cost>1?'s':''} (${game.pendingSkips} disponibles) →`;}else{$('#answerHint').textContent=`Necesitas ${cost} cargas para usar un salto. Tienes ${game.pendingSkips}; responde para seguir acumulando.`;}}else{skipNinjaQuestion();return;}}
 $('#checkpointLabel').textContent=game.mode==='campaign'?`Próximo punto de control: pregunta ${Math.ceil((game.index+1)/5)*5}`:'Preguntas a tu ritmo · oro solo por nuevos aciertos';renderJokers();updateGameGold();
}
function refreshAnswerOptions(){const q=game.questions[game.index];$$('[data-answer]').forEach(b=>{const i=Number(b.dataset.answer);b.classList.toggle('eliminated',game.eliminated.includes(i));});}
function chooseAnswer(i){if(!game||game.answerLocked)return;const q=game.questions[game.index];if(game.eliminated.includes(i))return;if(game.selected===i){confirmAnswer(i);return;}game.selected=i;$$('[data-answer]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.answer)===i));$('#answerHint').textContent=`Respuesta ${'ABCD'[i]} seleccionada. Pulsa nuevamente para confirmar.`;}
function confirmAnswer(i){
 if(!game||game.answerLocked)return;const q=game.questions[game.index];if(i===q.answer){handleCorrect(false);return;}if(game.mode==='study'){handleStudyWrong(i);return;}
 if(game.retryArmed&&!game.retryUsed){game.retryUsed=true;game.retryArmed=false;renderJokers();$('#answerHint').textContent='La segunda oportunidad está activa. Elige otra respuesta y confirma.';game.selected=null;$$('[data-answer]').forEach(b=>b.classList.remove('selected'));return;}
 game.answerLocked=true;game.answered++;state.totals.answered++;game.wrong.push({question:q.question,options:q.options,chosen:i,correct:q.answer,explanation:q.explanation});showAnswerState(q.answer,'Respuesta incorrecta. La campaña ha terminado.');setTimeout(()=>finishGame('derrota'),1100);
}
function showAnswerState(correct,msg){$$('[data-answer]').forEach(b=>{const i=Number(b.dataset.answer);b.disabled=true;if(i===correct)b.classList.add('correct');else if(i===game.selected)b.classList.add('wrong');});$('#answerHint').textContent=msg;const q=game.questions[game.index];if(q.explanation){$('#explanationBox').textContent=q.explanation;$('#explanationBox').classList.remove('hidden');}}
function campaignGoldMultiplier(){if(!game||game.mode!=='campaign')return 1;return (game.settings?.multiplier||1)*(game.effectMultiplier||1);}
function applyCampaignMilestones(completed){
 if(game.mode!=='campaign')return;
 if([5,15,30].includes(completed)){
  const level=levelForQuestion(completed),start=level===0?0:level===1?5:15;
  if(!game.levelProcessed[level]){game.levelProcessed[level]=true;const newInLevel=game.newMastery.slice(start,completed).filter(Boolean).length;if(newInLevel>=Math.ceil(LEVELS[level].size*.6)){const bonusMultiplier=game.classId==='mage'?(game.effectMultiplier||1):1,bonus=Math.round(LEVELS[level].bonus*bonusMultiplier);game.runGold+=bonus;game.unsecured+=bonus;}}
 }
 if(completed===15&&!game.frenzyChecked){game.frenzyChecked=true;game.elapsed=Math.floor((Date.now()-game.started)/1000);game.level12Time=game.elapsed;if(game.elapsed<(state.settings.frenzyActivationSeconds||150))activateFrenzy();}
 if(completed%5===0)secureCheckpoint();
}
function skipNinjaQuestion(){if(!game||game.answerLocked)return;const cost=game.settings.ninjaSkipCost||1;if(game.pendingSkips<cost)return;const completed=game.index+1;game.pendingSkips-=cost;game.index++;applyCampaignMilestones(completed);$('#answerHint').textContent='El Ninja esquivó esta pregunta. No concede oro ni cuenta como pregunta dominada.';setTimeout(loadGameQuestion,240);}
function handleCorrect(converted){
 if(!game||game.answerLocked)return;game.answerLocked=true;const q=game.questions[game.index],key=game.questionKeys[game.index],isNew=!state.masteredQuestions[key];
 if(isNew)state.masteredQuestions[key]=true;game.newMastery[game.index]=game.newMastery[game.index]||isNew;game.correct++;game.answered++;state.totals.correct++;state.totals.answered++;
 const multiplier=game.mode==='campaign'?campaignGoldMultiplier():1,reward=game.mode==='campaign'&&isNew?Math.round((state.settings.questionGold||1000)*multiplier):0;game.runGold+=reward;
 if(game.mode==='campaign')game.unsecured+=reward;
 const rewardText=game.mode==='study'?'¡Correcto! El modo Estudio no otorga oro.':isNew?`¡Pregunta dominada! +${fmt(reward)} de oro.`:'¡Correcto! Esta pregunta ya estaba dominada: no genera oro otra vez.';showAnswerState(q.answer,converted?'Efecto aplicado. '+rewardText:rewardText);
 if(game.mode==='campaign'&&game.classId==='ninja'){game.skipProgress++;if(game.skipProgress>=game.settings.skipEvery){game.skipProgress=0;game.pendingSkips=Math.min(game.settings.skipCap,game.pendingSkips+2);if(game.pendingSkips>0)showToast(`¡Ninja! Tienes ${game.pendingSkips} saltos disponibles.`);}}
 const completed=game.index+1;if(game.mode==='campaign'){const before=game.runGold;applyCampaignMilestones(completed);if(game.runGold>before)$('#answerHint').textContent+=` · Bono por nivel: +${fmt(game.runGold-before)} ◈`;}
 if(game.mode==='study')game.studyDone.push({q,correct:true});saveState(false);updateGameGold();renderHeader();$('#nextQuestionButton').classList.remove('hidden');
}
function handleStudyWrong(i){if(!game||game.answerLocked)return;const q=game.questions[game.index];game.newMastery[game.index]=false;game.answerLocked=true;game.answered++;state.totals.answered++;game.wrong.push({question:q.question,options:q.options,chosen:i,correct:q.answer,explanation:q.explanation});game.studyDone.push({q,correct:false});showAnswerState(q.answer,'No pasa nada: revisa la respuesta correcta y aprende de ella.');saveState(false);$('#nextQuestionButton').classList.remove('hidden');}
function advanceGameQuestion(){if(!game||!game.answerLocked)return;game.index++;loadGameQuestion();}
function secureCheckpoint(){if(!game||game.mode!=='campaign'||game.classId==='berserker')return;if(game.unsecured>0){state.gold+=game.unsecured;game.secured+=game.unsecured;game.unsecured=0;saveState(false);}updateGameGold();}
function activateFrenzy(){if(!game||game.frenzy||game.frenzyActivated)return;game.frenzy=true;game.frenzyActivated=true;game.frenzyEnds=Date.now()+(state.settings.frenzySeconds||90)*1000;game.frenzyJokers={fifty:5,hint:5,retry:5};$('#gameFrenzy').classList.remove('hidden');renderJokers();showToast('¡FRENESÍ! 5 usos de cada comodín durante 90 segundos.');}
function updateGameGold(){if(!game)return;$('#gameGold').textContent=fmt(state.gold);$('#runGold').textContent=fmt(game.runGold);$('#securedGold').textContent=game.classId==='berserker'?`${fmt(game.runGold)} en riesgo`: `${fmt(game.secured)} asegurado` ;}
function renderJokers(){if(!game)return;const counts=game.frenzy?game.frenzyJokers:game.jokers;$('#jokerFifty').textContent=counts.fifty;$('#jokerHint').textContent=counts.hint;$('#jokerRetry').textContent=counts.retry;$$('[data-joker]').forEach(b=>{const key=b.dataset.joker,forbidden=key==='fifty'&&game.classId==='thief'&&game.settings.thiefNoFifty;b.disabled=counts[key]<=0||forbidden||game.pausedForDice;});}
function useJoker(key){
 if(!game||game.pausedForDice||game.answerLocked)return;if(key==='fifty'&&game.classId==='thief'&&game.settings.thiefNoFifty){showToast('El sacrificio del Ladrón impide usar 50/50.');return;}
 const counts=game.frenzy?game.frenzyJokers:game.jokers;if(!counts||counts[key]<=0)return;const q=game.questions[game.index];
 if(key==='fifty'){const visible=q.options.length-game.eliminated.length,maxRemove=Math.max(0,visible-2),remaining=q.options.map((_,i)=>i).filter(i=>i!==q.answer&&!game.eliminated.includes(i)),remove=shuffle(remaining).slice(0,Math.min(2,maxRemove));if(!remove.length){showToast('Ya quedan solo dos alternativas. No puedes eliminar más.');return;}counts.fifty--;game.eliminated.push(...remove);if(game.selected!=null&&game.eliminated.includes(game.selected)){game.selected=null;$$('[data-answer]').forEach(b=>b.classList.remove('selected'));}refreshAnswerOptions();showToast(`${remove.length} alternativa(s) eliminada(s). Siempre quedan al menos dos opciones.`);}
 else if(key==='hint'){counts.hint--;if(q.explanation){$('#explanationBox').textContent=q.explanation;$('#explanationBox').classList.remove('hidden');}else{$('#answerHint').textContent='Hint: analiza las palabras clave y descarta las alternativas que contradigan el concepto.';}}
 else if(key==='retry'){counts.retry--;game.retryUsed=false;game.retryArmed=true;showToast('Segunda oportunidad preparada para esta pregunta.');}renderJokers();
}
function showMageDicePrompt(){
 game.pausedForDice=true;$('#questionCard').classList.add('hidden');$('#gameSidebar').classList.add('hidden');$('#mageDicePanel').classList.remove('hidden');
 const postpone=game.settings.mageDelay&&!game.mageDicePostponed&&game.index===9;
 $('#mageDicePanel').innerHTML=`<div class="dice-eyebrow">PREGUNTA ${game.index+1} · HABILIDAD DEL MAGO</div><div class="dice-glyph">⚄</div><h2>Los dados del destino</h2><p>El azar cambiará las reglas de esta campaña. ${game.settings.mageDouble?'Lanzarás dos dados y elegirás uno de sus resultados.':'Lanza el dado para descubrir el efecto.'}</p><div id="mageDiceChoices" class="dice-choices"></div><div class="dice-actions"><button class="primary-button" data-dice-action="roll">Lanzar ${game.settings.mageDouble?'los dados':'el dado'}</button>${postpone?'<button class="secondary-button" data-dice-action="postpone">Posponer hasta la pregunta 15</button>':''}</div>`;renderJokers();
}
function rollMageDice(){
 if(!game||game.mageDiceRolled)return;game.mageDiceRolled=true;const count=game.settings.mageDouble?2:1;game.pendingDiceResults=Array.from({length:count},()=>1+Math.floor(Math.random()*6));
 $('#mageDiceChoices').innerHTML=game.pendingDiceResults.map((value,index)=>`<article class="dice-result"><span class="dice-number">${value}</span><div><b>${esc(MAGE_DICE[value].name)}</b><p>${esc(MAGE_DICE[value].desc)}</p></div>${count===2?`<button class="small-button" data-dice-action="choose" data-dice-index="${index}">Elegir este efecto</button>`:''}</article>`).join('');
 $('#mageDicePanel .dice-actions').innerHTML=count===1?'<button class="primary-button" data-dice-action="choose" data-dice-index="0">Aplicar resultado</button>':'<span class="dice-eyebrow">ELIGE UNO DE LOS DOS RESULTADOS</span>';
}
function skipMageQuestion(message){if(!game||game.index>=game.questions.length)return;const completed=game.index+1;game.index++;applyCampaignMilestones(completed);$('#answerHint').textContent=message;setTimeout(loadGameQuestion,180);}
function skipMageQuestions(count){let skipped=0;while(skipped<count&&game.index<game.questions.length){const completed=game.index+1;game.index++;skipped++;applyCampaignMilestones(completed);}showToast(`El Mago saltó ${skipped} pregunta(s). No generan oro ni cuentan como dominadas.`);}
function addMageExtraQuestions(){
 const current=new Set(game.questionKeys),extra=[];for(const q of game.extraQuestionPool){const key=questionFingerprint(q);if(!current.has(key)&&extra.length<5){extra.push(q);current.add(key);}}
 if(extra.length<5){const alreadySeen=game.questions.slice(0,game.index+1);for(const q of shuffle(alreadySeen)){if(extra.length>=5)break;extra.push(q);}}
 extra.forEach(q=>{game.questions.push(q);game.questionKeys.push(questionFingerprint(q));game.newMastery.push(false);});game.extraQuestionsAdded+=extra.length;showToast(`El Mago añadió ${extra.length} preguntas a la campaña.`);
}
function applyMageDiceEffect(value){
 if(!game||game.classId!=='mage'||game.mageDiceResolved)return;game.mageDiceResolved=true;game.pausedForDice=false;$('#mageDicePanel').classList.add('hidden');$('#questionCard').classList.remove('hidden');$('#gameSidebar').classList.remove('hidden');
 switch(value){
  case 1:game.effectMultiplier=4;showToast('Transmutación: las futuras ganancias de oro se multiplican ×4.');break;
  case 2:skipMageQuestions(10);break;
  case 3:game.skipAlternateActive=true;game.skipAlternateToggle=false;showToast('Caos alternado: se saltará una pregunta de cada dos, comenzando ahora.');break;
  case 4:if(!game.returnToStartUsed){game.returnToStartUsed=true;secureCheckpoint();game.index=0;game.skipAlternateActive=false;game.skipAlternateToggle=false;showToast('Regreso al origen. El oro queda conservado y las preguntas dominadas no pagan de nuevo.');}break;
  case 5:addMageExtraQuestions();break;
  case 6:{const types=['fifty','hint','retry'],got=[];for(let i=0;i<2;i++){const type=types[Math.floor(Math.random()*types.length)];game.jokers[type]++;got.push(type);}showToast(`Robo arcano: obtuviste ${got.map(x=>x==='fifty'?'50/50':x==='hint'?'Hint':'Reintentar').join(' y ')}.`);break;}
 }
 renderJokers();updateGameGold();loadGameQuestion();
}
function handleDiceAction(action,index){
 if(!game||!game.pausedForDice)return;
 if(action==='postpone'&&!game.mageDiceRolled){game.mageDicePostponed=true;game.pausedForDice=false;$('#mageDicePanel').classList.add('hidden');$('#questionCard').classList.remove('hidden');$('#gameSidebar').classList.remove('hidden');loadGameQuestion();return;}
 if(action==='roll'){rollMageDice();return;}if(action==='choose'){const value=game.pendingDiceResults[Number(index)];if(value)applyMageDiceEffect(value);}
}
function useNinjaSkip(){if(!game||game.classId!=='ninja'||!game.settings.ninjaManualSkip||game.pendingSkips<=0||game.answerLocked)return;skipNinjaQuestion();}
function retireGame(){if(!game)return;const berserkerLoss=game.classId==='berserker'&&game.settings.berserkerNoRetreat;const message=berserkerLoss?'El sacrificio Sin retirada está activo: perderás todo el oro acumulado en esta campaña. ¿Retirarte de todos modos?':'¿Retirarte y conservar el oro acumulado en esta campaña?';if(!confirm(message))return;finishGame('retiro');}
async function finishGame(outcome){
 if(!game)return;const g=game;clearInterval(clockTimer);clockTimer=null;let delta=0,penalty=0,bonus=0;
 const freshCount=g.newMastery.filter(Boolean).length,freshCampaign=g.mode==='campaign'&&freshCount>=Math.ceil(g.newMastery.length*.6),completionBonus=freshCampaign?(g.classId==='berserker'?g.settings.berserkerBonus:Math.round(10000*(g.classId==='mage'?(g.effectMultiplier||1):1))):0;
 if(g.mode==='campaign'){
  if(g.classId==='berserker'){
   if(outcome==='derrota'){penalty=Math.ceil(state.gold*.10);state.gold=Math.max(0,state.gold-penalty);delta=-g.runGold-penalty;}
   else if(outcome==='retiro'&&g.settings.berserkerNoRetreat){delta=-g.runGold;}
   else{state.gold+=g.runGold;delta=g.runGold;if(outcome==='victoria'&&completionBonus){bonus=completionBonus;state.gold+=bonus;delta+=bonus;}}
  }else if(outcome==='retiro'){state.gold+=g.unsecured;delta=g.runGold;g.secured+=g.unsecured;g.unsecured=0;}
  else if(outcome==='victoria'){state.gold+=g.unsecured+completionBonus;delta=g.runGold+completionBonus;bonus=completionBonus;g.unsecured=0;}
  else{delta=-g.unsecured;}
 }
 if(outcome==='victoria'&&g.mode==='campaign'){state.totals.completed++;if(g.level12Time!=null&&g.level12Time<150){const t=g.level12Time;if(state.totals.frenzyBest==null||t<state.totals.frenzyBest)state.totals.frenzyBest=t;}}
 if(outcome==='derrota'&&g.mode==='campaign')state.totals.failed++;
 const record={date:new Date().toISOString(),mode:g.mode,classId:g.classId,subject:g.subject||'Partida',correct:g.correct,answered:g.answered,gold:g.mode==='study'?g.runGold:delta,outcome:g.mode==='study'?'practica':outcome,runGold:g.runGold,bonus,penalty,wrong:g.wrong.length,mistakes:g.wrong};state.history.unshift(record);if(state.history.length>100)state.history.length=100;
 await saveState();$('#gameOverlay').classList.add('hidden');document.body.classList.remove('game-active');game=null;
 const title=outcome==='victoria'?(g.mode==='study'?'Práctica terminada':'¡Campaña completada!'):outcome==='retiro'?'Retirada estratégica':'Campaña perdida';let summary='';
 if(g.mode==='study')summary=`Respondiste correctamente ${g.correct} de ${g.answered} preguntas. El modo Estudio no entrega oro; las preguntas que domines quedan registradas y no podrán generar recompensas repetidas en campañas. ${g.wrong.length?`Tienes ${g.wrong.length} respuestas para repasar.`:'¡Excelente trabajo!'}`;
 else if(outcome==='derrota'&&g.classId==='berserker')summary=`Perdiste ${fmt(g.runGold)} de oro de campaña y pagaste una penalización del 10 % (${fmt(penalty)} de tu cartera). Las preguntas aprendidas siguen registradas y no volverán a generar oro.`;
 else if(outcome==='retiro'&&g.classId==='berserker'&&g.settings.berserkerNoRetreat)summary=`El sacrificio Sin retirada anuló los ${fmt(g.runGold)} de oro acumulados en la campaña. Tu cartera general no recibió una penalización adicional.`;
 else if(outcome==='derrota')summary=`Conservas ${fmt(g.secured)} de oro asegurado. Se perdió el oro obtenido después del último punto de control.`;
 else if(outcome==='retiro')summary=`Retirada con ${fmt(g.runGold)} de oro de campaña conservado.`;
 else summary=`Aciertos: ${g.correct}/${g.answered}. Oro generado: ${fmt(g.runGold)}${bonus?` (incluye ${fmt(bonus)} de bonificación por completar una campaña con al menos 60 % de preguntas nuevas)`:'. No hubo bonificación final porque no se alcanzó el 60 % de preguntas nuevas dominadas.'}`;
 openModal(title,`<div class="result-emblem">${outcome==='victoria'?'✧':outcome==='derrota'?'⚔':'◈'}</div><p class="result-summary">${esc(summary)}</p><div class="result-stats"><div><small>ACIERTOS</small><b>${g.correct}/${g.answered}</b></div><div><small>ORO DE CAMPAÑA</small><b>${fmt(g.runGold)}</b></div><div><small>ORO GENERAL</small><b>${fmt(state.gold)}</b></div></div>${g.wrong.length?`<div class="mistake-review"><h3>Preguntas para repasar</h3>${g.wrong.map((m,i)=>`<div><b>${i+1}. ${esc(m.question)}</b><p>Respuesta correcta: ${esc(m.options?.[m.correct]||'')}</p>${m.explanation?`<small>${esc(m.explanation)}</small>`:''}</div>`).join('')}</div>`:''}<div class="form-actions"><button class="primary-button" id="resultDone">Continuar</button></div>`,'RESULTADO');
 $('#resultDone').onclick=()=>{closeModal();nav('inicio');};renderAll();
}

function showHistoryReview(h){const items=h.mistakes||[];openModal('Repaso de errores',`<div class="mistake-review">${items.map((m,i)=>`<div><b>${i+1}. ${esc(m.question)}</b><p>Respuesta correcta: ${esc(m.options?.[m.correct]||'')}</p>${m.explanation?`<small>${esc(m.explanation)}</small>`:''}</div>`).join('')||'<p class="modal-note">No hay errores guardados.</p>'}</div><div class="form-actions"><button class="primary-button" id="closeReview">Cerrar</button></div>`,'REGISTRO');$('#closeReview').onclick=closeModal;}

// ---------- Settings and backup ----------
function settingsModal(){openModal('Configuración y respaldo',`<div class="form-stack"><p class="modal-note">Tu biblioteca, oro y progreso se guardan en este dispositivo. Exporta una copia para trasladarlos a otro navegador o equipo.</p><button class="secondary-button" id="exportBackup">Exportar copia de seguridad</button><label>Restaurar copia<input type="file" id="restoreBackup" accept=".json,application/json"></label><button class="secondary-button" id="downloadTemplate">Descargar plantilla TXT</button><div class="settings-danger"><b>Restablecer progreso</b><p>Vuelve a 1.000 de oro, bloquea las mejoras y limpia el historial. Conserva tus materias, documentos y el registro de preguntas ya dominadas para impedir que se vuelva a ganar oro con el mismo contenido.</p><button class="danger-button" id="resetProgressButton">Restablecer oro y personaje</button></div><p class="modal-note">No existe sincronización en la nube. Borrar los datos del navegador puede eliminar el progreso si no tienes una copia.</p></div>`,'AJUSTES');$('#exportBackup').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});downloadBlob(blob,'proba-backup.json');};$('#restoreBackup').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed.subjects||!parsed.unlocks)throw new Error();state=mergeState(parsed);selectedClass=state.settings.activeClass||'ninja';await saveState();closeModal();showToast('Copia restaurada correctamente.');}catch{showToast('El archivo de copia no es válido.');}};$('#downloadTemplate').onclick=()=>downloadBlob(new Blob([QUESTION_TEMPLATE],{type:'text/plain;charset=utf-8'}),'plantilla-preguntas-proba.txt');$('#resetProgressButton').onclick=async()=>{if(!confirm('¿Restablecer el oro a 1.000, bloquear todas las mejoras y borrar el historial? Tus materias, documentos y preguntas ya dominadas se conservarán.'))return;const mastery=state.masteredQuestions;state.gold=1000;state.unlocks={ninja:[],thief:[],mage:[],berserker:[]};state.history=[];state.totals={...DEFAULT_STATE.totals};state.masteredQuestions=mastery;state.settings={...state.settings,activeClass:'ninja'};selectedClass='ninja';await saveState();closeModal();showToast('Progreso restablecido. Tus preguntas dominadas siguen registradas.');};}
const QUESTION_TEMPLATE=`Pregunta 1: ¿Cuál es la capital de Ecuador?\nA) Guayaquil\nB) Quito\nC) Cuenca\nD) Loja\nRespuesta: B\nExplicación: Quito es la capital de Ecuador.\n\nPregunta 2: ¿Cuánto es 6 × 7?\nA) 36\nB) 40\nC) 42\nD) 48\nRespuesta: C\nExplicación: Seis multiplicado por siete es cuarenta y dos.\n\n`;
function downloadBlob(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

// ---------- UI events ----------
function bindEvents(){document.addEventListener('click',e=>{const navBtn=e.target.closest('[data-nav]');if(navBtn){nav(navBtn.dataset.nav);return;}const sa=e.target.closest('[data-subject-action]');if(sa){const id=sa.dataset.id;if(sa.dataset.subjectAction==='import')importToSubject(id);if(sa.dataset.subjectAction==='view')openDocumentManager(id);if(sa.dataset.subjectAction==='delete'){if(confirm('¿Eliminar la materia y todos sus documentos?')){const sub=state.subjects.find(s=>s.id===id);const gone=new Set((sub?.documents||[]).map(d=>d.id));state.subjects=state.subjects.filter(s=>s.id!==id);state.selectedDocuments=(state.selectedDocuments||[]).filter(docId=>!gone.has(docId));saveState();}}return;}const cc=e.target.closest('[data-class-card]');if(cc){selectedClass=cc.dataset.classCard;state.settings.activeClass=selectedClass;saveState(false);renderClasses();showToast(`${CLASS_INFO[selectedClass].name} es tu clase activa.`);return;}const buy=e.target.closest('[data-buy-skill]');if(buy){buySkill(buy.dataset.class,buy.dataset.buySkill);return;}const joker=e.target.closest('[data-joker]');if(joker){useJoker(joker.dataset.joker);return;}const dice=e.target.closest('[data-dice-action]');if(dice){handleDiceAction(dice.dataset.diceAction,dice.dataset.diceIndex);return;}const review=e.target.closest('[data-review-history]');if(review){const h=state.history[Number(review.dataset.reviewHistory)];if(h)showHistoryReview(h);return;}});
 $('#addSubjectButton').onclick=createSubject;$('#emptyAddSubject').onclick=createSubject;$('#settingsButton').onclick=settingsModal;$('#closeModal').onclick=closeModal;$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});$('#selectAllDocs').onclick=()=>{$$('.adventure-check').forEach(c=>c.checked=true);updateAdventure();};$$('[data-mode]').forEach(b=>b.onclick=()=>{selectedMode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.classList.toggle('selected',x===b));$('#campaignOptions').classList.toggle('hidden',selectedMode!=='campaign');$('#studyOptions').classList.toggle('hidden',selectedMode!=='study');updateAdventure();});$('#startGameButton').onclick=startGame;$('#nextQuestionButton').onclick=advanceGameQuestion;$('#skipQuestionButton').onclick=useNinjaSkip;$('#exitGameButton').onclick=()=>{if(game&&confirm('¿Cerrar esta partida?'))finishGame(game.mode==='study'?'retiro':'derrota');};$('#retireGameButton').onclick=retireGame;$('#clearHistoryButton').onclick=async()=>{if(confirm('¿Limpiar el historial? Tu oro y habilidades no cambiarán.')){state.history=[];await saveState();}};}

// ---------- Startup ----------
(async function init(){await loadState();selectedClass=state.settings.activeClass||'ninja';bindEvents();if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(console.warn);}renderAll();})();
