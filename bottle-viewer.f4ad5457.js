(()=>{
'use strict';
const TAU=Math.PI*2,template=document.querySelector('#bottle-template');
document.querySelectorAll('[data-bottle-viewer]').forEach(host=>{
 host.append(template.content.cloneNode(true));
 const spin=host.querySelector('.bottle-spin'),object=host.querySelector('.bottle-object'),slider=host.querySelector('input'),front=host.querySelector('[data-bottle-front]'),back=host.querySelector('[data-bottle-back]'),read=host.querySelector('[data-bottle-read]'),status=host.querySelector('.bottle-status');
 const count=80,radius=100,step=TAU/count,arc=2.1,textureWidth=radius*arc;
 for(let i=0;i<count;i++){
  const t=i*step,strip=document.createElement('span');strip.className='bottle-strip';strip.style.width=(radius*step+.35)+'px';strip.style.transform=`translateX(-50%) rotateY(${t}rad) translateZ(${radius}px)`;
  let delta=((t+Math.PI)%TAU)-Math.PI,source='assets/kefija-etiqueta.webp';
  if(Math.abs(delta)>arc/2){delta=t-Math.PI;source='assets/materiales/etiqueta-1.webp';}
  if(Math.abs(delta)<=arc/2+step/2){const label=document.createElement('span');label.className='bottle-label-strip';label.style.backgroundImage=`url("${source}")`;label.style.backgroundSize=`${textureWidth}px 284px`;label.style.backgroundPosition=`${-(delta+arc/2)*radius+radius*step/2}px 0`;strip.append(label);}
  spin.append(strip);
 }
 let angle=0,drag=null;
 function update(value){angle=value;spin.style.transform=`rotateY(${angle}rad)`;const cos=Math.cos(angle),rear=cos<0;status.textContent=Math.abs(cos)<.22?'Vista lateral':rear?'Vista posterior':'Vista frontal';slider.value=String(Math.round(((angle%TAU)+TAU)%TAU/TAU*360));slider.setAttribute('aria-valuetext',`${slider.value} grados, ${status.textContent.toLowerCase()}`);front.setAttribute('aria-pressed',String(cos>.95));back.setAttribute('aria-pressed',String(cos<-.95));read.setAttribute('aria-label',rear?'Ampliar etiqueta posterior':'Ampliar etiqueta frontal');read.title=read.getAttribute('aria-label');}
 function turnTo(target){spin.style.transition=matchMedia('(prefers-reduced-motion: reduce)').matches?'none':'transform 350ms ease';const delta=((target-angle+Math.PI)%TAU+TAU)%TAU-Math.PI;update(angle+delta);}
 front.addEventListener('click',()=>turnTo(0));back.addEventListener('click',()=>turnTo(Math.PI));read.addEventListener('click',()=>window.openKefijaMaterial(Math.cos(angle)<0?'reverso':'frente'));
 slider.addEventListener('input',()=>{spin.style.transition='none';update(Number(slider.value)/360*TAU);});
 object.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;spin.style.transition='none';drag={id:e.pointerId,x:e.clientX,angle};object.setPointerCapture(e.pointerId);object.classList.add('dragging');});
 object.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)update(drag.angle+(e.clientX-drag.x)*.015);});
 for(const name of ['pointerup','pointercancel'])object.addEventListener(name,()=>{drag=null;object.classList.remove('dragging');});
 object.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();spin.style.transition='none';if(e.key==='Home')turnTo(0);else if(e.key==='End')turnTo(Math.PI);else update(angle+(e.key==='ArrowRight'?1:-1)*Math.PI/12);}});
 update(0);
});
})();
