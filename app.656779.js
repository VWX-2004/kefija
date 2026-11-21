'use strict';

const orderDialog = document.querySelector('#order-dialog');
const labelDialog = document.querySelector('#label-dialog');
const documentDialog = document.querySelector('#document-dialog');
const quantityInput = document.querySelector('#quantity');
const minusButton = document.querySelector('#quantity-minus');
const plusButton = document.querySelector('#quantity-plus');
const feedback = document.querySelector('#copy-feedback');
const fallback = document.querySelector('#copy-fallback');
const messageField = document.querySelector('#order-message');
const copyButton = document.querySelector('#copy-order');
const orderContact = document.querySelector('#order-contact');
const orderEmail = document.querySelector('#order-email');
const orderRecipient = document.querySelector('#order-recipient');
const orderPreview = document.querySelector('#order-preview');
const orderTotal = document.querySelector('#order-total');
const copyEmailButton = document.querySelector('#copy-email');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function syncScrollLock() {
  document.body.classList.toggle('modal-open', orderDialog.open || labelDialog.open || documentDialog.open);
}
function showDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  syncScrollLock();
}
function normalizeQuantity(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(99, Math.round(parsed))) : 1;
}
function getMessage() {
  const count = normalizeQuantity(quantityInput.value);
  return `Hola, equipo Kéfija:\n\nMe gustaría consultar la disponibilidad de ${count} ${count === 1 ? 'botella' : 'botellas'} de kéfir de mango y miel de abeja (330 ml, L 69.99). ¿Podrían indicarme las opciones de entrega?\n\nMuchas gracias.`;
}
function updateInquiry() {
  const count = normalizeQuantity(quantityInput.value);
  const message = getMessage();
  const subject = `Consulta de disponibilidad · Kéfija · ${count} ${count === 1 ? 'botella' : 'botellas'}`;
  orderEmail.href = `mailto:${orderContact.value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  orderRecipient.textContent = orderContact.value;
  orderPreview.textContent = message;
  orderTotal.innerHTML = `Total estimado: <strong>L ${(count * 69.99).toFixed(2)}</strong>`;
  messageField.value = message;
}
function updateQuantity(value) {
  const count = normalizeQuantity(value);
  quantityInput.value = String(count);
  minusButton.disabled = count <= 1;
  plusButton.disabled = count >= 99;
  feedback.textContent = '';
  updateInquiry();
}

document.querySelectorAll('[data-open-order]').forEach(button => {
  button.addEventListener('click', () => {
    feedback.textContent = '';
    fallback.hidden = true;
    updateQuantity(quantityInput.value);
    showDialog(orderDialog);
  });
});
document.querySelectorAll('[data-open-label]').forEach(button => {
  button.addEventListener('click', () => showDialog(labelDialog));
});
document.querySelector('[data-close-order]').addEventListener('click', () => orderDialog.close());
document.querySelector('[data-close-label]').addEventListener('click', () => labelDialog.close());
[orderDialog, labelDialog, documentDialog].forEach(dialog => {
  dialog.addEventListener('close', syncScrollLock);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (isOutside) dialog.close();
  });
});
minusButton.addEventListener('click', () => updateQuantity(Number(quantityInput.value) - 1));
plusButton.addEventListener('click', () => updateQuantity(Number(quantityInput.value) + 1));
quantityInput.addEventListener('change', () => updateQuantity(quantityInput.value));
quantityInput.addEventListener('blur', () => updateQuantity(quantityInput.value));
quantityInput.addEventListener('input', () => {
  if (quantityInput.value !== '' && (Number(quantityInput.value) > 99 || Number(quantityInput.value) < 1)) {
    updateQuantity(quantityInput.value);
    return;
  }
  feedback.textContent = '';
  minusButton.disabled = Number(quantityInput.value) <= 1;
  plusButton.disabled = Number(quantityInput.value) >= 99;
  updateInquiry();
});
orderContact.addEventListener('change', updateInquiry);
orderEmail.addEventListener('click', () => updateQuantity(quantityInput.value));
updateInquiry();
copyEmailButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(orderContact.value);
    feedback.textContent = `Correo copiado: ${orderContact.value}`;
    copyEmailButton.textContent = '¡Copiado!';
    setTimeout(() => { copyEmailButton.textContent = 'Copiar correo'; }, 2000);
  } catch {
    feedback.textContent = `Correo del contacto: ${orderContact.value}`;
  }
});
copyButton.addEventListener('click', async () => {
  updateQuantity(quantityInput.value);
  const message = getMessage();
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(message);
    fallback.hidden = true;
    feedback.textContent = `Mensaje copiado. Envíalo a ${orderContact.value}.`;
    copyButton.textContent = '¡Mensaje copiado!';
    setTimeout(() => { copyButton.textContent = 'Copiar mensaje'; }, 2200);
  } catch {
    fallback.hidden = false;
    messageField.value = message;
    messageField.focus();
    messageField.select();
    feedback.textContent = 'El mensaje está disponible en el recuadro para copiarlo.';
  } finally {
    copyButton.disabled = false;
  }
});

function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = expanded;
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
const bottleDetails = document.querySelector('#materiales');
document.querySelectorAll('a[href="#materiales"]').forEach(link => {
  link.addEventListener('click', () => { bottleDetails.open = true; });
});
function revealLinkedBottle() {
  if (location.hash === '#materiales' || location.hash === '#botella') bottleDetails.open = true;
}
window.addEventListener('hashchange', revealLinkedBottle);
revealLinkedBottle();
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
window.matchMedia('(min-width: 681px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.querySelector('#year').textContent = String(new Date().getFullYear());

const materials={
 frente:{title:'Etiqueta frontal',category:'Mango y miel · 330 ml',pages:['assets/kefija-etiqueta.webp'],fit:'page'},
 reverso:{title:'Etiqueta posterior',category:'Información de la bebida',pages:['assets/materiales/etiqueta-1.webp'],fit:'width',note:'Información nutricional estimada. El registro, el lote y el vencimiento del diseño son ilustrativos.'}
};
const documentImage = document.querySelector('#document-image');
const documentCanvas = document.querySelector('#document-canvas');
const previous = document.querySelector('#document-previous');
const next = document.querySelector('#document-next');
const zoomFit = document.querySelector('#document-zoom');
const zoomIn = document.querySelector('#zoom-in');
const zoomOut = document.querySelector('#zoom-out');
const zoomLevel = document.querySelector('#zoom-level');
const documentBack = document.querySelector('#document-back');
const documentDownload = document.querySelector('#document-download');
const tabs = document.querySelectorAll('[data-document-tab]');
const MIN_SCALE = 1, MAX_SCALE = 3, STEP = 0.25;
let activeDocument = 'frente', activePage = 1, labelScale = 1, cameFrom = null;

function fitDocumentImage() {
  if (!documentDialog.open || !documentImage.naturalWidth || !documentImage.naturalHeight) return;
  const style = getComputedStyle(documentCanvas);
  const availableWidth = Math.max(1, documentCanvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
  const availableHeight = Math.max(1, documentCanvas.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
  const byWidth = Math.min(availableWidth, 760, documentImage.naturalWidth);
  const byPage = Math.min(availableWidth / documentImage.naturalWidth, availableHeight / documentImage.naturalHeight, 1) * documentImage.naturalWidth;
  const base = materials[activeDocument].fit === 'width' ? byWidth : byPage;
  documentImage.style.width = `${Math.floor(base * labelScale)}px`;
  documentImage.style.height = 'auto';
}
function setLabelScale(scale, reset = true) {
  labelScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  documentCanvas.classList.toggle('zoomed', labelScale > 1);
  zoomLevel.textContent = `${Math.round(labelScale * 100)} %`;
  zoomOut.disabled = labelScale <= MIN_SCALE;
  zoomIn.disabled = labelScale >= MAX_SCALE;
  zoomFit.disabled = labelScale === 1;
  if (reset) documentCanvas.scrollTop = documentCanvas.scrollLeft = 0;
  fitDocumentImage();
}
function renderDocumentPage() {
  const material = materials[activeDocument];
  documentImage.src = material.pages[activePage - 1];
  documentImage.alt = `${material.title}, vista ${activePage} de ${material.pages.length}`;
  documentImage.hidden = false;
  document.querySelector('#document-error').hidden = true;
  const counter = document.querySelector('#document-counter');
  counter.textContent = `Vista ${activePage} de ${material.pages.length}`;
  counter.hidden = material.pages.length === 1;
  previous.disabled = activePage === 1;
  next.disabled = activePage === material.pages.length;
  previous.hidden = next.hidden = material.pages.length === 1;
  documentDownload.href = material.pages[activePage - 1];
  documentDownload.setAttribute('download', `kefija-${activeDocument === 'frente' ? 'etiqueta-frontal' : 'etiqueta-posterior'}.webp`);
  setLabelScale(1);
}
function chooseDocument(key, page = 1) {
  const material = materials[key];
  if (!material) return false;
  activeDocument = key;
  activePage = Math.min(material.pages.length, Math.max(1, Number(page) || 1));
  tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.documentTab === key)));
  document.querySelector('#document-title').textContent = material.title;
  document.querySelector('#document-category').textContent = material.category;
  const note = document.querySelector('#document-note');
  note.textContent = material.note || '';
  note.hidden = !material.note;
  renderDocumentPage();
  return true;
}
window.openKefijaMaterial = (key, page = 1) => {
  if (!chooseDocument(key, page)) return;
  cameFrom = orderDialog.open ? orderDialog : labelDialog.open ? labelDialog : null;
  documentBack.hidden = !cameFrom;
  showDialog(documentDialog);
  requestAnimationFrame(fitDocumentImage);
};
document.querySelectorAll('[data-open-document]').forEach(button => {
  button.addEventListener('click', () => window.openKefijaMaterial(button.dataset.openDocument, button.dataset.documentPage));
});
document.querySelector('#document-close').addEventListener('click', () => documentDialog.close());
documentBack.addEventListener('click', () => documentDialog.close());
tabs.forEach(tab => tab.addEventListener('click', () => chooseDocument(tab.dataset.documentTab)));
previous.addEventListener('click', () => {
  if (activePage > 1) { activePage--; renderDocumentPage(); }
});
next.addEventListener('click', () => {
  if (activePage < materials[activeDocument].pages.length) { activePage++; renderDocumentPage(); }
});
zoomIn.addEventListener('click', () => setLabelScale(labelScale + STEP, false));
zoomOut.addEventListener('click', () => setLabelScale(labelScale - STEP, false));
zoomFit.addEventListener('click', () => setLabelScale(1));
documentImage.addEventListener('dblclick', () => setLabelScale(labelScale > 1 ? 1 : 2));
documentCanvas.addEventListener('wheel', event => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  setLabelScale(labelScale + (event.deltaY < 0 ? STEP : -STEP), false);
}, { passive: false });
documentCanvas.addEventListener('keydown', event => {
  if (event.key === '+' || event.key === '=') setLabelScale(labelScale + STEP, false);
  else if (event.key === '-') setLabelScale(labelScale - STEP, false);
  else if (event.key === '0') setLabelScale(1);
});
documentImage.addEventListener('load', fitDocumentImage);
documentImage.addEventListener('error', () => {
  documentImage.hidden = true;
  document.querySelector('#document-error').hidden = false;
});
window.addEventListener('resize', fitDocumentImage);
const labelSizeObserver = new ResizeObserver(fitDocumentImage);
labelSizeObserver.observe(documentCanvas);
