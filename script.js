import { app } from './index.html'; // Importa la instancia de Firebase desde tu HTML
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const db = getFirestore(app);

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

async function actualizarListaSesiones() {
    listaSesiones.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "sesiones"));
    sesiones = []; // Limpiar el array local
    querySnapshot.forEach((doc) => {
        const sesion = doc.data();
        sesion.id = doc.id; // Agregar el ID del documento
        sesiones.push(sesion);
    });

    sesiones.forEach((sesion, index) => {
        const fila = listaSesiones.insertRow();
        fila.innerHTML = `
            <td class="<span class="math-inline">\{sesion\.tipoSesion\}"\></span>{sesion.tipoSesion}</td>
            <td><span class="math-inline">\{sesion\.titulo\}</td\>
<td\></span>{sesion.fecha}</td>
            <td><span class="math-inline">\{sesion\.localizacion\}</td\>
<td\></span>{sesion.modelo || sesion.responsable}</td>
            <td><span class="math-inline">\{sesion\.horasTrabajadas \|\| sesion\.presupuesto \|\| ''\}</td\>
<td class\="acciones"\>
<button class\="editar" data\-index\="</span>{index}"></button>
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
formularioSesion.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const tipoSesion = document.getElementById('tipoSesion').value;
    const titulo = document.getElementById('titulo').value;
    const fecha = document.getElementById('fecha').value;
    const localizacion = document.getElementById('localizacion').value;
    const modelo = document.getElementById('modelo').value;
    const responsable = document.getElementById('responsable').value;
    const horasTrabajadas = document.getElementById('horasTrabajadas').value;
    const presupuesto = document.getElementById('presupuesto').value;

    await addDoc(collection(db, "sesiones"), {
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

formularioEditar.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const sesionDocRef = doc(db, "sesiones", sesionAEditar.id);
    await updateDoc(sesionDocRef, {
        titulo: formularioEditar.editarTitulo.value,
        fecha: formularioEditar.editarFecha.value,
        localizacion: formularioEditar.editarLocalizacion.value
    });
    actualizarListaSesiones();
    ocultarModal(modalEditar);
});

confirmarEliminar.addEventListener('click', async () => {
    const sesionDocRef = doc(db, "sesiones", sesionAEliminar.id);
    await deleteDoc(sesionDocRef);
    actualizarListaSesiones();
    ocultarModal(modalEliminar);
});

cancelarEliminar.addEventListener('click', () => {
    ocultarModal(modalEliminar);
});

eliminarTodasSesiones.addEventListener('click', () => {
    mostrarModal(modalEliminarTodas);
});

confirmarEliminarTodas.addEventListener('click', async () => {
    const querySnapshot = await getDocs(collection(db, "sesiones"));
    querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
    });
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