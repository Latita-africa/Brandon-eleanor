const base=JSON.parse(document.getElementById('pageConfig').textContent);
const fromBrowser=(()=>{try{return JSON.parse(localStorage.getItem('weddingSiteConfigNavyV2')||'{}')}catch{return {}}})();
async function openThePhotographPage(){
 let fromPublished={};
 try{
   const response=await fetch('/',{cache:'no-store'});
   if(response.ok){
     const doc=new DOMParser().parseFromString(await response.text(),'text/html');
     const config=doc.getElementById('siteDefaults');
     if(config)fromPublished=JSON.parse(config.textContent);
   }
 }catch(e){}
 const cfg={...base,...fromPublished,...fromBrowser};
 window.photoPageSettings=cfg;
 const bg=cfg.backgroundPhotos?.moments;
 if(bg && typeof bg.image==='string' && bg.image){
   const alpha=Number.isFinite(Number(bg.overlay))?Math.min(.98,Math.max(.15,Number(bg.overlay))):.76;
   const hero=document.querySelector('.hero');
   hero.style.backgroundImage=`linear-gradient(rgba(8,21,44,${alpha}),rgba(8,21,44,${alpha})),url("${bg.image.replace(/"/g,'%22')}")`;
   hero.style.backgroundPosition=bg.position||'center';
   hero.classList.add('with-custom-photo');
 }

 document.getElementById('initials').innerHTML=(cfg.firstName[0]||'B')+' <span>&amp;</span> '+(cfg.secondName[0]||'E');
 for(const [id,key] of Object.entries({photoEyebrow:'photoPageEyebrow',photoTitle:'photoPageTitle',photoIntro:'photoPageIntro',closedTitle:'photoPageComing',openDate:'photoPageDate',futureNote:'photoPageNote'})){
  document.getElementById(id).textContent=cfg[key]||base[key];
 }
 document.getElementById('signed').textContent=cfg.firstName+' & '+cfg.secondName+' · The wedding';
 // A true upload service is shown only once the wedding owner has configured a real Wix form and explicitly enabled it.
 if(cfg.photoUploadsEnabled===true && typeof cfg.photoFormId==='string' && /^[0-9a-f-]{36}$/i.test(cfg.photoFormId)){
  document.getElementById('uploadArea').hidden=false;
  document.getElementById('closedStatus').hidden=true;
  document.getElementById('futureNote').hidden=true;
  window.dispatchEvent(new CustomEvent('guest-photo-form-ready',{detail:{formId:cfg.photoFormId}}));
 }
}
openThePhotographPage();
