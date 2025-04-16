// script.js

const supabaseUrl = 'https://xeepwtquaoybjphenqnm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZXB3dHF1YW95YmpwaGVucWnmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTIwMDAsImV4cCI6MjA2MDM4ODAwMH0.qVoGbf6P3_J_mOmdKm5tJzPYeL8Bbo_k8srSLSTStmI';

const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log('Cliente de Supabase inicializado:', supabase);

// Obtener elementos del DOM
const formularioSesion = document.getElementById('formularioSesion');
const listaSesionesTbody = document.getElementById('listaSesiones').getElementsByTagName('tbody')[0]; // Corrección: Usar tbody
const modalEditar = document.getElementById('modalEditar');
const modalEliminar = document.getElementById('modalEliminar');
const modalEliminarTodas = document.getElementById('modalEliminarTodas');
const formularioEditar = document.getElementById('formularioEditar');
const confirmarEliminar = document.getElementById('confirmarEliminar');
const cancelarEliminar = document.getElementById('cancelarEliminar');
const confirmarEliminarTodas = document.getElementById('confirmarEliminarTodas');
const cancelarEliminarTodas = document.getElementById('cancelarEliminarTodas');
const eliminarTodasSesiones = document.getElementById('eliminarTodasSesiones');
const tipoSesionSelect = document.getElementById('tipoSesion'); // Corrección: Usar el select para obtener el valor
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
    listaSesionesTbody.innerHTML = ''; // Corrección: Usar listaSesionesTbody
    sesiones.forEach((sesion, index) => {
        const fila = listaSesionesTbody.insertRow(); // Corrección: Usar listaSesionesTbody
        fila.innerHTML = `
            <td class="${sesion.tipoSesion}">${sesion.tipoSesion}</td>
            <td>${sesion.titulo}</td>
            <td>${sesion.fecha}</td>
            <td>${sesion.localizacion}</td>
            <td>${sesion.modelo || sesion.responsable || ''}</td>
            <td>${sesion.horasTrabajadas || sesion.presupuesto || ''}</td>
            <td class="acciones">
                <button class="editar" data-index="${index}">Editar</button>
                <button class="eliminar" data-index="${index}">Eliminar</button>
            </td>
        `;
    });
}

function actualizarCamposSesion() {
    if (tipoSesionSelect.value === 'stock') { // Corrección: Usar tipoSesionSelect.value
        camposStock.style.display = 'block';
        camposCorporativa.style.display = 'none';
    } else if (tipoSesionSelect.value === 'corporativa') { // Corrección: Usar tipoSesionSelect.value
        camposStock.style.display = 'none';
        camposCorporativa.style.display = 'block';
    } else {
        camposStock.style.display = 'none';
        camposCorporativa.style.display = 'none';
    }
}

async function cargarSesiones() {
    const { data, error } = await supabase
        .from('sesiones_fotograficas')
        .select('*')
        .order('fecha', { ascending: false }); // Ordenar por fecha descendente para mostrar lo último primero

    if (error) {
        console.error('Error al cargar las sesiones desde Supabase:', error);
        return;
    }

    if (data) {
        sesiones = data;
        actualizarListaSesiones();
    }
}

// Event listeners
formularioSesion.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const tipoSesionValue = tipoSesionSelect.value; // Corrección: Usar tipoSesionSelect.value
    const tituloValue = document.getElementById('titulo').value;
    const fechaValue = document.getElementById('fecha').value;
    const localizacionValue = document.getElementById('localizacion').value;
    const modeloValue = document.getElementById('modelo')?.value || null;
    const responsableValue = document.getElementById('responsable')?.value || null;
    const horasTrabajadasValue = document.getElementById('horasTrabajadas')?.value ? parseInt(document.getElementById('horasTrabajadas').value) : null; // Asegurar que sea número
    const presupuestoValue = document.getElementById('presupuesto')?.value ? parseFloat(document.getElementById('presupuesto').value) : null; // Asegurar que sea número

    const { data, error } = await supabase
        .from('sesiones_fotograficas')
        .insert([
            {
                tipoSesion: tipoSesionValue,
                titulo: tituloValue,
                fecha: fechaValue,
                localizacion: localizacionValue,
                modelo: modeloValue,
                responsable: responsableValue,
                horasTrabajadas: horasTrabajadasValue,
                presupuesto: presupuestoValue,
            },
        ])
        .select(); // Para obtener la nueva sesión insertada

    if (error) {
        console.error('Error al guardar la sesión en Supabase:', error);
    } else if (data && data.length > 0) {
        sesiones = [...sesiones, data[0]]; // Añadir la nueva sesión al array local
        actualizarListaSesiones();
        formularioSesion.reset();
        actualizarCamposSesion();
    }
});

