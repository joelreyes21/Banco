document.addEventListener('DOMContentLoaded', () => {
    
    localStorage.setItem('numeroCliente', '1');

    
    let cola = JSON.parse(localStorage.getItem('cola')) || [];

    function reproducirVoz(texto) {
        const utterance = new SpeechSynthesisUtterance(texto);
        window.speechSynthesis.speak(utterance);
    }

    function mostrarAnuncio(mensaje) {
        const a = document.getElementById('anuncio');
        if (a) a.innerText = mensaje;
    }

    
    function refrescarHeader() {
        const el = document.getElementById('ticketDisplay');
        if (!el) return;
        const ticketActual = localStorage.getItem('ticketActual');
        if (ticketActual) {
            el.innerText = `Ticket: ${ticketActual}`;
        } else {
            el.innerText = `Tickets: ${cola.length}`;
        }
    }

    function actualizarCola() {
        const colaDiv = document.getElementById('cola');
        if (!colaDiv) return;
        colaDiv.innerHTML = '';
        cola.forEach(cliente => {
            const clienteDiv = document.createElement('div');
            clienteDiv.className = 'cliente';
            clienteDiv.style.backgroundColor = cliente.color;
            clienteDiv.innerText = 'C' + cliente.id;
            colaDiv.appendChild(clienteDiv);
        });
        
        const ticketActual = localStorage.getItem('ticketActual');
        if (!ticketActual) {
            const el = document.getElementById('ticketDisplay');
            if (el) el.innerText = `Tickets: ${cola.length}`;
        }
    }

    
    function actualizarEstadoCajas() {
        const cont = document.getElementById('estadoCajas');
        if (!cont) return;

        const cajas = JSON.parse(localStorage.getItem('cajas')) || [];
        cont.innerHTML = '';

        if (cajas.length === 0) {
            cont.innerHTML = '<div class="text-muted text-center">No hay cajas creadas.</div>';
            return;
        }

        cajas.forEach((cliente, i) => {
            const div = document.createElement('div');
            div.className = 'estado-caja ' + (cliente ? 'ocupada' : 'desocupada');
            div.textContent = cliente
                ? `Caja ${i + 1}: Ocupada con ticket ${cliente.id}`
                : `Caja ${i + 1}: Desocupada`;
            cont.appendChild(div);
        });
    }

    
    function obtenerNumeroCliente() {
        
        let numeroCliente = parseInt(localStorage.getItem('numeroCliente')) || 1;
        return numeroCliente;
    }

    function actualizarNumeroCliente(nuevoNumero) {
        localStorage.setItem('numeroCliente', String(nuevoNumero));
    }

    function generarCliente() {
        const numeroCliente = obtenerNumeroCliente();
        const cliente = { id: numeroCliente, color: "#FF0000" };
        cola.push(cliente);
        localStorage.setItem('cola', JSON.stringify(cola));
        actualizarCola();
        actualizarNumeroCliente(numeroCliente + 1);
        
        const ticketActual = localStorage.getItem('ticketActual');
        if (!ticketActual) {
            const el = document.getElementById('ticketDisplay');
            if (el) el.innerText = `Tickets: ${cola.length}`;
        }
    }

    function entregarTicket() {
        if (cola.length === 0) {
            alert('No hay clientes en espera.');
            return;
        }

        const cliente = cola[0]; 
        localStorage.setItem('ticketActual', String(cliente.id));

        const display = document.getElementById('ticketDisplay');
        if (display) display.innerText = `Ticket: ${cliente.id}`;

        const mensajeTicket = `Ticket número ${cliente.id} entregado.`;
        mostrarAnuncio(mensajeTicket);
        

        actualizarCola();
        actualizarEstadoCajas();
    }

    function reiniciarCola() {
        
        cola = [];
        localStorage.setItem('cola', JSON.stringify(cola));
        localStorage.removeItem('ticketActual');

        
        actualizarNumeroCliente(1);

        const display = document.getElementById('ticketDisplay');
        if (display) display.innerText = 'Tickets: 0';

        const mensajeReinicio = 'La cola ha sido reiniciada.';
        mostrarAnuncio(mensajeReinicio);

        actualizarCola();
        actualizarEstadoCajas();
    }

    
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
        return color;
    }

    
    const btnGen = document.getElementById('generarClienteBtn');
    if (btnGen) btnGen.addEventListener('click', generarCliente);

    const btnEnt = document.getElementById('entregarTicketBtn');
    if (btnEnt) btnEnt.addEventListener('click', entregarTicket);

    const btnRei = document.getElementById('reiniciarBtn');
    if (btnRei) btnRei.addEventListener('click', reiniciarCola);

    
    actualizarCola();
    actualizarEstadoCajas();
    refrescarHeader();
});
