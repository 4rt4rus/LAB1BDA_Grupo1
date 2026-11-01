# Sistema de Gestión de una Red de Clínicas Veterinarias

Grupo 1 · Laboratorio 1 · Hito 1. Base ejecutable para desarrollar los módulos del equipo.

## Arquitectura

```text
React.js + Vite
    ↓ HTTP/JSON/JWT
REST API con Express.js de Node.js (routes → controllers → services → repositories)
    ↓ pg + SQL
CRUDE y Endpoints con PostgreSQL
```

El stack tecnológico consiste de React.js (^19.2.0) + Vite (^7.1.0) para el frontend, Node.js (20-alpine) con Express.js (^4.21.2) para el backend y PostgreSQL (16+) para la base de datos relacional.
Una sola aplicación y una sola base de datos. No se usa ORM. Los módulos futuros pueden añadirse con archivos propios en las carpetas de cada capa y registrar sus rutas en `backend/src/app.js`.

## Requisitos

- Docker Desktop versión 4.97.0 o mayor (Actualizacion de seguridad reciente).

## Instalación local

Descargar el código del repositorio y posicionarse dentro de la carpeta principal:

```bash/CMD
git clone "https://github.com/jjmca91000/LAB1BD_2_2026.git"
cd LAB1BD_2_2026
```

Luego, se necesita configurar las variables de entorno (.env):

- Ve a backend/, crea una copia del archivo '.env.example' y renombralo a '.env'.
- Abre este archivo '.env' con un editor de texto, modifica el valor de DB_HOST de 'localhost' a 'postgres_db' (sin comillas) y guarda los cambios.
- Por último, ve a frontend/, crea una copia del archivo '.env.example' y renombralo a '.env'.
- Nota: No es necesario modificar el '.env' del frontend ni eliminar los archivos '.env.example'.

Asegurarse de tener docker abierto y corriendo, y en la misma ventana bash/CMD de antes ejecutar el siguiente comando:

```bash/CMD
docker compose up --build
```
Nota: se debe esperar hasta que aparezca el mensaje 'database system is ready to accept connections' antes de proceder.

El sitio ya se encuentra arriva localmente y es posible acceder a él abriendo `http://localhost:5173` en el navegador.


Abrir `http://localhost:5173`. Para comprobar la API: `http://localhost:3000/api/health`.

El seeder incluye cuentas **solo de demostración**: `admin@redvet.cl`, `vet.norte@redvet.cl`, `carlos.m@gmail.com`, etc; contraseña `admin123`, `vet123` y `tutor123` respectivamente.

Una vez finalizado el testeo de la base, los contenedores y esquemas se pueden bajar y eliminar usando los comandos en la misma ventana bash/CMD:
```bash/CMD
docker compose down
docker compose down -v
```

## Variables de entorno

`backend/.env`: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y `FRONTEND_ORIGIN`. `frontend/.env`: `VITE_API_URL`, normalmente `http://localhost:3000/api`. Los archivos `.env` están ignorados por Git.

## Estructura

```text
backend/   API Express; rutas, controllers, services, repositories y middleware
frontend/  interfaz React mínima; páginas, layout, contexto y cliente HTTP
database/  esquema, seeder, indexes, vista materializada, triggers y procedimientos almacenados
docs/      presentación del proyecto y otros archivos
```

## Documentación de la API

1. Autenticación
POST /api/auth/login
Descripción: Inicia sesión en el sistema y retorna el token JWT junto con el rol del usuario.
Ejemplo de Request (JSON):
```
{
  "email": "admin@redvet.cl",
  "password": "admin123"
}
```
Ejemplo de Response (JSON):
```
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "usuario": {
    "id": 1,
    "email": "admin@redvet.cl",
    "rol": "Administrador"
  }
}
```

2. Gestión de Sedes (Administrador)
GET /api/sedes
Descripción: Retorna el listado completo de sedes veterinarias.
POST /api/sedes
Descripción: Registra una nueva sede.
Ejemplo de Request (JSON):
```
{
  "nombre": "Sede Este"
}
```

3. Inventario y Stock (Administrador)
GET /api/inventario
Descripción: Obtiene el stock actual de medicamentos por sede.
POST /api/inventario
Descripción: Actualiza o inserta stock de un medicamento mediante UPSERT.
Ejemplo de Request (JSON):
```
{
  "id_sede": 1,
  "id_medicamento": 2,
  "stock_actual": 45
}
```

4. Citas Médicas y Disponibilidad
GET /api/citas
Descripción: Lista las citas médicas filtradas automáticamente según el rol (Administrador ve todas, Veterinario las suyas, Tutor las de sus mascotas).
POST /api/citas
Descripción: Agrega una cita médica. Si la fecha es futura, crea una ficha abierta; si la fecha es pasada, ejecuta el Procedimiento Almacenado 1 (sp_registrar_atencion) y el Procedimiento Almacenado 2 (sp_aplicar_vacuna) de forma transaccional.
Ejemplo de Request (JSON - Cita Pasada con Receta y Vacuna):
```
{
  "id_mascota": 1,
  "id_sede": 1,
  "id_veterinario": 1,
  "tipo_atencion": "Sede",
  "fecha_hora": "2026-05-10T10:00",
  "diagnostico": "Control general y vacunación anual",
  "tratamiento": "Administración de refuerzo y reposo relativo",
  "medicamentos": [1],
  "cantidades": [2],
  "id_vacuna": 1,
  "numero_refuerzo": 1
}
```

PATCH /api/citas/:id/estado
Descripción: Actualiza el estado de una cita (ej. Cancelada, eliminando en cascada su ficha clínica abierta asociada).
Ejemplo de Request (JSON):
```
{
  "estado": "Cancelada"
}
```
GET /api/veterinarios/:idVeterinario/disponibilidad?fecha=YYYY-MM-DD
Descripción: Consulta los bloques horarios libres calculados dinámicamente por PostgreSQL para un veterinario en una fecha dada (Exclusivo Administrador).

5. Fichas Clínicas y Auditoría
GET /api/fichas
Descripción: Obtiene las fichas clínicas del sistema según el rol del usuario.
PATCH /api/fichas/:id
Descripción: Modifica el diagnóstico/tratamiento de una ficha clínica. Si está cerrada, activa automáticamente el Trigger de Auditoría (trg_auditoria_ficha); si está abierta, la cierra (estado = FALSE), completa la cita, descuenta inventario (si se recetan fármacos) y aplica vacunas (si corresponde).
Ejemplo de Request (JSON):
```
{
  "diagnostico": "Otitis externa leve tratada exitosamente",
  "tratamiento": "Aplicación de gotas óticas por 7 días",
  "medicamentos": [2],
  "cantidades": [1],
  "id_vacuna": null,
  "numero_refuerzo": 0
}
```
GET /api/auditoria
Descripción: Retorna el historial de modificaciones de diagnósticos capturados por los triggers de la base de datos (Exclusivo Administrador).
GET /api/estadisticas
Descripción: Obtiene las métricas consolidadas desde la Vista Materializada (mv_estadisticas_atencion) (Exclusivo Administrador).