listaSesionesTbody.addEventListener('click', (evento) => { // Corrección: Usar listaSesionesTbody
    const botonEditar = evento.target.closest('.editar');
    const botonEliminar = evento.target.closest('.eliminar');

    if (botonEditar) {
        const index = botonEditar.dataset.index;
        sesionAEditar = sesiones[index];
        formularioEditar.editarTitulo.value = sesionAEditar.titulo;
        formularioEditar.editarFecha.value = sesionAEditar.fecha;
        formularioEditar.editarLocalizacion.value = sesionAEditar.localizacion;
        const editarModeloInput = document.getElementById('editarModelo');
        const editarResponsableInput = document.getElementById('editarResponsable');
        const editarHorasTrabajadasInput = document.getElementById('editarHorasTrabajadas');
        const editarPresupuestoInput = document.getElementById('editarPresupuesto');

        if (sesionAEditar.tipoSesion === 'stock' && editarModeloInput) {
            editarModeloInput.value = sesionAEditar.modelo || '';
        } else if (sesionAEditar.tipoSesion === 'corporativa' && editarResponsableInput) {
            editarResponsableInput.value = sesionAEditar.responsable || '';
            editarHorasTrabajadasInput.value = sesionAEditar.horasTrabajadas || '';
            editarPresupuestoInput.value = sesionAEditar.presupuesto || '';
        }

        mostrarModal(modalEditar);
    } else if (botonEliminar) {
        const index = botonEliminar.dataset.index;
        sesionAEliminar = sesiones[index];
        mostrarModal(modalEliminar);
    }
});

formularioEditar.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (sesionAEditar) {
        const tituloValue = formularioEditar.editarTitulo.value;
        const fechaValue = formularioEditar.editarFecha.value;
        const localizacionValue = formularioEditar.editarLocalizacion.value;
        const modeloValue = document.getElementById('editarModelo')?.value || null;
        const responsableValue = document.getElementById('editarResponsable')?.value || null;
        const horasTrabajadasValue = document.getElementById('editarHorasTrabajadas')?.value ? parseInt(document.getElementById('editarHorasTrabajadas').value) : null;
        const presupuestoValue = document.getElementById('editarPresupuesto')?.value ? parseFloat(document.getElementById('editarPresupuesto').value) : null;

        const updates = {
            titulo: tituloValue,
            fecha: fechaValue,
            localizacion: localizacionValue,
        };

        if (sesionAEditar.tipoSesion === 'stock') {
            updates.modelo = modeloValue;
        } else if (sesionAEditar.tipoSesion === 'corporativa') {
            updates.responsable = responsableValue;
            updates.horasTrabajadas = horasTrabajadasValue;
            updates.presupuesto = presupuestoValue;
        }

        const { error } = await supabase
            .from('sesiones_fotograficas')
            .update(updates)
            .eq('id', sesionAEditar.id);

        if (error) {
            console.error('Error al editar la sesión en Supabase:', error);
        } else {
            ocultarModal(modalEditar);
            cargarSesiones();
        }
    }
});

confirmarEliminar.addEventListener('click', async () => {
    if (sesionAEliminar) {
        const { error } = await supabase
            .from('sesiones_fotograficas')
            .delete()
            .eq('id', sesionAEliminar.id);

        if (error) {
            console.error('Error al eliminar la sesión de Supabase:', error);
        } else {
            sesiones = sesiones.filter(sesion => sesion.id !== sesionAEliminar.id); // Actualizar array local
            actualizarListaSesiones();
            ocultarModal(modalEliminar);
        }
    }
});

cancelarEliminar.addEventListener('click', () => {
    ocultarModal(modalEliminar);
});

eliminarTodasSesiones.addEventListener('click', () => {
    mostrarModal(modalEliminarTodas);
});

confirmarEliminarTodas.addEventListener('click', async () => {
    const { error } = await supabase
        .from('sesiones_fotograficas')
        .delete()
        .neq('id', 0);

    if (error) {
        console.error('Error al eliminar todas las sesiones de Supabase:', error);
    } else {
        sesiones = [];
        actualizarListaSesiones();
        ocultarModal(modalEliminarTodas);
    }
});

cancelarEliminarTodas.addEventListener('click', () => {
    ocultarModal(modalEliminarTodas);
});

tipoSesionSelect.addEventListener('change', actualizarCamposSesion); // Corrección: Usar tipoSesionSelect

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
actualizarCamposSesion();
cargarSesiones();