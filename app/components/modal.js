export function showModal(title, innerHtml) {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-backdrop';
  wrapper.innerHTML = `<div class="modal"><header class="toolbar"><h3>${title}</h3><button id="close-modal" class="secondary">×</button></header>${innerHtml}</div>`;
  document.body.appendChild(wrapper);
  wrapper.querySelector('#close-modal').addEventListener('click', () => wrapper.remove());
  return wrapper;
}


