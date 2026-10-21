# Integración de los seis módulos

Mantener una rama por módulo y agregar archivos por dominio dentro de `routes/`, `controllers/`, `services/` y `repositories/` (por ejemplo, `citasRoutes.js` y `citasRepository.js`). Evitar editar los archivos de otros dominios. `backend/src/app.js` será un punto de integración común; coordinar sus cambios al unir ramas. Para SQL futuro, añadir scripts con nombre de módulo cuando varios integrantes trabajen a la vez y decidir el orden de ejecución antes de integrarlos en los archivos principales de `database/`.

| Integrante | Alcance pendiente |
| --- | --- |
| Juan José | CRUD de usuarios, tutores y mascotas; permisos por rol y propietario; registro y mantenimiento de cuentas. |
| Nicolas | Ficha clínica, atenciones, diagnósticos y tratamientos; procedimiento para registrar atención completa. |
| Arturo | Vacunas, planes, dosis, aplicación y consultas de vencimiento; procedimiento de vacunación. |
| Melissa | Veterinarios, citas, horarios y validación de disponibilidad. |
| Ignacio | Medicamentos, principios activos, alergias e inventario; trigger de alergias al recetar. |
| Anthony | Sedes, auditoría de diagnósticos y vista materializada de estadísticas. |

Convenciones: `snake_case` en SQL, nombres de dominio en archivos JS, consultas parametrizadas con `pg`, lógica de negocio en services. Migraciones o cambios al esquema deben revisarse en conjunto por las claves foráneas entre módulos.
