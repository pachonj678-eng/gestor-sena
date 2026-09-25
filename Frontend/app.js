const API_URL = "http://127.0.0.1:5000";

async function cargarRegistros() {
    try {
        const response = await fetch(`${API_URL}/`);
        const data = await response.json();
        const tbody = document.getElementById('tabla-datos');
        if (!tbody) return;
        tbody.innerHTML = '';

        data.baul.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.id_baul}</td>
                    <td>${item.Plataforma}</td>
                    <td>${item.usuario}</td>
                    <td>
                        <a href="edit.html?id=${item.id_baul}" class="btn btn-warning btn-sm">Editar</a>
                        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${item.id_baul})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error("Error al cargar los datos:", error); }
}

const formContrasena = document.getElementById('form-contrasena');
if (formContrasena) {
    formContrasena.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plataforma = document.getElementById('plataforma').value;
        const usuario = document.getElementById('usuario').value;
        const clave = document.getElementById('clave').value;

        try {
            const response = await fetch(`${API_URL}/registro/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plataforma, usuario, clave })
            });
            const result = await response.json();
            alert(result.mensaje);
            formContrasena.reset();
            cargarRegistros();
        } catch (error) { console.error("Error al registrar:", error); }
    });
}

async function eliminarRegistro(id) {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        try {
            const response = await fetch(`${API_URL}/eliminar/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            alert(result.mensaje);
            cargarRegistros();
        } catch (error) { console.error("Error al eliminar:", error); }
    }
}

cargarRegistros();
