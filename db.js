/* PROBA · IndexedDB local storage */
(()=>{'use strict';
const DB_NAME='proba.library.v1',DB_VERSION=1;
let dbPromise;
function openDB(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains('subjects'))db.createObjectStore('subjects',{keyPath:'id'});
      if(!db.objectStoreNames.contains('documents')){const s=db.createObjectStore('documents',{keyPath:'id'});s.createIndex('subjectId','subjectId',{unique:false});}
      if(!db.objectStoreNames.contains('attempts'))db.createObjectStore('attempts',{keyPath:'questionId'});
      if(!db.objectStoreNames.contains('sessions'))db.createObjectStore('sessions',{keyPath:'id'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{dbPromise=null;reject(request.error||new Error('No se pudo abrir la biblioteca local.'));};
    request.onblocked=()=>reject(new Error('Cierra otras pestañas de PROBA y vuelve a intentarlo.'));
  });
  return dbPromise;
}
async function getAll(storeName){const db=await openDB();return new Promise((resolve,reject)=>{const req=db.transaction(storeName,'readonly').objectStore(storeName).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}
async function get(storeName,key){const db=await openDB();return new Promise((resolve,reject)=>{const req=db.transaction(storeName,'readonly').objectStore(storeName).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}
async function put(storeName,value){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(value);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
async function remove(storeName,key){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);});}
async function getDocumentsForSubject(subjectId){const db=await openDB();return new Promise((resolve,reject)=>{const index=db.transaction('documents','readonly').objectStore('documents').index('subjectId');const req=index.getAll(subjectId);req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}
async function getAttempts(){return getAll('attempts');}
async function recordAttempt(question,subjectId,documentId,correct){
  const previous=await get('attempts',question.id)||{questionId:question.id,subjectId,documentId,attempts:0,correct:0,wrong:0};
  previous.subjectId=subjectId;previous.documentId=documentId;previous.attempts+=1;
  if(correct)previous.correct+=1;else previous.wrong+=1;
  previous.lastAt=Date.now();
  return put('attempts',previous);
}
async function clear(){const db=await openDB();await Promise.all(['subjects','documents','attempts','sessions'].map(name=>new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite');tx.objectStore(name).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);})));}
window.ProbaDB={openDB,getAll,get,put,remove,getDocumentsForSubject,getAttempts,recordAttempt,clear};
})();
