import { createFormStore, FORM_ERROR } from '/js/wix/form-store.js';
const $=id=>document.getElementById(id);
const escapeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let started=false;
function startPhotoForm(formId){
 if(started)return;
 started=true;
 const store=createFormStore({formId});
 const form=$('wixPhotoUploadForm'), fieldRoot=$('photoFormFields'), status=$('photoFormStatus');
 let rendered='';
 function makeField(f){
  const t=escapeText(f.target),label=escapeText(f.label),val=store.getState().values[f.target]||'';
  const required=f.required?' <span aria-hidden="true">*</span>':'';
  let input='';
  if(f.control==='file'||f.control==='signature'){
   input='<input type="file" name="'+t+'" accept="image/*"'+(f.validation?.fileLimit>1?' multiple':'')+' '+(f.required?'required':'')+'>';
  }else if(f.control==='textarea'){
   input='<textarea name="'+t+'" rows="3" placeholder="'+escapeText(f.placeholder||'')+'">'+escapeText(val)+'</textarea>';
  }else if(f.control==='select'){
   input='<select name="'+t+'"><option value="">Please select</option>'+f.choices.map(c=>'<option value="'+escapeText(c.value)+'">'+escapeText(c.label)+'</option>').join('')+'</select>';
  }else{
   input='<input type="'+(f.control==='email'?'email':'text')+'" name="'+t+'" value="'+escapeText(val)+'" placeholder="'+escapeText(f.placeholder||'')+'">';
  }
  return '<div class="photo-field"><label>'+label+required+'</label>'+input+(f.description?'<p class="photo-help">'+escapeText(f.description)+'</p>':'')+'<p class="photo-error" data-photo-error="'+t+'" hidden></p></div>';
 }
 function show(s){
  if(!s.form){status.textContent=s.errors[FORM_ERROR]||'Preparing the photo upload form...';form.hidden=true;return}
  if(s.closed){status.textContent=s.form.disabledMessage||'Photo sharing is not available yet.';form.hidden=true;return}
  if(!(s.form.fields||[]).some(f=>f.control==='file')){status.textContent='Photo uploading is not configured yet. Please return after the couple opens this space.';form.hidden=true;return}
  if(s.outcome){status.textContent=s.outcome.message||'Thank you for sharing these moments with us.';form.hidden=true;return}
  status.textContent='';form.hidden=false;
  const step=s.form.steps[s.step]||s.form.steps[0];
  const shown=s.form.fields.filter(f=>f.stepId===step.id);
  const shape=shown.map(f=>f.target+':'+f.control).join('|');
  if(shape!==rendered){fieldRoot.innerHTML=shown.map(makeField).join('');rendered=shape}
  for(const f of shown){
    const error=fieldRoot.querySelector('[data-photo-error="'+f.target+'"]');
    if(error){error.textContent=s.errors[f.target]||'';error.hidden=!s.errors[f.target]}
  }
  $('photoFormError').textContent=s.errors[FORM_ERROR]||'';
  $('photoFormError').hidden=!s.errors[FORM_ERROR];
  $('photoFormSubmit').disabled=s.loading;
  $('photoFormSubmit').textContent=s.loading?'Sending photographs...':'Share your photographs';
 }
 store.subscribe(show);show(store.getState());store.start();
 form.addEventListener('input',e=>{
  const inp=e.target;if(!inp.name||inp.type==='file')return;
  store.setValue(inp.name,inp.type==='checkbox'?inp.checked:inp.value);
 });
 form.addEventListener('change',e=>{
  const inp=e.target;if(inp.name&&inp.type==='file')store.setValue(inp.name,[...inp.files]);
 });
 form.addEventListener('focusout',e=>{if(e.target.name)store.validate(e.target.name)});
 form.addEventListener('submit',e=>store.submit(e));
 window.addEventListener('pagehide',()=>store.stop(),{once:true});
 }
window.addEventListener('guest-photo-form-ready',(event)=>startPhotoForm(event.detail.formId));
// A cached guest config may arrive before the Wix module imports have loaded.
if(window.photoPageSettings?.photoUploadsEnabled && window.photoPageSettings?.photoFormId){
 startPhotoForm(window.photoPageSettings.photoFormId);
}

// Handle activation even when the page configuration event ran before this module loaded.
if(window.photoPageSettings?.photoUploadsEnabled && window.photoPageSettings?.photoFormId){
  window.dispatchEvent(new CustomEvent('guest-photo-form-ready', { detail: {formId: window.photoPageSettings.photoFormId} }));
}
