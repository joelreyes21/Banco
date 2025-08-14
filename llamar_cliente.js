document.addEventListener('DOMContentLoaded', () => {
    const cajas = JSON.parse(localStorage.getItem('cajas')) || []; // arranca sin cajas

    function mostrarAnuncio(mensaje) {
        const a = document.getElementById('anuncio');
        if (a) a.innerText = mensaje;
    }

    function reproducirVoz(texto) {
        const utterance = new SpeechSynthesisUtterance(texto);
        window.speechSynthesis.speak(utterance);
    }

    function actualizarCajas() {
        const cont = document.getElementById('cajas');
        cont.innerHTML = '';

        if (cajas.length === 0) {
            cont.innerHTML = '<p class="text-muted">No hay cajas. Agrega una para comenzar.</p>';
            return;
        }

        cajas.forEach((cliente, index) => {
            const div = document.createElement('div');
            div.className = 'caja';
            div.id = 'caja' + (index + 1);
            div.style.position = 'relative'; // para posicionar el botón "×"

            // --- Contenido de la caja (usar "=" y NO "+=") ---
            if (cliente) {
                div.style.backgroundColor = cliente.color || '#f8f9fa';
                div.innerHTML = `<h5>Cliente ${cliente.id}</h5>`;
            } else {
                div.style.backgroundColor = '#f8f9fa';
                div.innerHTML = `<h5>Caja ${index + 1} desocupada</h5>`;
            }

            // --- Botón eliminar caja (arriba-izquierda) ---
            const btn = document.createElement('button');
            btn.textContent = '×';
            btn.style.position = 'absolute';
            btn.style.top = '5px';
            btn.style.left = '5px';
            btn.style.background = '#ff4d4d';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.onclick = (e) => {
                e.stopPropagation();                 // no interferir con dblclick
                cajas.splice(index, 1);              // quitar esta caja
                localStorage.setItem('cajas', JSON.stringify(cajas));
                actualizarCajas();
                mostrarAnuncio(`Se eliminó la caja ${index + 1}`);
            };
            div.appendChild(btn);

            cont.appendChild(div);
        });

        // Re‑enganchar doble clic (porque recreamos nodos al renderizar)
        document.querySelectorAll('.caja').forEach(caja => {
            caja.addEventListener('dblclick', retirarClienteCaja);
        });
    }

    function agregarCaja() {
        cajas.push(null);                       // nueva caja libre
        localStorage.setItem('cajas', JSON.stringify(cajas));
        actualizarCajas();
        mostrarAnuncio(`Se agregó la caja ${cajas.length}.`);
    }

    const btnAgregar = document.getElementById('agregarCajaBtn');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarCaja);
    }

    function llamarCliente() {
        let cola = JSON.parse(localStorage.getItem('cola')) || [];
        if (cola.length === 0) {
            mostrarAnuncio('No hay clientes en la cola.');
            return;
        }

        const cliente = cola.shift(); 
        const cajaDesocupada = cajas.findIndex(caja => caja === null);

        if (cajaDesocupada !== -1) { 
            cajas[cajaDesocupada] = cliente;
            localStorage.setItem('cola', JSON.stringify(cola));
            localStorage.setItem('cajas', JSON.stringify(cajas));
            actualizarCajas();
            const mensaje = `Ticket número ${cliente.id}, ir a caja ${cajaDesocupada + 1}`;
            mostrarAnuncio(mensaje);
            // reproducirVoz(mensaje); // descomenta si querés voz
        } else { 
            mostrarAnuncio('Todas las cajas están ocupadas.');
            return;
        }
    }

    function retirarClienteCaja(event) {
        const cajaDiv = event.target.closest('.caja');
        if (!cajaDiv) return;
        const cajaIndex = parseInt(cajaDiv.id.replace('caja', ''), 10) - 1;

        if (cajas[cajaIndex]) {
            // Liberar caja actual
            cajas[cajaIndex] = null;
            localStorage.setItem('cajas', JSON.stringify(cajas));
            actualizarCajas();
            const mensaje = `Caja ${cajaIndex + 1} desocupada`;
            mostrarAnuncio(mensaje);
            // reproducirVoz(mensaje);

            // Traer siguiente de la cola (si hay)
            let cola = JSON.parse(localStorage.getItem('cola')) || [];
            if (cola.length > 0) {
                const siguienteCliente = cola.shift();
                cajas[cajaIndex] = siguienteCliente;
                localStorage.setItem('cola', JSON.stringify(cola));
                localStorage.setItem('cajas', JSON.stringify(cajas));
                actualizarCajas();
                const mensajeSiguiente = `Ticket número ${siguienteCliente.id} ir a caja ${cajaIndex + 1}`;
                mostrarAnuncio(mensajeSiguiente);
                // reproducirVoz(mensajeSiguiente);
            }
        }
    }

    const btnLlamar = document.getElementById('llamarClienteBtn');
    if (btnLlamar) {
        btnLlamar.addEventListener('click', llamarCliente);
    }

    // enganchar dblclick inicial si ya hay cajas guardadas
    document.querySelectorAll('.caja').forEach(caja => {
        caja.addEventListener('dblclick', retirarClienteCaja);
    });

    // Cargar estado guardado y renderizar
    const almacenCajas = JSON.parse(localStorage.getItem('cajas'));
    if (almacenCajas) {
        almacenCajas.forEach((cliente, index) => { cajas[index] = cliente; });
    }
    actualizarCajas();
});
