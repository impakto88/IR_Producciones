// script.js

// Obtener elementos del DOM
const formularioSesion = document.getElementById('formularioSesion');
const listaSesiones = document.getElementById('listaSesiones').getElementsByTagName('tbody')[0];
const modalEditar = document.getElementById('modalEditar');
const modalEliminar = document.getElementById('modalEliminar');
const modalEliminarTodas = document.getElementById('modalEliminarTodas');
const formularioEditar = document.getElementById('formularioEditar');
const confirmarEliminar = document.getElementById('confirmarEliminar');
const cancelarEliminar = document.getElementById('cancelarEliminar');
const confirmarEliminarTodas = document.getElementById('confirmarEliminarTodas');
const cancelarEliminarTodas = document.getElementById('cancelarEliminarTodas');
const eliminarTodasSesiones = document.getElementById('eliminarTodasSesiones');
const tipoSesion = document.getElementById('tipoSesion');
const camposStock = document.getElementById('camposStock');
const camposCorporativa = document.getElementById('camposCorporativa');

// Variables globales
let sesiones = [];
let sesionAEditar = null;
let sesionAEliminar = null;

// Funciones auxiliares
function mostrarModal(modal) {
    modal.style.display = 'block';
}

function ocultarModal(modal) {
    modal.style.display = 'none';
}

function actualizarListaSesiones() {
    listaSesiones.innerHTML = '';
    sesiones.forEach((sesion, index) => {
        const fila = listaSesiones.insertRow();
        fila.innerHTML = `
            <td class="${sesion.tipoSesion}">${sesion.tipoSesion}</td>
            <td>${sesion.titulo}</td>
            <td>${sesion.fecha}</td>
            <td>${sesion.localizacion}</td>
            <td>${sesion.modelo || sesion.responsable}</td>
            <td>${sesion.horasTrabajadas || sesion.presupuesto || ''}</td>
            <td class="acciones">
                <button class="editar" data-index="${index}"></button>
                <button class="eliminar" data-index="${index}"></button>
            </td>
        `;
    });
}

function actualizarCamposSesion() {
    if (tipoSesion.value === 'stock') {
        camposStock.style.display = 'block';
        camposCorporativa.style.display = 'none';
    } else if (tipoSesion.value === 'corporativa') {
        camposStock.style.display = 'none';
        camposCorporativa.style.display = 'block';
    } else {
        camposStock.style.display = 'none';
        camposCorporativa.style.display = 'none';
    }
}

// Event listeners
formularioSesion.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const tipoSesion = document.getElementById('tipoSesion').value;
    const titulo = document.getElementById('titulo').value;
    const fecha = document.getElementById('fecha').value;
    const localizacion = document.getElementById('localizacion').value;
    const modelo = document.getElementById('modelo').value;
    const responsable = document.getElementById('responsable').value;
    const horasTrabajadas = document.getElementById('horasTrabajadas').value;
    const presupuesto = document.getElementById('presupuesto').value;

    sesiones.push({
        tipoSesion,
        titulo,
        fecha,
        localizacion,
        modelo,
        responsable,
        horasTrabajadas,
        presupuesto
    });

    actualizarListaSesiones();
    formularioSesion.reset();
    actualizarCamposSesion();
});

listaSesiones.addEventListener('click', (evento) => {
    const botonEditar = evento.target.closest('.editar');
    const botonEliminar = evento.target.closest('.eliminar');

    if (botonEditar) {
        const index = botonEditar.dataset.index;
        sesionAEditar = sesiones[index];
        formularioEditar.editarTitulo.value = sesionAEditar.titulo;
        formularioEditar.editarFecha.value = sesionAEditar.fecha;
        formularioEditar.editarLocalizacion.value = sesionAEditar.localizacion;
        mostrarModal(modalEditar);
    } else if (botonEliminar) {
        const index = botonEliminar.dataset.index;
        sesionAEliminar = sesiones[index];
        mostrarModal(modalEliminar);
    }
});

formularioEditar.addEventListener('submit', (evento) => {
    evento.preventDefault();
    sesionAEditar.titulo = formularioEditar.editarTitulo.value;
    sesionAEditar.fecha = formularioEditar.editarFecha.value;
    sesionAEditar.localizacion = formularioEditar.editarLocalizacion.value;
    actualizarListaSesiones();
    ocultarModal(modalEditar);
});

confirmarEliminar.addEventListener('click', () => {
    sesiones = sesiones.filter(sesion => sesion !== sesionAEliminar);
    actualizarListaSesiones();
    ocultarModal(modalEliminar);
});

cancelarEliminar.addEventListener('click', () => {
    ocultarModal(modalEliminar);
});

eliminarTodasSesiones.addEventListener('click', () => {
    mostrarModal(modalEliminarTodas);
});

confirmarEliminarTodas.addEventListener('click', () => {
    sesiones = [];
    actualizarListaSesiones();
    ocultarModal(modalEliminarTodas);
});

cancelarEliminarTodas.addEventListener('click', () => {
    ocultarModal(modalEliminarTodas);
});

tipoSesion.addEventListener('change', actualizarCamposSesion);

// Cerrar modales
const cerrarModalEditar = document.querySelector('#modalEditar .cerrar');
const cerrarModalEliminar = document.querySelector('#modalEliminar .cerrar');
const cerrarModalEliminarTodas = document.querySelector('#modalEliminarTodas .cerrar');

cerrarModalEditar.addEventListener('click', () => {
    ocultarModal(modalEditar);
});

cerrarModalEliminar.addEventListener('click', () => {
    ocultarModal(modalEliminar);
});

cerrarModalEliminarTodas.addEventListener('click', () => {
    ocultarModal(modalEliminarTodas);
});

// Cancelar edición
const cancelarEditar = document.getElementById('cancelarEditar');

cancelarEditar.addEventListener('click', () => {
    ocultarModal(modalEditar);
});

// Inicialización
actualizarListaSesiones();
actualizarCamposSesion();
// script.js

// ... (resto del código) ...

// Funciones para guardar y cargar sesiones desde localStorage
function guardarSesiones() {
    localStorage.setItem('sesiones', JSON.stringify(sesiones));
}

function cargarSesiones() {
    const sesionesGuardadas = localStorage.getItem('sesiones');
    if (sesionesGuardadas) {
        sesiones = JSON.parse(sesionesGuardadas);
    }
}

// Cargar sesiones al inicio
cargarSesiones();
actualizarListaSesiones();

// Modificar funciones que modifican las sesiones
formularioSesion.addEventListener('submit', (evento) => {
    // ... (resto del código) ...
    guardarSesiones();
});

formularioEditar.addEventListener('submit', (evento) => {
    // ... (resto del código) ...
    guardarSesiones();
});

confirmarEliminar.addEventListener('click', () => {
    // ... (resto del código) ...
    guardarSesiones();
});

confirmarEliminarTodas.addEventListener('click', () => {
    // ... (resto del código) ...
    guardarSesiones();
});

// ... (resto del código) ...