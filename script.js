// script.js

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

async function cargarSesiones() {
    const { data, error } = await supabase
        .from('sesiones_fotograficas') // Asegúrate de que el nombre de tu tabla es correcto
        .select('*');

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
    const tipoSesionValue = document.getElementById('tipoSesion').value;
    const tituloValue = document.getElementById('titulo').value;
    const fechaValue = document.getElementById('fecha').value;
    const localizacionValue = document.getElementById('localizacion').value;
    const modeloValue = document.getElementById('modelo').value || null;
    const responsableValue = document.getElementById('responsable').value || null;
    const horasTrabajadasValue = document.getElementById('horasTrabajadas').value || null;
    const presupuestoValue = document.getElementById('presupuesto').value || null;

    const { error } = await supabase
        .from('sesiones_fotograficas') // Asegúrate de que el nombre de tu tabla es correcto
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
        ]);

    if (error) {
        console.error('Error al guardar la sesión en Supabase:', error);
    } else {
        formularioSesion.reset();
        actualizarCamposSesion();
        cargarSesiones(); // Recargar las sesiones después de guardar
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
        // Aquí podrías añadir lógica para rellenar los campos específicos de stock o corporativa en el modal de edición
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
        const tipoSesionValue = sesionAEditar.tipoSesion; // Mantener el tipo de sesión
        const tituloValue = formularioEditar.editarTitulo.value;
        const fechaValue = formularioEditar.editarFecha.value;
        const localizacionValue = formularioEditar.editarLocalizacion.value;
        const modeloValue = document.getElementById('editarModelo')?.value || null;
        const responsableValue = document.getElementById('editarResponsable')?.value || null;
        const horasTrabajadasValue = document.getElementById('editarHorasTrabajadas')?.value || null;
        const presupuestoValue = document.getElementById('editarPresupuesto')?.value || null;

        const { error } = await supabase
            .from('sesiones_fotograficas') // Asegúrate de que el nombre de tu tabla es correcto
            .update({
                titulo: tituloValue,
                fecha: fechaValue,
                localizacion: localizacionValue,
                ...(tipoSesionValue === 'stock' && { modelo: modeloValue }),
                ...(tipoSesionValue === 'corporativa' && { responsable: responsableValue, horasTrabajadas: horasTrabajadasValue, presupuesto: presupuestoValue }),
            })
            .eq('id', sesionAEditar.id); // Filtrar por el ID de la sesión a editar

        if (error) {
            console.error('Error al editar la sesión en Supabase:', error);
        } else {
            ocultarModal(modalEditar);
            cargarSesiones(); // Recargar las sesiones después de editar
        }
    }
});

confirmarEliminar.addEventListener('click', async () => {
    if (sesionAEliminar) {
        const { error } = await supabase
            .from('sesiones_fotograficas') // Asegúrate de que el nombre de tu tabla es correcto
            .delete()
            .eq('id', sesionAEliminar.id); // Filtrar por el ID de la sesión a eliminar

        if (error) {
            console.error('Error al eliminar la sesión de Supabase:', error);
        } else {
            ocultarModal(modalEliminar);
            cargarSesiones(); // Recargar las sesiones después de eliminar
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
        .from('sesiones_fotograficas') // Asegúrate de que el nombre de tu tabla es correcto
        .delete()
        .neq('id', 0); // Eliminar todas las filas (asumiendo que los IDs son positivos)

    if (error) {
        console.error('Error al eliminar todas las sesiones de Supabase:', error);
    } else {
        ocultarModal(modalEliminarTodas);
        cargarSesiones(); // Recargar las sesiones después de eliminar todas
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
cargarSesiones(); // Cargar las sesiones desde Supabase al inicio