import {freshState,migrate} from './core.js';
const DB_NAME='kitty-quest-galaxy';
export class Store {
  constructor(){this.db=null;this.queue=Promise.resolve();}
  async open(){
    this.db=await new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,2);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('state'))db.createObjectStore('state');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Close another Kitty Quest tab to finish the storage upgrade.'));});
    this.db.onversionchange=()=>this.db.close();
    const raw=await new Promise((resolve,reject)=>{const tx=this.db.transaction('state','readonly');const req=tx.objectStore('state').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    let legacy=null;
    if(!raw){try{legacy=JSON.parse(localStorage.getItem('trial_autopilot_v3'));}catch{}}
    const state=raw?migrate(raw):legacy?migrate({...legacy,schema:1}):freshState();
    await this.save(state);return state;
  }
  save(state){
    const snapshot=structuredClone(state);
    const write=()=>new Promise((resolve,reject)=>{const tx=this.db.transaction('state','readwrite');tx.objectStore('state').put(snapshot,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || new Error('Save was interrupted.'));});
    const result=this.queue.then(write);this.queue=result.catch(()=>{});return result;
  }
}
