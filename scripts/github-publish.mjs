import {spawnSync} from 'node:child_process';import fs from 'node:fs';
// Use an already-authorized local Git credential, if present. Never log or persist it.
const filled=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},windowsHide:true,timeout:20000});
const values=Object.fromEntries((filled.stdout||'').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
if(!values.password){console.log(JSON.stringify({status:'blocked',reason:'No cached GitHub Git credential is available. Git credential manager cannot authenticate without an interactive connection.'}));process.exit(2);}
const headers={Authorization:`Bearer ${values.password}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
async function request(endpoint,method='GET',body){const r=await fetch('https://api.github.com'+endpoint,{method,headers,body:body?JSON.stringify(body):undefined});let data;try{data=await r.json();}catch{data={};}if(!r.ok)throw new Error(`${method} ${endpoint}: HTTP ${r.status} ${data.message || r.statusText}`);return data;}
try{
 const user=await request('/user');if(user.login.toLowerCase()!=='mkto46')throw new Error('The cached Git credential belongs to a different account; connected account MKTO46 is required.');
 if(process.argv.includes('--check')){console.log(JSON.stringify({status:'authenticated',login:user.login}));process.exit(0);}
 const repo=await request('/repos/MKTO46/kitty-quest-galaxy');
 const files=['package.json','manifest.webmanifest','sw.js','README.md','TEST_RESULTS.md','.gitignore','.github/workflows/pages.yml'];
 function collect(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${item.name}`;if(item.isDirectory())collect(p);else files.push(p);}}
 for(const dir of ['src','scripts','tests','reference','icons','dist'])collect(dir);
 const branch=repo.default_branch;const ref=await request(`/repos/${repo.full_name}/git/ref/heads/${branch}`);const parent=ref.object.sha;const tree=[];
 for(const file of files){const bytes=fs.readFileSync(file);const blob=await request(`/repos/${repo.full_name}/git/blobs`,'POST',{content:bytes.toString('base64'),encoding:'base64'});tree.push({path:file,mode:'100644',type:'blob',sha:blob.sha});}
 const parentCommit=await request(`/repos/${repo.full_name}/git/commits/${parent}`);
 const createdTree=await request(`/repos/${repo.full_name}/git/trees`,'POST',{base_tree:parentCommit.tree.sha,tree});
 const commit=await request(`/repos/${repo.full_name}/git/commits`,'POST',{message:'Build and test offline Kitty Quest Galaxy Autopilot V3.2 phone PWA',tree:createdTree.sha,parents:[parent]});
 await request(`/repos/${repo.full_name}/git/refs/heads/${branch}`,'PATCH',{sha:commit.sha});
 let pages;try{try{pages=await request(`/repos/${repo.full_name}/pages`);}catch{pages=await request(`/repos/${repo.full_name}/pages`,'POST',{build_type:'workflow'});} if(pages.build_type!=='workflow')pages=await request(`/repos/${repo.full_name}/pages`,'PUT',{build_type:'workflow'});}catch(e){console.log(JSON.stringify({status:'code-pushed-pages-blocked',repository:repo.html_url,commit:commit.sha,reason:e.message}));process.exit(3);}
 fs.writeFileSync('PUBLISH_STATUS.json',JSON.stringify({repository:repo.html_url,fullName:repo.full_name,commit:commit.sha,pages:pages.html_url,status:pages.status},null,2));
 console.log(JSON.stringify({status:'pushed-pages-configured',repository:repo.html_url,fullName:repo.full_name,commit:commit.sha,pages:pages.html_url,pagesStatus:pages.status}));
}catch(e){console.log(JSON.stringify({status:'blocked',reason:e.message}));process.exit(2);}
