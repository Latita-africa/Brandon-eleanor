/* Household RSVP: published invited names are queried from Wix CMS. Individual responses
   are saved together in a real Wix Forms submission. Names alone are NOT verified identity;
   confidential access and duplicate prevention require an authenticated server backend. */
import { createFormStore, FORM_ERROR } from '/js/wix/form-store.js';
import { queryItems, countItems } from '/js/wix/items.js';
const FORM_ID = 'bc6864c8-e010-46a2-849f-b90ffa42c05f';
const COLLECTION = 'BrandonEleanorGuests';
const REQUIRED_TARGETS = ['respondent_name','respondent_guest_id','household_id','household_name','household_attendance_json','household_attendance_summary','household_attending_total','household_declining_total','household_note'];
const host = document.getElementById('rsvpForm');
const form = document.getElementById('wixRsvpSubmission');
const fieldsHost = document.getElementById('wixRsvpFields');
const errorHost = document.getElementById('wixRsvpError');
const statusHost = document.getElementById('rsvpFormStatus');
const successHost = document.getElementById('wixRsvpSuccess');
const submitBtn = document.getElementById('wixRsvpSend');
const searchInput = document.getElementById('guestSearchInput');
const searchResults = document.getElementById('guestSearchResults');
const searchStatus = document.getElementById('guestSearchStatus');
const selectedCard = document.getElementById('guestChosen');
const selectedName = document.getElementById('guestChosenName');
const selectedCapacity = document.getElementById('guestChosenCapacity');
const changeName = document.getElementById('guestChange');
const searchLine = document.querySelector('#guestLookup .guest-search-line');
const esc = s => String(s ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const store = createFormStore({ formId: FORM_ID });
let selectedGuest = null;
let members = [];
let selectedHouseholdId = '';
let selectedHouseholdName = '';
let answers = new Map();
let currentRosterKey = '';
let submitted = false;
let searchTimer = null;
let searchGeneration = 0;
let chooseGeneration = 0;
let listEmpty = false;
function cfg(){ return window.getInvitationEditorState?.() || {}; }
function textFor(k,fallback){ const v=cfg()[k];return typeof v==='string' && v.trim() ? v : fallback; }
function setSearchMessage(t){ searchStatus.textContent=t; }
function searchResultsClear(){ searchResults.hidden=true; searchResults.replaceChildren(); }
function person(item){
  return {
    id:String(item?._id || item?.id || '').trim(),
    name:String(item?.displayName || item?.name || '').trim(),
    householdId:String(item?.householdId || '').trim(),
    householdName:String(item?.householdName || '').trim(),
    guestType:String(item?.guestType || '').trim().toLowerCase(),
    legacyAllowance:Number(item?.partySize || item?.legacyAllowance || 1)
  };
}
function householdTitle(selected,group){
  return selected.householdName || group.find(x=>x.householdName)?.householdName || (group.length>1 ? 'Your household invitation' : selected.name);
}
function tidyName(s){return String(s||'').trim().replace(/\s+/g,' ')}
function updateLookupCopy(){
  document.getElementById('guestSearchLabel').textContent=textFor('rsvpNameSearchLabel','Find your name on the guest list');
  searchInput.placeholder=textFor('rsvpNameSearchPlaceholder','Start typing your name and surname');
  changeName.textContent=textFor('rsvpChooseAnother','Choose another');
  selectedCard.querySelector('.guest-chosen-label').textContent=textFor('rsvpSelectedCaption','Your household invitation');
  if(selectedGuest){
    selectedName.textContent=selectedHouseholdName;
    selectedCapacity.textContent=textFor('rsvpGuestsAllowed','Invited family members')+': '+members.length;
  }
}
function resetSelection(){
  if(submitted) return;
  chooseGeneration++;
  selectedGuest=null;members=[];answers.clear();selectedHouseholdId='';selectedHouseholdName='';currentRosterKey='';
  selectedCard.hidden=true;searchLine.hidden=false;searchInput.hidden=false;searchStatus.hidden=false;
  searchInput.value='';searchResultsClear();
  errorHost.hidden=true;errorHost.textContent='';
  setSearchMessage(listEmpty?textFor('rsvpGuestListEmpty','The invited guest list is being finalised.'):textFor('rsvpNameSearchHelp','Enter at least two letters to find your name.'));
  render(store.getState());searchInput.focus();
}
changeName.addEventListener('click',resetSelection);
async function chooseGuest(guest){
  const selected=person(guest);
  if(!selected.id||!selected.name){setSearchMessage('This guest entry is incomplete. Please contact the couple.');return;}
  const generation=++chooseGeneration;
  searchGeneration++;searchResultsClear();
  setSearchMessage('Opening your household invitation…');
  try{
    let group=[selected];
    if(selected.householdId){
      const result=await queryItems(COLLECTION,{filters:[{field:'householdId',op:'eq',value:selected.householdId}],sort:[{field:'displayName',direction:'asc'}],limit:100});
      if(generation!==chooseGeneration)return;
      if(result.hasNext)throw new Error('The household contains too many records to display safely.');
      group=(result.items||[]).map(person).filter(g=>g.id&&g.name&&g.householdId===selected.householdId);
      if(!group.some(g=>g.id===selected.id))throw new Error('Selected guest is missing from their household.');
    }else if(selected.legacyAllowance>1){
      setSearchMessage(textFor('rsvpHouseholdLegacy','This invitation needs individual guest names added by the couple before an RSVP can be submitted.'));
      return;
    }
    const uniq=new Map(group.map(g=>[g.id,g]));
    group=[...uniq.values()];
    if(!group.length || group.length>100)throw new Error('The invited household list is unavailable.');
    if(generation!==chooseGeneration)return;
    selectedGuest=selected;
    selectedHouseholdId=selected.householdId || 'single:'+selected.id;
    selectedHouseholdName=householdTitle(selected,group);
    members=group;
    answers=new Map(group.map(p=>[p.id,{status:'',dietary:''}]));
    searchInput.value='';searchInput.hidden=true;searchLine.hidden=true;
    searchStatus.hidden=true;selectedCard.hidden=false;
    updateLookupCopy();currentRosterKey='';
    render(store.getState());
  }catch(e){
    if(generation!==chooseGeneration)return;
    console.error('Household lookup failed',e);
    setSearchMessage(textFor('rsvpHouseholdNoMatch','We could not open that household. Please contact the couple.'));
  }
}
async function runSearch(text){
  const term=tidyName(text);
  const generation=++searchGeneration;
  if(selectedGuest || term.length<2){searchResultsClear();setSearchMessage(textFor('rsvpNameSearchHelp','Enter at least two letters to search.'));return;}
  if(listEmpty){searchResultsClear();setSearchMessage(textFor('rsvpGuestListEmpty','The invited guest list is being finalised.'));return;}
  setSearchMessage('Searching invitations…');
  try{
    const page=await queryItems(COLLECTION,{filters:[{field:'displayName',op:'contains',value:term}],sort:[{field:'displayName',direction:'asc'}],limit:10});
    if(generation!==searchGeneration || selectedGuest)return;
    const matches=(page.items||[]).map(person).filter(p=>p.id&&p.name);
    searchResults.replaceChildren();
    if(!matches.length){setSearchMessage(textFor('rsvpNoMatch',"We couldn't find that name. Please contact the couple."));searchResultsClear();return;}
    for(const g of matches){
      const button=document.createElement('button');button.type='button';button.className='guest-result';button.setAttribute('role','option');
      const details=document.createElement('span');details.className='guest-result-details';
      const n=document.createElement('span');n.textContent=g.name;details.append(n);
      if(g.householdName){const household=document.createElement('small');household.className='guest-family-name';household.textContent=g.householdName;details.append(household);}
      const arrow=document.createElement('span');arrow.className='find-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      button.append(details,arrow);button.addEventListener('click',()=>chooseGuest(g));searchResults.append(button);
    }
    searchResults.hidden=false;
    setSearchMessage(matches.length>=10?'If your name is not shown, enter more letters.':'Select your name to see everyone included in your invitation.');
  }catch(e){
    if(generation!==searchGeneration)return;
    console.error('Guest search unavailable',e);
    searchResultsClear();setSearchMessage('Invitation search is unavailable. Please try again shortly.');
  }
}
searchInput.addEventListener('input',()=>{
  searchGeneration++;searchResultsClear();if(searchTimer)clearTimeout(searchTimer);
  const term=searchInput.value;
  if(tidyName(term).length<2){setSearchMessage(listEmpty?textFor('rsvpGuestListEmpty','The guest list is being finalised.'):textFor('rsvpNameSearchHelp','Enter at least two letters to find your name.'));return;}
  searchTimer=setTimeout(()=>runSearch(term),280);
});
searchInput.addEventListener('keydown',e=>{
  if(e.key==='Escape')searchResultsClear();
  if(e.key==='ArrowDown'&&!searchResults.hidden){e.preventDefault();searchResults.querySelector('button')?.focus();}
});
searchResults.addEventListener('keydown',e=>{if(e.key==='Escape'){searchInput.focus();searchResultsClear();}});
countItems(COLLECTION).then(n=>{
  listEmpty=Number(n)===0;
  if(!selectedGuest&&!searchInput.value.trim())setSearchMessage(listEmpty?textFor('rsvpGuestListEmpty','The guest list is being finalised.'):textFor('rsvpNameSearchHelp','Enter at least two letters to find your name.'));
}).catch(e=>console.warn('Unable to count invited names',e));
function drawing(){
  let html='<div class="rsvp-details-step">02 &nbsp; YOUR HOUSEHOLD REPLY</div>';
  html+='<p class="household-rsvp-intro">'+esc(textFor('rsvpHouseholdInstructions','Please respond for each person named on your invitation.'))+'</p>';
  html+='<div class="household-roster">';
  for(const p of members){
    const saved=answers.get(p.id)||{status:'',dietary:''};
    const safeId=esc(p.id);
    html+='<article class="household-member" data-member-id="'+safeId+'">';
    html+='<div class="household-member-head"><h4 class="household-member-name">'+esc(p.name)+'</h4>'+(p.guestType?'<span class="household-member-type">'+esc(p.guestType)+'</span>':'')+'</div>';
    html+='<fieldset class="household-choices" aria-label="Attendance for '+esc(p.name)+'">';
    const radioName='household_answer_'+safeId;
    for(const [value,labelKey,label] of [['accept','rsvpHouseholdAccept','Joyfully accepts'],['decline','rsvpHouseholdDecline','Regretfully declines']]){
      html+='<label class="household-choice"><input type="radio" name="'+radioName+'" value="'+value+'" data-attendance-id="'+safeId+'"'+(saved.status===value?' checked':'')+'><span>'+esc(textFor(labelKey,label))+'</span></label>';
    }
    html+='</fieldset>';
    html+='<div class="household-dietary"'+(saved.status==='accept'?'':' hidden')+'><label>'+esc(textFor('rsvpHouseholdDietaryLabel','Dietary requirements (optional)'))+'</label><input type="text" data-dietary-id="'+safeId+'" maxlength="180" placeholder="None, vegetarian, allergies…" value="'+esc(saved.dietary)+'"></div>';
    html+='</article>';
  }
  html+='</div><div class="household-foot"><p id="householdProgress" class="household-progress" aria-live="polite"></p>';
  html+='<label class="household-note-label" for="householdMessage">'+esc(textFor('rsvpHouseholdNoteLabel','A note for the couple (optional)'))+'</label>';
  html+='<textarea id="householdMessage" class="household-note" maxlength="800" rows="3" placeholder="Share a message with us if you wish"></textarea>';
  html+='<p class="household-error" id="householdValidation" role="alert" hidden></p></div>';
  fieldsHost.innerHTML=html;
  updateProgress();
}
function updateProgress(){
  const completed=members.filter(p=>answers.get(p.id)?.status).length;
  const target=document.getElementById('householdProgress');
  if(target)target.textContent=textFor('rsvpHouseholdProgress','Responses completed')+': '+completed+' / '+members.length;
}
fieldsHost.addEventListener('change',event=>{
  const input=event.target.closest('input[data-attendance-id]');
  if(!input)return;
  const id=input.dataset.attendanceId;
  const ans=answers.get(id);
  if(!ans)return;
  ans.status=input.value;
  const panel=input.closest('.household-member');
  const diet=panel?.querySelector('.household-dietary');
  if(diet)diet.hidden=ans.status!=='accept';
  if(ans.status!=='accept')ans.dietary='';
  const validation=document.getElementById('householdValidation');
  if(validation)validation.hidden=true;
  updateProgress();
});
fieldsHost.addEventListener('input',event=>{
  const input=event.target.closest('input[data-dietary-id]');
  if(!input)return;
  const ans=answers.get(input.dataset.dietaryId);
  if(ans)ans.dietary=input.value.slice(0,180);
});
function render(s){
  updateLookupCopy();
  if(!selectedGuest){form.hidden=true;successHost.hidden=true;statusHost.hidden=false;statusHost.textContent=listEmpty?textFor('rsvpGuestListEmpty','The guest list is being finalised.'):'Select your invited name above to continue.';return;}
  if(!s.form){form.hidden=true;successHost.hidden=true;statusHost.hidden=false;statusHost.textContent=s.errors[FORM_ERROR]?'RSVP temporarily unavailable: '+s.errors[FORM_ERROR]:'Preparing your household reply…';return;}
  if(s.closed){form.hidden=true;successHost.hidden=true;statusHost.hidden=false;statusHost.textContent=s.form.disabledMessage||'RSVP submissions are closed.';return;}
  if(s.outcome){
    submitted=true;form.hidden=true;statusHost.hidden=true;successHost.hidden=false;
    const accepted=members.filter(p=>answers.get(p.id)?.status==='accept').length;
    const declined=members.length-accepted;
    const h=document.createElement('h3');h.textContent='Thank you';
    const p=document.createElement('p');p.textContent=textFor('rsvpHouseholdSuccess','Thank you for replying. Your household RSVP has been received.');
    const totals=document.createElement('p');totals.textContent=accepted+' attending · '+declined+' unable to attend';
    successHost.replaceChildren(h,p,totals);return;
  }
  if(submitted)return;
  statusHost.hidden=true;successHost.hidden=true;form.hidden=false;
  const available=new Set((s.form.fields||[]).map(f=>f.target));
  if(REQUIRED_TARGETS.some(target=>!available.has(target))){
    form.hidden=true;statusHost.hidden=false;statusHost.textContent='The household RSVP form is missing a required field. Please contact the couple.';return;
  }
  const key=selectedHouseholdId+'|'+members.map(p=>p.id).join('|');
  if(currentRosterKey!==key){drawing();currentRosterKey=key;}
  const formError=s.errors[FORM_ERROR];
  errorHost.hidden=!formError;errorHost.textContent=formError||'';
  submitBtn.disabled=Boolean(s.loading);
  submitBtn.textContent=s.loading?'Sending household reply…':textFor('rsvpSubmitButton','Send our RSVP');
}
document.addEventListener('invitation-copy-changed',()=>{currentRosterKey='';if(!submitted)render(store.getState());});
store.subscribe(render);render(store.getState());store.start();
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(submitted||store.getState().loading)return;
  errorHost.hidden=true;errorHost.textContent='';
  if(!selectedGuest||!selectedHouseholdId||!members.length){setSearchMessage('Please select an invited name first.');searchInput.focus();return;}
  const missing=members.filter(p=>!answers.get(p.id)?.status);
  if(missing.length){
    const err=document.getElementById('householdValidation');
    if(err){err.hidden=false;err.textContent='Please select Accept or Decline for each invited person before submitting.';}
    fieldsHost.querySelector('[data-attendance-id="'+CSS.escape(missing[0].id)+'"]')?.focus();
    return;
  }
  const records=members.map(p=>{
    const answer=answers.get(p.id);
    return {guestId:p.id,name:p.name,guestType:p.guestType||null,decision:answer.status==='accept'?'Joyfully accepts':'Regretfully declines',attending:answer.status==='accept',dietaryRequirements:answer.status==='accept'?answer.dietary.trim():''};
  });
  const accepted=records.filter(r=>r.attending).length;
  const declined=records.length-accepted;
  const payload={version:1,householdId:selectedHouseholdId,householdName:selectedHouseholdName,respondentGuestId:selectedGuest.id,responses:records};
  const json=JSON.stringify(payload);
  if(json.length>14000){errorHost.hidden=false;errorHost.textContent='This household response is too large. Please contact the couple.';return;}
  const readable=records.map(r=>r.name+' ('+(r.guestType||'guest')+'): '+r.decision+(r.dietaryRequirements?' | Dietary: '+r.dietaryRequirements:'')).join('\n');
  const values={
    respondent_name:selectedGuest.name,
    respondent_guest_id:selectedGuest.id,
    household_id:selectedHouseholdId,
    household_name:selectedHouseholdName,
    household_attendance_json:json,
    household_attendance_summary:readable,
    household_attending_total:String(accepted),
    household_declining_total:String(declined),
    household_note:document.getElementById('householdMessage')?.value?.trim().slice(0,800)||''
  };
  for(const [target,value] of Object.entries(values))store.setValue(target,value);
  try{await store.submit(event)}catch(e){console.error('RSVP submission failed',e);errorHost.hidden=false;errorHost.textContent='We could not send your RSVP. Please try again.';}
});
window.addEventListener('pagehide',()=>store.stop(),{once:true});
