// Definir una constante global para la URL base de tu API
const BASE_URL = "http://127.0.0.1:5000";

function ocultarClave(clave = '') {
    return '•'.repeat(8);
}

function escaparHTML(valor = '') {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caracter]);
}

// Función para visualizar datos en la tabla
function visualizar(data) {
    const tabla = document.getElementById('tabla-datos');
    if (!tabla) return;
    if (!data.baul || data.baul.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="bi bi-inbox"></i><strong>Aún no hay contraseñas guardadas</strong><span>Agrega tu primer acceso para verlo aquí.</span></td></tr>';
        return;
    }
    tabla.innerHTML = data.baul.map(item => {
        const clave = item.clave || item.contrasena || '';
        return `
            <tr data-id="${item.id_baul}">
                <td class="record-id">${item.id_baul}</td>
                <td><span class="platform-name"><i class="bi bi-globe2"></i>${escaparHTML(item.Plataforma || item.plataforma || '')}</span></td>
                <td>${escaparHTML(item.usuario || '')}</td>
                <td><span class="password-value" title="Contraseña protegida">${ocultarClave(clave)}</span></td>
                <td class="actions">
                    <a class="icon-button edit" href="edit.html?id=${item.id_baul}" aria-label="Editar ${escaparHTML(item.Plataforma || item.plataforma || '')}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <button type="button" class="icon-button delete" onclick="eliminar(${item.id_baul})" aria-label="Eliminar ${item.Plataforma}" title="Eliminar">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');
}

function setupPasswordToggle(inputId = 'clave') {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById('toggle-password');

    if (!input || !toggle) return;

    toggle.addEventListener('click', () => {
        const isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        toggle.innerHTML = isVisible
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';
        toggle.setAttribute('aria-label', isVisible ? 'Mostrar contraseña' : 'Ocultar contraseña');
    });
}

// Función para realizar una consulta general (GET)
function consulta_general() {
    fetch(`${BASE_URL}/`) // Realiza una solicitud GET al endpoint raíz o de listado
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => visualizar(data))
        .catch(error => mostrarError(error));
}

// Función para eliminar un registro (DELETE)
function eliminar(id) {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;

    fetch(`${BASE_URL}/eliminar/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(res => {
            actualizarDOM(id);
            notificar(`Registro ${res.mensaje ? res.mensaje.toLowerCase() : 'eliminado'} exitosamente`, 'success');
        })
        .catch(error => mostrarError(error));
}

// Función para actualizar el DOM después de eliminar un elemento
function actualizarDOM(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) row.remove();
}

// Función para registrar un nuevo registro (POST)
function registrar() {
    const data = obtenerFormulario();
    if (!validarFormulario(data)) return;

    fetch(`${BASE_URL}/registro/`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(response => {
        if (response.mensaje === "Error") {
            notificar("No se pudo guardar el registro", 'error');
        } else {
            notificar("Registro agregado exitosamente", 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 700);
        }
    })
    .catch(error => mostrarError(error));
}

// Función para consultar un registro individual (GET)
function consulta_individual(id) {
    fetch(`${BASE_URL}/consulta_individual/${id}`)
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const registro = data.baul || data; // Soporta ambos formatos de respuesta
            document.getElementById("plataforma").value = registro.Plataforma || registro.plataforma || '';
            document.getElementById("usuario").value = registro.usuario || '';
            document.getElementById("clave").value = registro.clave || registro.contrasena || '';
        })
        .catch(error => mostrarError(error));
}

// Función para modificar un registro existente (PUT)
function modificar(id) {
    const data = obtenerFormulario();
    if (!validarFormulario(data)) return;

    fetch(`${BASE_URL}/actualizar/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(response => {
        if (response.mensaje === "Error") {
            notificar("Error al actualizar el registro", 'error');
        } else {
            notificar("Registro actualizado exitosamente", 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 700);
        }
    })
    .catch(error => mostrarError(error));
}

function obtenerFormulario() {
    return {
        plataforma: document.getElementById("plataforma").value.trim(),
        usuario: document.getElementById("usuario").value.trim(),
        clave: document.getElementById("clave").value
    };
}

function validarFormulario(data) {
    if (data.plataforma && data.usuario && data.clave) return true;
    notificar('Completa todos los campos para continuar', 'warning');
    return false;
}

function notificar(mensaje, tipo) {
    if (typeof swal === 'function') {
        swal('Gestor de contraseñas', mensaje, tipo);
    } else {
        window.alert(mensaje);
    }
}

function mostrarError(error) {
    console.error('Error:', error);
    notificar('No fue posible conectar con el servidor', 'error');
}

// Ejecutar automáticamente la carga de datos al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    consulta_general();
    setupPasswordToggle();

    const formulario = document.getElementById('form-contrasena');
    if (formulario) {
        formulario.addEventListener('submit', event => {
            event.preventDefault();
            registrar();
        });
    }
});