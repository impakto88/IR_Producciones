// script.js

// Inicialización de Supabase
const supabaseUrl = 'https://xeepwtquaoybjphenqnm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZXB3dHF1YW95YmpwaGVucWnmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTIwMDAsImV4cCI6MjA2MDM4ODAwMH0.qVoGbf6P3_J_mOmdKm5tJzPYeL8Bbo_k8srSLSTStmI';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log('Cliente de Supabase inicializado:', supabase);

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
            <td>${sesion.modelo || sesion.responsable || ''}</td>
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

async function cargarSesionesDesdeSupabase() {
    const { data, error } = await supabase
        .from('sesiones_fotograficas')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) {
        console.error('Error al cargar las sesiones desde Supabase:', error);
        // Aquí podrías añadir una lógica de respaldo para cargar desde localStorage si lo deseas
    } else if (data) {
        sesiones = data;
        actualizarListaSesiones();
    }
}

async function guardarSesionEnSupabase(nuevaSesion) {
    const { data, error } = await supabase
        .from('sesiones_fotograficas')
        .insert([nuevaSesion])
        .select();

    if (error) {
        console.error('Error al guardar la sesión en Supabase:', error);
        return null; // Indica que hubo un error
    } else if (data && data.length > 0) {
        return data[0]; // Devuelve la nueva sesión con su ID de Supabase
    }
    return null; // No se devolvieron datos
}

async function actualizarSesionEnSupabase(id, updates) {
    const { error } = await supabase
        .from('sesiones_fotograficas')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error al actualizar la sesión en Supabase:', error);
        return false;
    }
    return true;
}

async function eliminarSesionDeSupabase(id) {
    const { error } = await supabase
        .from('sesiones_fotograficas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar la sesión de Supabase:', error);
        return false;
    }
    return true;
}

async function eliminarTodasLasSesionesDeSupabase() {
    const { error } = await supabase
        .from('sesiones_fotograficas')
        .delete()
        .neq('id', 0); // Elimina todas las filas donde el ID no es 0 (asumiendo que los IDs son positivos)

    if (error) {
        console.error('Error al eliminar todas las sesiones de Supabase:', error);
        return false;
    }
    return true;
}

// Event listeners
formularioSesion.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const tipoSesionValue = tipoSesion.value;
    const tituloValue = document.getElementById('titulo').value;
    const fechaValue = document.getElementById('fecha').value;
    const localizacionValue = document.getElementById('localizacion').value;
    const modeloValue = document.getElementById('modelo')?.value || null;
    const responsableValue = document.getElementById('responsable')?.value || null;
    const horasTrabajadasValue = document.getElementById('horasTrabajadas')?.value ? parseInt(document.getElementById('horasTrabajadas').value) : null;
    const presupuestoValue = document.getElementById('presupuesto')?.value ? parseFloat(document.getElementById('presupuesto').value) : null;

    const nuevaSesion = {
        tipoSesion: tipoSesionValue,
        titulo: tituloValue,
        fecha: fechaValue,
        localizacion: localizacionValue,
        modelo: modeloValue,
        responsable: responsableValue,
        horasTrabajadas: horasTrabajadasValue,
        presupuesto: presupuestoValue
    };

    const sesionGuardada = await guardarSesionEnSupabase(nuevaSesion);
    if (sesionGuardada) {
        sesiones.push(sesionGuardada);
        actualizarListaSesiones();
        formularioSesion.reset();
        actualizarCamposSesion();
    }
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
            ...(sesionAEditar.tipoSesion === 'stock' && { modelo: modeloValue }),
            ...(sesionAEditar.tipoSesion === 'corporativa' && { responsable: responsableValue, horasTrabajadas: horasTrabajadasValue, presupuesto: presupuestoValue }),
        };

        const actualizado = await actualizarSesionEnSupabase(sesionAEditar.id, updates);
        if (actualizado) {
            const index = sesiones.findIndex(sesion => sesion.id === sesionAEditar.id);
            if (index !== -1) {
                sesiones[index] = { ...sesionAEditar, ...updates };
                actualizarListaSesiones();
            }
            ocultarModal(modalEditar);
        }
    }
});

confirmarEliminar.addEventListener('click', async () => {
    if (sesionAEliminar) {
        const eliminado = await eliminarSesionDeSupabase(sesionAEliminar.id);
        if (eliminado) {
            sesiones = sesiones.filter(sesion => sesion.id !== sesionAEliminar.id);
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
    const eliminadas = await eliminarTodasLasSesionesDeSupabase();
    if (eliminadas) {
        sesiones = [];
        actualizarListaSesiones();
        ocultarModal(modalEliminarTodas);
    }
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
actualizarCamposSesion();
cargarSesionesDesdeSupabase();