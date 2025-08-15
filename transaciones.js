document.addEventListener('DOMContentLoaded', () => {
  const cajas = JSON.parse(localStorage.getItem('cajas')) || [];

  const contCajas = document.getElementById('cajas');
  const btnAgregar = document.getElementById('agregarCajaBtn');

  const sTot = document.getElementById('statCajasTotales');
  const sOcc = document.getElementById('statCajasOcupadas');
  const sLib = document.getElementById('statCajasLibres');
  const sCola = document.getElementById('statEnCola');

  function mostrarAnuncio(mensaje) {
    const el = document.getElementById('anuncio');
    if (!el) return;
    el.innerText = mensaje || '';
  }

  function saveCajas() {
    localStorage.setItem('cajas', JSON.stringify(cajas));
  }
  function getCola() {
    try { return JSON.parse(localStorage.getItem('cola')) || []; }
    catch { return []; }
  }

  function actualizarCajas() {
    contCajas.innerHTML = '';
    if (cajas.length === 0) {
      contCajas.innerHTML = '<p class="text-muted">No hay cajas creadas.</p>';
      actualizarStats();
      return;
    }

    cajas.forEach((cliente, index) => {
      const div = document.createElement('div');
      div.className = 'caja';
      div.id = 'caja' + (index + 1);

      if (cliente) {
        div.style.backgroundColor = cliente.color || '#f8f9fa';
        div.innerHTML = `<h5>Cliente ${cliente.id}</h5>`;
      } else {
        div.style.backgroundColor = '#f8f9fa';
        div.innerHTML = `<h5>Caja ${index + 1}</h5>`;
      }

      div.addEventListener('dblclick', () => retirarClienteCaja(index));

      contCajas.appendChild(div);
    });

    actualizarStats();
  }

  function actualizarStats() {
    const ocupadas = cajas.filter(Boolean).length;
    const totales = cajas.length;
    const libres = totales - ocupadas;
    const enCola = getCola().length;

    if (sTot) sTot.textContent = totales;
    if (sOcc) sOcc.textContent = ocupadas;
    if (sLib) sLib.textContent = libres;
    if (sCola) sCola.textContent = enCola;

    const keyMax = 'metrics:maxCajas';
    const prevMax = Number(localStorage.getItem(keyMax) || '0');
    if (ocupadas > prevMax) localStorage.setItem(keyMax, String(ocupadas));
  }

  function agregarCaja() {
    cajas.push(null);
    saveCajas();
    actualizarCajas();
    mostrarAnuncio(`Se agregó la caja ${cajas.length}`);
  }

  function retirarClienteCaja(cajaIndex) {
    if (cajas[cajaIndex]) {
      const atendidosKey = 'metrics:atendidosHoy';
      const prevAt = Number(localStorage.getItem(atendidosKey) || '0');
      localStorage.setItem(atendidosKey, String(prevAt + 1));

      cajas[cajaIndex] = null;
      saveCajas();
      actualizarCajas();
      mostrarAnuncio(`Caja ${cajaIndex + 1} desocupada`);

      let cola = getCola();
      if (cola.length > 0) {
        const siguienteCliente = cola.shift();
        cajas[cajaIndex] = siguienteCliente;
        localStorage.setItem('cola', JSON.stringify(cola));
        saveCajas();
        actualizarCajas();
        mostrarAnuncio(`Ticket número ${siguienteCliente.id} ahora en caja ${cajaIndex + 1}`);
      }
    }
  }

  if (btnAgregar) btnAgregar.addEventListener('click', agregarCaja);

  actualizarCajas();
});
