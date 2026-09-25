from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="gestor_contrasena"
    )

@app.route("/", methods=["GET"])
def listar():
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM baul")
    resultados = cursor.fetchall()
    cursor.close()
    conexion.close()
    return jsonify({"baul": resultados})

@app.route("/registro/", methods=["POST"])
def registrar():
    data = request.get_json()
    plataforma = data.get("plataforma")
    usuario = data.get("usuario")
    clave = data.get("clave")

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute(
        "INSERT INTO baul (Plataforma, usuario, clave) VALUES (%s, %s, %s)",
        (plataforma, usuario, clave)
    )
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({"mensaje": "¡Contraseña guardada con éxito!"})

@app.route("/eliminar/<int:id>", methods=["DELETE"])
def eliminar(id):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM baul WHERE id_baul = %s", (id,))
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({"mensaje": "¡Registro eliminado correctamente!"})

@app.route("/consulta_individual/<int:id>", methods=["GET"])
def consulta_individual(id):
    conexion = conectar_db()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM baul WHERE id_baul = %s", (id,))
    resultado = cursor.fetchone()
    cursor.close()
    conexion.close()
    return jsonify({"baul": resultado})

@app.route("/actualizar/<int:id>", methods=["PUT"])
def actualizar(id):
    data = request.get_json()
    plataforma = data.get("plataforma")
    usuario = data.get("usuario")
    clave = data.get("clave")

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute(
        "UPDATE baul SET Plataforma = %s, usuario = %s, clave = %s WHERE id_baul = %s",
        (plataforma, usuario, clave, id)
    )
    conexion.commit()
    cursor.close()
    conexion.close()
    return jsonify({"mensaje": "¡Registro actualizado con éxito!"})

if __name__ == "__main__":
    app.run(debug=True)
