const DEFAULTS=JSON.parse(document.getElementById('siteDefaults').textContent);let data;try{data={...DEFAULTS,...JSON.parse(localStorage.getItem('weddingSiteConfigNavyV2')||'{}')}}catch{data={...DEFAULTS}};let photoUrls={};const $=id=>document.getElementById(id);const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const prettyDate=()=>{let d=new Date(data.weddingDate);return isNaN(d)?'[Wedding date]':d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})};const shortDate=()=>{let d=new Date(data.weddingDate);return isNaN(d)?'[Wedding date]':d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})};function save(){try{localStorage.setItem('weddingSiteConfigNavyV2',JSON.stringify(data))}catch(e){toast('Your images may be too large for local storage. Download a copy.')}}if(typeof data.rsvpSubmitButton==='string' && /WhatsApp/i.test(data.rsvpSubmitButton))data.rsvpSubmitButton='Send my RSVP';
if(typeof data.rsvpNoteText==='string' && /WhatsApp/i.test(data.rsvpNoteText))data.rsvpNoteText='One reply for your household, with an individual response for every invited person. Responses are saved through Wix Forms.';
function apply(){document.dispatchEvent(new Event('invitation-copy-changed'));document.querySelectorAll('[data-edit]').forEach(el=>{el.textContent=data[el.dataset.edit]??''});$('brand').innerHTML=escapeHtml(data.firstName.charAt(0)||'A')+' <span>&</span> '+escapeHtml(data.secondName.charAt(0)||'B');$('heroFirst').textContent=data.firstName;$('heroSecond').textContent=data.secondName;$('heroDate').textContent=`${prettyDate()} · ${data.city}`;$('signature').textContent=`${data.firstName} & ${data.secondName}`;$('footerNames').textContent=`${data.firstName} & ${data.secondName}`;$('footerDate').textContent=`${shortDate()} · ${data.city}`;$('venueName').textContent=data.venueName;$('venueAddress').textContent=data.venueAddress;$('directionsLink').href=/^https?:\/\//i.test(data.mapsLink)?data.mapsLink:'https://maps.google.com/';let deadline=new Date(data.rsvpDeadline+'T12:00:00');$('rsvpDeadlineDisplay').textContent=isNaN(deadline)?'':`Please RSVP by ${deadline.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;renderTimeline();renderPhotos();if($('momentsLink'))$('momentsLink').hidden=data.photoLinkVisible!==true;updateCountdown();document.title=`${data.firstName} & ${data.secondName} | Wedding Invitation`; document.querySelector('.hero-monogram').textContent=(data.firstName[0]||'B')+' & '+(data.secondName[0]||'E');renderMoodPhotos()}
function renderTimeline(){$('timelineList').innerHTML=(data.timeline||[]).map(t=>`<div class="timeline-item"><div class="timeline-time">${escapeHtml(t.time)}</div><div class="timeline-dot"></div><div class="timeline-event"><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.description)}</p></div></div>`).join('')}function renderFaqs(){$('faqList').innerHTML=(data.faqs||[]).map((f,i)=>`<div class="faq ${i===0?'open':''}"><button type="button" aria-expanded="${i===0?'true':'false'}">${escapeHtml(f.question)} <span>+</span></button><div class="faq-answer"><p>${escapeHtml(f.answer)}</p></div></div>`).join('');document.querySelectorAll('.faq button').forEach(b=>b.addEventListener('click',()=>{let p=b.parentElement;p.classList.toggle('open');b.setAttribute('aria-expanded',p.classList.contains('open'))}))}function renderPhotos(){['heroPhoto','storyPhoto','venuePhoto'].forEach(id=>{let el=$(id),url=data[id];if(!el)return;if(id==='heroPhoto'){el.style.backgroundImage=url?`linear-gradient(90deg,#09142de8,#0c1b3b99 50%,#101a38b5),url("${url.replace(/"/g,'%22')}")`:''}else{el.querySelector('img')?.remove();if(url){const img=document.createElement('img');img.src=url;img.alt=id+' image';el.prepend(img)}}})}function updateCountdown(){let diff=new Date(data.weddingDate).getTime()-Date.now();diff=Math.max(0,isFinite(diff)?diff:0);let d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;$('days').textContent=String(d).padStart(3,'0');$('hours').textContent=String(h).padStart(2,'0');$('minutes').textContent=String(m).padStart(2,'0');$('seconds').textContent=String(s).padStart(2,'0')}setInterval(updateCountdown,1000);
$('mobileToggle').onclick=()=>$('nav').classList.toggle('open');document.querySelectorAll('#nav a').forEach(x=>x.onclick=()=>$('nav').classList.remove('open'));$('openRSVP').onclick=()=>{const opened=$('rsvpForm').classList.toggle('show');$('openRSVP').setAttribute('aria-expanded',opened?'true':'false');if(opened){$('rsvpForm').scrollIntoView({behavior:'smooth',block:'nearest'});setTimeout(()=>$('guestSearchInput')?.focus(),240)}};function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),4000)}function openEditor(){$('editor').classList.add('open');$('backdrop').classList.add('on')}function closeEditor(){$('editor').classList.remove('open');$('backdrop').classList.remove('on')}$('editButton').onclick=openEditor;$('closeEditor').onclick=closeEditor;$('backdrop').onclick=closeEditor;
const groups=[["Names, date & venue",[["firstName","First name"],["secondName","Second name"],["weddingDate","Wedding date and time","datetime-local"],["city","City"],["venueName","Venue name"],["venueAddress","Venue description and address","textarea"],["mapsLink","Directions link"],["rsvpDeadline","RSVP deadline","date"]]],["Opening invitation",[["heroEyebrow","Cover invitation line"],["heroButton","Cover RSVP button"],["heroVertical","Cover side text"],["heroScroll","Scroll prompt"],["storyEyebrow","Story introduction"],["storyTitle","Story heading"],["storyParagraph1","Story paragraph one","textarea"],["storyParagraph2","Story paragraph two","textarea"]]],["Countdown and order of celebration",[["countdownEyebrow","Countdown introduction"],["countdownTitle","Countdown heading"],["timelineEyebrow","Programme introduction"],["timelineTitle","Programme heading"],["timelineIntro","Programme description","textarea"]]],["Venue and thoughtful details",[["venueEyebrow","Venue introduction"],["venueTitle","Venue heading"],["venueDescription","Venue paragraph","textarea"],["detailsEyebrow","Details introduction"],["detailsTitle","Details heading"],["dressTitle","Dress code heading"],["dressText","Dress code wording","textarea"],["unpluggedTitle","Photography note heading"],["unpluggedText","Photography poem","textarea"],["photoLinkNote","Future photo space note"],["giftsTitle","Gifts heading"],["giftsText","Gifts wording","textarea"]]],["RSVP and closing words",[["rsvpEyebrow","RSVP introduction"],["rsvpTitle","RSVP heading"],["rsvpText","RSVP wording","textarea"],["rsvpActionButton","Open RSVP button"],["rsvpFormEyebrow","Form introduction"],["rsvpFormTitle","Form heading"],["rsvpFormIntro","Form paragraph","textarea"],["rsvpSubmitButton","Submit button"],["rsvpNoteText","Privacy note","textarea"],["footerMessage","Footer text"],["footerFine","Footer signature"]]],["Guest photo page",[["photoPageEyebrow","Photo page eyebrow"],["photoPageTitle","Photo page heading"],["photoPageIntro","Photo page introduction","textarea"],["photoPageComing","Coming soon announcement","textarea"],["photoPageDate","Opening date caption"],["photoPageNote","Photo upload instructions","textarea"],["photoPageLinkLabel","Photo page link text"]]],["Navigation",[["navStory","Our story"],["navProgramme","The day"],["navVenue","The venue"],["navDetails","Details"],["navRSVP","RSVP"],["directionsButton","Directions button"]]]];groups.splice(5,0,["Guest list name search",[["rsvpNameSearchLabel","Search heading"],["rsvpNameSearchPlaceholder","Search placeholder"],["rsvpNameSearchHelp","Search instructions","textarea"],["rsvpGuestListEmpty","Message before guest list is loaded","textarea"],["rsvpNoMatch","Message when name is not found","textarea"],["rsvpChooseAnother","Choose another name button"],["rsvpSelectedCaption","Found invitation label"],["rsvpGuestsAllowed","Guest allowance label"]]]);
groups.splice(6,0,["Household invitation wording",[["rsvpHouseholdInstructions","Instructions above the household"],["rsvpHouseholdDietaryLabel","Dietary requirements heading"],["rsvpHouseholdNoteLabel","Household message heading"],["rsvpHouseholdProgress","Response progress label"],["rsvpHouseholdAccept","Acceptance choice"],["rsvpHouseholdDecline","Decline choice"],["rsvpHouseholdSuccess","Successful submission message","textarea"],["rsvpHouseholdLegacy","Guest list incomplete message","textarea"],["rsvpHouseholdNoMatch","Household lookup error message","textarea"]]]);
function addInput(holder,key,label,type='text',value=data[key]){let wrapper=document.createElement('div');let lab=document.createElement('label');lab.textContent=label;let inp=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')inp.type=type;inp.value=value??'';inp.oninput=()=>{data[key]=inp.value;save();apply()};wrapper.append(lab,inp);holder.append(wrapper)}function buildEditor(){let root=$('editorFields');root.innerHTML='';for(let [name,fields] of groups){let h=document.createElement('h3');h.textContent=name;root.append(h);for(let [k,label,type] of fields)addInput(root,k,label,type)}let title=document.createElement('h3');title.textContent='Programme items';root.append(title);(data.timeline||[]).forEach((t,i)=>{let group=document.createElement('div');group.style.cssText='border:1px solid #dacfc4;padding:12px;margin:12px 0';[['time','Time'],['title','Event name'],['description','Description']].forEach(([key,label])=>{let wrapper=document.createElement('div'),lab=document.createElement('label'),inp=document.createElement('input');lab.textContent=label;inp.value=t[key];inp.oninput=()=>{data.timeline[i][key]=inp.value;save();renderTimeline()};wrapper.append(lab,inp);group.append(wrapper)});let del=document.createElement('button');del.className='btn btn-outline';del.style.cssText='color:#44252a;margin-top:10px';del.textContent='Remove event';del.onclick=()=>{data.timeline.splice(i,1);save();buildEditor();renderTimeline()};group.append(del);root.append(group)});let add=document.createElement('button');add.className='btn btn-outline';add.style.color='#44252a';add.textContent='+ Add programme item';add.onclick=()=>{data.timeline.push({time:'00:00',title:'New event',description:'Event details'});save();buildEditor();renderTimeline()};root.append(add);let ph=document.createElement('h3');ph.textContent='Photography';root.append(ph);let help=document.createElement('p');help.className='admin-help';help.textContent='Choose a photograph to replace an image. Photos are automatically optimised, and the downloaded HTML includes your selected images.';root.append(help);for(let [key,label] of [['heroPhoto','Cover photo'],['storyPhoto','Couple portrait'],['venuePhoto','Venue photograph']]){let wrapper=document.createElement('div'),lab=document.createElement('label'),inp=document.createElement('input'),remove=document.createElement('button');lab.textContent=label;inp.type='file';inp.accept='image/*';inp.onchange=async()=>{const file=inp.files[0];if(!file)return;try{if(!file.type.startsWith('image/'))throw new Error('Not an image');const bitmap=await createImageBitmap(file);const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bitmap.width*scale));cv.height=Math.max(1,Math.round(bitmap.height*scale));cv.getContext('2d').drawImage(bitmap,0,0,cv.width,cv.height);bitmap.close?.();data[key]=cv.toDataURL('image/webp',.78);save();renderPhotos();toast(label+' updated')}catch(e){toast('Unable to process this image. Please use JPEG, PNG or WebP.')}};remove.textContent='Clear photo';remove.style.cssText='border:0;background:none;color:#673940;text-decoration:underline;font-size:11px;padding:6px 0';remove.onclick=()=>{data[key]='';save();renderPhotos();inp.value=''};wrapper.append(lab,inp,remove);root.append(wrapper)}}
function exportWebsite(){const clone=document.documentElement.cloneNode(true);clone.querySelector('#siteDefaults').textContent=JSON.stringify(data).replace(/</g,'\\u003c');clone.querySelector('#editorFields').innerHTML='';clone.querySelector('#rsvpForm').classList.remove('show');clone.querySelector('#wixRsvpFields').innerHTML='';clone.querySelector('#guestSearchInput').value='';clone.querySelector('#guestSearchResults').innerHTML='';clone.querySelector('#guestSearchResults').hidden=true;clone.querySelector('#guestChosen').hidden=true;clone.querySelector('#wixRsvpSubmission').hidden=true;clone.querySelector('#wixRsvpError').textContent='';clone.querySelector('#wixRsvpError').hidden=true;clone.querySelector('#wixRsvpSuccess').textContent='';clone.querySelector('#wixRsvpSuccess').hidden=true;clone.querySelector('#rsvpFormStatus').textContent='Opening your invitation response...';clone.querySelector('#editor').classList.remove('open');clone.querySelector('#backdrop').classList.remove('on');clone.querySelector('#toast').classList.remove('show');clone.querySelector('#nav').classList.remove('open');clone.querySelectorAll('.image-placeholder img').forEach(x=>x.remove());let blob=new Blob(['<!DOCTYPE html>\n'+clone.outerHTML],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wedding-invitation.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Your editable website has been downloaded')}$('downloadWebsite').onclick=exportWebsite;$('resetWebsite').onclick=()=>{if(confirm('Reset every change to the original placeholders and sample text?')){data=structuredClone(DEFAULTS);save();apply();buildEditor();toast('Site reset to defaults')}};apply();buildEditor();

function renderMoodPhotos(){
  ['moodPhotoTable','moodPhotoCake','moodPhotoSetting','moodPhotoDrapery','moodPhotoCeremony'].forEach(id=>{
    const img=$(id);if(!img)return;
    if(data[id]){img.src=data[id];img.hidden=false}else{img.removeAttribute('src');img.hidden=true}
  });
}
renderMoodPhotos();

// Owners open the live editor via ?edit=1. Guests do not see editing controls.
function applyEditorVisibility(){const enabled=new URLSearchParams(window.location.search).get('edit')==='1'||window.location.hash==='#edit';$('editButton').hidden=!enabled}
applyEditorVisibility();window.addEventListener('hashchange',applyEditorVisibility);


// Invitation studio: text size and appearance control, scoped to each editable element.
const EDITABLE_STYLE_TARGETS = [
 ['heroNames','Cover names'],['heroDate','Wedding date'],['brand','Initials in navigation'],
 ['signature','Story signature'],['venueName','Venue name'],['venueAddress','Venue address'],
 ['footerNames','Footer names'],['footerDate','Footer date'],['days','Countdown figures'],['venueAddress','Venue description'],['rsvpDeadlineDisplay','RSVP deadline']
];
function editableElementList(){
  const entries=[];
  const seen=new Set();
  for(const [id,label] of EDITABLE_STYLE_TARGETS){if($(id)){entries.push({key:'id:'+id,label});seen.add('id:'+id)}}
  document.querySelectorAll('[data-edit]').forEach(el=>{
    const key='edit:'+el.dataset.edit;
    if(!seen.has(key)){entries.push({key,label:(el.textContent||el.dataset.edit).trim().replace(/\s+/g,' ').slice(0,53)});seen.add(key)}
  });
  return entries;
}
function typographyNode(key){if(!key)return null;
  if(key.startsWith('id:'))return $(key.substring(3));
  if(key.startsWith('edit:'))return document.querySelector('[data-edit="'+key.substring(5)+'"]');
  return null;
}
function applyDesign(){
 const theme=data.designTheme||{};
 const root=document.documentElement;
 for(const [variable,key] of [['--wine','navy'],['--gold','gold'],['--cream','cream']]){
   if(/^#[0-9a-f]{6}$/i.test(theme[key]||''))root.style.setProperty(variable,theme[key]);
 }
 const density=Number(data.contentSpacing||100);
 root.style.setProperty('--editable-space',String(Math.min(160,Math.max(55,density))/100));
 const small=window.matchMedia('(max-width: 600px)').matches;
 for(const entry of editableElementList()){
  const el=typographyNode(entry.key),v=(data.styleOverrides||{})[entry.key]||{};
  if(!el)continue;
  const px=Number(small?(v.mobileSize||v.fontSize):v.fontSize);
  el.style.fontSize=px>0&&px<=250?px+'px':'';
  el.style.fontFamily=v.fontFamily||'';
  el.style.fontWeight=v.weight||'';
  el.style.textAlign=v.align||'';
  el.style.lineHeight=v.lineHeight||'';
  el.style.letterSpacing=v.letterSpacing!==undefined && v.letterSpacing!==''?Number(v.letterSpacing)+'px':'';
  el.style.color=/^#[0-9a-f]{6}$/i.test(v.color||'')?v.color:'';
 }
}
window.addEventListener('resize',applyDesign);
const applyInvitation=apply;
apply=function(){applyInvitation();applyDesign();applyBackgroundPhotos();};
const buildInvitationEditor=buildEditor;
buildEditor=function(){buildInvitationEditor();injectTypographyEditor();injectOwnerTools();};
function injectTypographyEditor(){
 const wrap=document.createElement('section');wrap.className='editor-design-studio';
 const title=document.createElement('h3');title.textContent='Typography & layout';wrap.append(title);
 const helper=document.createElement('p');helper.className='admin-help';helper.textContent='Select a line of the invitation. Change its size, spacing, colour or typography. Desktop and mobile sizes can be adjusted separately.';wrap.append(helper);
 const select=document.createElement('select');select.setAttribute('aria-label','Choose invitation text');
 const top=document.createElement('option');top.value='';top.textContent='Choose text to style';select.append(top);
 for(const entry of editableElementList()){
   const option=document.createElement('option');option.value=entry.key;option.textContent=entry.label;select.append(option);
 }
 const target=document.createElement('div');target.className='studio-preview-select';target.appendChild(select);wrap.append(target);
 const controls=document.createElement('div');controls.className='studio-controls';wrap.append(controls);
 function makeControl(label,type,prop,{min,max,step,options}={}){
   const box=document.createElement('div');box.className='studio-field';
   const l=document.createElement('label');l.textContent=label;box.append(l);
   let input;
   if(type==='select'){
     input=document.createElement('select');
     for(const [value,caption] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=caption;input.append(opt)}
   }else{
     input=document.createElement('input');input.type=type;
     if(min!==undefined)input.min=String(min);if(max!==undefined)input.max=String(max);if(step!==undefined)input.step=String(step);
   }
   input.dataset.prop=prop;
   input.addEventListener('input',()=>{
     const key=select.value;if(!key)return;
     const styles=data.styleOverrides||(data.styleOverrides={});
     const value=input.value;
     (styles[key]||(styles[key]={}))[prop]=value;
     save();applyDesign();
   });
   box.append(input);controls.append(box);
   return input;
 }
 const fontDesktop=makeControl('Size, desktop (px)','number','fontSize',{min:8,max:250,step:1});
 const fontMobile=makeControl('Size, mobile (px)','number','mobileSize',{min:8,max:180,step:1});
 const family=makeControl('Typeface','select','fontFamily',{options:[['','Original typeface'],['Cormorant Garamond, Georgia, serif','Editorial serif'],['Italiana, Georgia, serif','Classic elegant'],['DM Sans, Arial, sans-serif','Modern sans serif']]});
 const weight=makeControl('Weight','select','weight',{options:[['','Original'],['300','Light'],['400','Regular'],['500','Medium'],['600','Semibold'],['700','Bold']]});
 const alignment=makeControl('Alignment','select','align',{options:[['','Original'],['left','Left'],['center','Centre'],['right','Right']]});
 const line=makeControl('Line height','number','lineHeight',{min:0.75,max:2.8,step:0.05});
 const spacing=makeControl('Letter spacing (px)','number','letterSpacing',{min:-7,max:16,step:0.2});
 const colour=makeControl('Text colour','color','color');
 function sync(){
  const active=Boolean(select.value);controls.hidden=!active;
  if(!active)return;
  const v=(data.styleOverrides||{})[select.value]||{};
  for(const control of controls.querySelectorAll('[data-prop]')){
   const prop=control.dataset.prop;
   if(control.type==='color')control.value=/^#[0-9a-f]{6}$/i.test(v[prop]||'')?v[prop]:'#c5a16a';
   else control.value=v[prop]||'';
  }
 }
 select.addEventListener('change',sync);sync();
 const reset=document.createElement('button');reset.type='button';reset.className='studio-reset-text';reset.textContent='Reset selected text styling';reset.onclick=()=>{const key=select.value;if(!key)return;delete data.styleOverrides[key];save();applyDesign();sync();};
 wrap.append(reset);
 
 // Photo sharing controls now live at the top of Invitation studio, under Guest photos.
 const paletteTitle=document.createElement('h3');paletteTitle.textContent='Site appearance';wrap.append(paletteTitle);
 const palette=document.createElement('div');palette.className='studio-controls studio-palettes';wrap.append(palette);
 for(const [key,label] of [['navy','Midnight navy'],['gold','Antique gold'],['cream','Ivory background']]){
  const row=document.createElement('div');row.className='studio-field';
  const l=document.createElement('label');l.textContent=label;
  const pick=document.createElement('input');pick.type='color';pick.value=data.designTheme?.[key]||'#c5a16a';
  pick.oninput=()=>{(data.designTheme||(data.designTheme={}))[key]=pick.value;save();applyDesign();};
  row.append(l,pick);palette.append(row);
 }
 const densityWrap=document.createElement('div');densityWrap.className='studio-field full';
 const densityLabel=document.createElement('label');densityLabel.textContent='Section spacing';
 const densityInput=document.createElement('input');densityInput.type='range';densityInput.min='55';densityInput.max='160';densityInput.step='5';densityInput.value=Number(data.contentSpacing||100);
 const densityOut=document.createElement('output');densityOut.textContent=densityInput.value+'%';
 densityInput.oninput=()=>{data.contentSpacing=Number(densityInput.value);densityOut.textContent=densityInput.value+'%';save();applyDesign();};
 densityWrap.append(densityLabel,densityInput,densityOut);palette.append(densityWrap);
 // Styling controls at the top, above the copy fields; copy remains editable below.
 const root=$('editorFields');root.insertBefore(wrap,root.firstChild);
}
// Wedding owner tools: site appearance, guest directory instructions and future photo sharing.
// All controls edit the in-browser draft; publishing still requires exporting and redeploying the HTML.
const BG_TARGETS=[
  ['countdown','Countdown',()=>document.querySelector('.countdown-section'),'dark',.81],
  ['programme','Wedding programme',()=>document.getElementById('programme'),'light',.89],
  ['details','Guest information',()=>document.getElementById('details'),'light',.87],
  ['rsvp','RSVP section',()=>document.getElementById('rsvp'),'dark',.87],
  ['footer','Footer',()=>document.querySelector('footer.footer'),'dark',.85],
  ['moments','Future guest photo page',()=>null,'dark',.76]
];
function bgRecord(key){
 const all=data.backgroundPhotos||(data.backgroundPhotos={});
 if(!all[key])all[key]={image:'',overlay:key==='programme'||key==='details'?.87:.84,position:'center'};
 return all[key];
}
function applyBackgroundPhotos(){
 for(const [key,label,getEl,tint,defaultOverlay] of BG_TARGETS){
   const el=getEl();if(!el)continue;
   const b=data.backgroundPhotos?.[key];
   if(!b?.image){
     el.classList.remove('has-guest-background');
     el.style.backgroundImage='';el.style.backgroundSize='';el.style.backgroundPosition='';continue;
   }
   const overlay=Number.isFinite(Number(b.overlay))?Math.max(0,Math.min(1,Number(b.overlay))):defaultOverlay;
   const rgb=tint==='light'?'250,248,241':'8,21,44';
   el.style.backgroundImage=`linear-gradient(rgba(${rgb},${overlay}),rgba(${rgb},${overlay})),url("${b.image.replace(/"/g,'%22')}")`;
   el.style.backgroundSize='cover';el.style.backgroundPosition=b.position||'center';
   el.classList.add('has-guest-background');
 }
}
async function optimizedBackground(file){
 if(!file || !file.type.startsWith('image/'))throw new Error('Select a JPEG, PNG, WebP or HEIC image.');
 const bitmap=await createImageBitmap(file);
 const scale=Math.min(1,1740/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);
 bitmap.close?.();
 let encoded='';for(let q=.78;q>=.37;q-=.09){
   encoded=canvas.toDataURL('image/webp',q);
   if(encoded.length<870000)break;
 }
 return encoded;
}
function downloadGuestTemplate(){
 const csv='displayName,householdId,householdName,guestType,partySize\n';
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wedding-guest-list-template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}
function injectOwnerTools(){
 const panel=document.createElement('section');panel.className='editor-tools';
 panel.innerHTML='<h3>Guest list & photographs</h3>';
 const help=document.createElement('p');help.className='owner-note';help.textContent='Your invitation now only accepts replies from guests whose names are in the Wix guest directory. Guest names are not embedded in the public website.';panel.append(help);
 const directory=document.createElement('div');directory.className='owner-panel';
 const title=document.createElement('h4');title.className='bg-name';title.textContent='Invited guest list';directory.append(title);
 const count=document.createElement('p');count.className='owner-note';count.textContent='No invited names loaded yet. Upload your completed list for import to Wix before invitations go out.';directory.append(count);
 const template=document.createElement('button');template.type='button';template.textContent='Download guest list template (.csv)';template.onclick=downloadGuestTemplate;directory.append(template);
 const dirHelp=document.createElement('p');dirHelp.className='owner-note upload-note';dirHelp.textContent='Enter every invited person as a separate row. Family members must share a householdId. Map all five CSV columns when importing into the existing Wix guest collection. This page cannot import directly into the owner-only guest directory. Name search is not identity verification.';directory.append(dirHelp);
 panel.append(directory);
 window.addEventListener('wedding-guest-count',event=>{
   const n=Number(event.detail?.count);
   count.textContent=Number.isFinite(n)?(n===0?'Guest directory is empty. Import your invited names before sending invitations.':n+' invited names currently published in Wix.'):'Guest list count unavailable.';
 });
 if(Number.isFinite(window.weddingGuestCount))count.textContent=window.weddingGuestCount+' invited names currently published in Wix.';
 const photo=document.createElement('div');photo.className='owner-panel';
 const photoTitle=document.createElement('h4');photoTitle.className='bg-name';photoTitle.textContent='Guest photographs';photo.append(photoTitle);
 const photoNote=document.createElement('p');photoNote.className='owner-note';photoNote.textContent='The guest photo page is built. It stays closed until you enable uploads. Photo uploading requires an active Wix file upload form and a suitable paid Wix plan.';photo.append(photoNote);
 const idLabel=document.createElement('label');idLabel.className='tiny-label';idLabel.textContent='Wix photo upload form ID (configure after upgrading)';photo.append(idLabel);
 const id=document.createElement('input');id.type='text';id.value=data.photoFormId||'';id.placeholder='Add the photo form ID here';id.autocomplete='off';photo.append(id);
 id.addEventListener('input',()=>{data.photoFormId=id.value.trim();save();});
 const openLabel=document.createElement('label');openLabel.className='control-row';
 const open=document.createElement('input');open.type='checkbox';open.checked=data.photoUploadsEnabled===true;
 const opening=document.createElement('span');opening.textContent='Open / close guest photograph uploads';openLabel.append(open,opening);photo.append(openLabel);
 const linkLabel=document.createElement('label');linkLabel.className='control-row';
 const link=document.createElement('input');link.type='checkbox';link.checked=data.photoLinkVisible===true;
 const linkSpan=document.createElement('span');linkSpan.textContent='Show photograph page link on the invitation';linkLabel.append(link,linkSpan);photo.append(linkLabel);
 open.addEventListener('change',()=>{
   if(open.checked && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.photoFormId||'')){
     open.checked=false;toast('First configure an active Wix photo upload form.');return;
   }
   data.photoUploadsEnabled=open.checked;save();
   toast(open.checked?'Draft: guest uploads enabled. Download and publish to go live.':'Draft: guest uploads closed. Download and publish to apply.');
 });
 link.addEventListener('change',()=>{data.photoLinkVisible=link.checked;save();apply();});
 const preview=document.createElement('a');preview.href='/moments.html';preview.target='_blank';preview.rel='noopener';preview.textContent='Preview photo page ↗';preview.style.cssText='display:inline-block;text-decoration:underline;color:#775435;font-size:12px;margin:10px 0';photo.append(preview);
 const caution=document.createElement('p');caution.className='owner-note upload-note';caution.textContent='The open / closed switch is an invitation draft setting. For guests to see the change, use Download website and republish the edited HTML. Do not open the page until the upload form has been tested.';photo.append(caution);
 panel.append(photo);
 const backgrounds=document.createElement('div');backgrounds.className='owner-panel';
 const btitle=document.createElement('h4');btitle.className='bg-name';btitle.textContent='Add background photographs';backgrounds.append(btitle);
 const instructions=document.createElement('p');instructions.className='owner-note';instructions.textContent='Upload a background for any section and adjust its contrast and crop. Photos are optimised and included when you export the invitation. These are additional to the main couple and venue photographs.';backgrounds.append(instructions);
 for(const [key,name,getEl,tint,defaultOpacity] of BG_TARGETS){
  const line=document.createElement('div');line.className='bg-edit-row';
  const n=document.createElement('div');n.className='bg-name';n.textContent=name;line.append(n);
  const record=bgRecord(key);
  const thumbnail=document.createElement('div');thumbnail.className='section-photo-preview';thumbnail.style.backgroundImage=record.image?`url("${record.image}")`:'';thumbnail.title=record.image?'Background loaded':'No background selected';line.append(thumbnail);
  const select=document.createElement('input');select.type='file';select.accept='image/*';select.setAttribute('aria-label','Upload '+name+' background');line.append(select);
  select.addEventListener('change',async()=>{
    if(!select.files[0])return;
    try{const result=await optimizedBackground(select.files[0]);bgRecord(key).image=result;save();applyBackgroundPhotos();thumbnail.style.backgroundImage=`url("${result}")`;toast(name+' background updated');}
    catch(e){toast('Could not use that photograph. Try a JPEG, PNG or WebP file.');}
  });
  const opacityLabel=document.createElement('label');opacityLabel.className='tiny-label';opacityLabel.textContent='Text contrast / overlay opacity';line.append(opacityLabel);
  const controls=document.createElement('div');controls.className='control-row';
  const overlay=document.createElement('input');overlay.type='range';overlay.min='.15';overlay.max='.98';overlay.step='.01';overlay.value=String(Number.isFinite(Number(record.overlay))?record.overlay:defaultOpacity);overlay.style.flex='1';
  const figure=document.createElement('output');figure.textContent=Math.round(Number(overlay.value)*100)+'%';
  overlay.addEventListener('input',()=>{bgRecord(key).overlay=Number(overlay.value);figure.textContent=Math.round(Number(overlay.value)*100)+'%';save();applyBackgroundPhotos();});
  controls.append(overlay,figure);line.append(controls);
  const crop=document.createElement('select');crop.setAttribute('aria-label',name+' image alignment');
  for(const [val,title] of [['center','Centre'],['center top','Top'],['center bottom','Bottom'],['left center','Left'],['right center','Right']]){
    const op=document.createElement('option');op.value=val;op.textContent=title;crop.append(op);
  }
  crop.value=record.position||'center';crop.addEventListener('change',()=>{bgRecord(key).position=crop.value;save();applyBackgroundPhotos()});line.append(crop);
  const clear=document.createElement('button');clear.type='button';clear.textContent='Remove background';clear.onclick=()=>{bgRecord(key).image='';thumbnail.style.backgroundImage='';select.value='';save();applyBackgroundPhotos()};line.append(clear);
  backgrounds.append(line);
 }
 panel.append(backgrounds);
 document.getElementById('editorFields').insertBefore(panel,document.getElementById('editorFields').firstChild);
}

applyDesign();applyBackgroundPhotos();buildEditor();

window.getInvitationEditorState=()=>data;
window.persistWeddingDraft=save;
