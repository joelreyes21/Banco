document.addEventListener('DOMContentLoaded', () => {
    const cajas = JSON.parse(localStorage.getItem('cajas')) || [null, null, null, null, null, null]; // 6 cajas

    function mostrarAnuncio(mensaje) {
        document.getElementById('anuncio').innerText = mensaje;
    }

    function reproducirVoz(texto) {
        const utterance = new SpeechSynthesisUtterance(texto);
        window.speechSynthesis.speak(utterance);
    }

    function actualizarCajas() {
        cajas.forEach((cliente, index) => {
            const cajaDiv = document.getElementById('caja' + (index + 1));
            if (cliente) {
                cajaDiv.style.backgroundColor = cliente.color || '#f8f9fa'; 
                cajaDiv.innerHTML = `<h5>Cliente ${cliente.id} </h5>`; 
            } else {
                cajaDiv.style.backgroundColor = '#f8f9fa';
                cajaDiv.innerHTML = `<h5>Caja ${index + 1} desocupada</h5>`;
            }
        });
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
            reproducirVoz(mensaje);
        } else { 
            mostrarAnuncio('Todas las cajas están ocupadas.');
            return;
        }
    }

    function retirarClienteCaja(event) {
        const cajaDiv = event.target.closest('.caja');
        const cajaIndex = parseInt(cajaDiv.id.replace('caja', '')) - 1;

        if (cajas[cajaIndex]) {
            const clienteId = cajas[cajaIndex].id;
            cajas[cajaIndex] = null;
            localStorage.setItem('cajas', JSON.stringify(cajas));
            actualizarCajas();
            const mensaje = `Caja ${cajaIndex + 1} desocupada`;
            reproducirVoz(mensaje);
            mostrarAnuncio(mensaje);

            let cola = JSON.parse(localStorage.getItem('cola')) || [];
            if (cola.length > 0) {
                const siguienteCliente = cola.shift();
                cajas[cajaIndex] = siguienteCliente;
                localStorage.setItem('cola', JSON.stringify(cola));
                localStorage.setItem('cajas', JSON.stringify(cajas));
                actualizarCajas();
                const mensajeSiguiente = `Ticket número ${siguienteCliente.id} ir a caja ${cajaIndex + 1}`;
                reproducirVoz(mensajeSiguiente);
                mostrarAnuncio(mensajeSiguiente);
            }
        }
    }

    document.getElementById('llamarClienteBtn').addEventListener('click', llamarCliente);

    document.querySelectorAll('.caja').forEach(caja => {
        caja.addEventListener('dblclick', retirarClienteCaja);
    });

    const almacenCajas = JSON.parse(localStorage.getItem('cajas'));
    if (almacenCajas) {
        almacenCajas.forEach((cliente, index) => {
            cajas[index] = cliente;
        });
        actualizarCajas();
    }
});
