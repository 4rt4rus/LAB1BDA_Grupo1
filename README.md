# Sistema de Gestión de una Red de Clínicas Veterinarias

Grupo 1 · Laboratorio 1 · Hito 1. Base ejecutable para desarrollar los módulos del equipo.

## Arquitectura

```text
React + Vite
    ↓ HTTP/JSON
REST API de Express (routes → controllers → services → repositories)
    ↓ pg + SQL
PostgreSQL
```

Una sola aplicación y una sola base de datos. No se usa ORM. Los módulos futuros pueden añadirse con archivos propios en las carpetas de cada capa y registrar sus rutas en `backend/src/app.js`.

## Requisitos

- Node.js 20.19+ o 22.12+ (se recomienda Node 24 LTS) y npm.
- PostgreSQL 16+ con `psql` disponible. El esquema usa SQL estándar de PostgreSQL.

## Instalación local

```bash
git clone https://github.com/jjmca91000/LAB1BD_2_2026.git
cd LAB1BD_2_2026
```

Crear una base vacía en PostgreSQL. Ajusta usuario, host y puerto a tu instalación:

```bash
createdb -U postgres lab1bd_veterinaria
psql -U postgres -d lab1bd_veterinaria -v ON_ERROR_STOP=1 -f database/schema.sql
psql -U postgres -d lab1bd_veterinaria -v ON_ERROR_STOP=1 -f database/seed.sql
```

En PowerShell, copiar los ejemplos y editar las variables:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

En una terminal, iniciar el backend:

```bash
cd backend
npm ci
npm run dev
```

En otra terminal, iniciar el frontend:

```bash
cd frontend
npm ci
npm run dev
```

Abrir `http://localhost:5173`. Para comprobar la API: `http://localhost:3000/api/health`.

El seed incluye cuentas **solo de demostración**: `ana@example.test`, `luis@example.test` y `admin@example.test`; contraseña `Lab1BD2026!`. Cambia estas credenciales antes de cualquier despliegue. `seed.sql` se ejecuta una sola vez sobre una base recién creada.

## Variables de entorno

`backend/.env`: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y `FRONTEND_ORIGIN`. Configura un `JWT_SECRET` largo y aleatorio. `frontend/.env`: `VITE_API_URL`, normalmente `http://localhost:3000/api`. Los archivos `.env` están ignorados por Git.

## Estructura

```text
backend/   API Express; rutas, controllers, services, repositories y middleware
frontend/  interfaz React mínima; páginas, layout, contexto y cliente HTTP
database/  esquema, seed y archivos reservados para SQL del Hito 2
docs/      guía de integración del equipo
```

## API inicial

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/health` | Público | Estado del proceso |
| POST | `/api/auth/login` | Público | Recibe `{"correo":"...","password":"..."}` y devuelve JWT y usuario |
| GET | `/api/mascotas` | JWT | Lista resumida de mascotas |
| GET | `/api/veterinarios` | JWT | Lista de veterinarios |
| GET | `/api/sedes` | JWT | Lista de sedes activas |

Las rutas protegidas requieren `Authorization: Bearer <token>`. El login y RBAC son una base inicial; falta aplicar permisos por dueño, sede y operación antes de exponer datos reales.

## Desarrollo futuro

Quedan para Hito 2 los CRUD completos, los permisos JWT/RBAC detallados, los procedimientos almacenados, los triggers, los índices medidos con consultas reales, la vista materializada y los endpoints especializados. La división por persona y las reglas de integración están en [docs/equipo.md](docs/equipo.md).
