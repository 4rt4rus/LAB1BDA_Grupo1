import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { api } from './services/api.js';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ListPage from './pages/ListPage.jsx';
import Login from './pages/Login.jsx';
import DisponibilidadPage from './pages/DisponibilidadPage.jsx';

function FichaActions({ row, reload, token, rol }) {
  const [planesVacunacion, setPlanesVacunacion] = useState([]);
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([]);

  useEffect(() => {
    if (row.abierta) {
      Promise.all([
        api('/planes-vacunacion', { token }),
        api('/medicamentos', { token })
      ])
        .then(([vacs, meds]) => {
          setPlanesVacunacion(vacs);
          setMedicamentosDisponibles(meds);
        })
        .catch(() => {});
    }
  }, [row.abierta, token]);

  const puedeEditar = (rol === 'Administrador' || rol === 'Veterinario');

  const editarFicha = async () => {
    const nuevoDiagnostico = window.prompt('Modificar diagnóstico:', row.diagnostico || '');
    if (nuevoDiagnostico === null) return;

    let nuevoTratamiento = row.tratamiento;
    let idVacuna = null;
    let numeroRefuerzo = 0;
    let medicamentos = [];
    let cantidades = [];

    if (row.abierta) {
      const promptTratamiento = window.prompt('Modificar tratamiento:', row.tratamiento || '');
      if (promptTratamiento === null) return;
      nuevoTratamiento = promptTratamiento;

      // Preguntar opcionalmente por medicamentos
      if (medicamentosDisponibles.length > 0) {
        const listaMeds = medicamentosDisponibles.map(m => `ID: ${m.id} - ${m.nombre_comercial} (${m.principio_activo})`).join('\n');
        const inputMed = window.prompt(`¿Desea recetar un medicamento?\nIngrese el ID del medicamento (o déjalo en blanco):\n\n${listaMeds}`);
        
        if (inputMed && inputMed.trim() !== '') {
          const medId = Number(inputMed.trim());
          medicamentos.push(medId);
          const inputCant = window.prompt('Ingrese la cantidad a recetar:', '1');
          cantidades.push(inputCant ? Number(inputCant.trim()) : 1);
        }
      }

      // Preguntar opcionalmente por vacuna
      if (planesVacunacion.length > 0) {
        const listaVacunas = planesVacunacion.map(v => `ID: ${v.id} - ${v.nombre_vacuna}`).join('\n');
        const inputVacuna = window.prompt(`¿Desea aplicar una vacuna al cerrar esta ficha?\nIngrese el ID de la vacuna (o déjalo en blanco):\n\n${listaVacunas}`);
        
        if (inputVacuna && inputVacuna.trim() !== '') {
          idVacuna = Number(inputVacuna.trim());
          const inputRef = window.prompt('Ingrese el número de refuerzo (ej. 0 para dosis única/inicial, 1 para el primer refuerzo):', '0');
          if (inputRef !== null) {
            numeroRefuerzo = Number(inputRef.trim());
          }
        }
      }
    }

    try {
      await api(`/fichas/${row.id}`, {
        method: 'PATCH',
        token,
        body: {
          diagnostico: nuevoDiagnostico.trim(),
          tratamiento: row.abierta ? nuevoTratamiento.trim() : row.tratamiento,
          medicamentos,
          cantidades,
          id_vacuna: idVacuna,
          numero_refuerzo: numeroRefuerzo
        }
      });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!puedeEditar) return <span>—</span>;

  return (
    <button onClick={editarFicha} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
      Editar Diagnóstico
    </button>
  );
}

function CitaForm({ reload, token }) {
  const [mascotas, setMascotas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState([]);
  const [planesVacunacion, setPlanesVacunacion] = useState([]);

  const [idMascota, setIdMascota] = useState('');
  const [idSede, setIdSede] = useState('');
  const [idVeterinario, setIdVeterinario] = useState('');
  const [tipoAtencion, setTipoAtencion] = useState('Sede');
  const [fechaHora, setFechaHora] = useState('');

  // Campos clínicos adicionales si la fecha es pasada
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [idMedicamento, setIdMedicamento] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [idVacuna, setIdVacuna] = useState('');
  const [numeroRefuerzo, setNumeroRefuerzo] = useState(0);

  const [saving, setSaving] = useState(false);

  // Detectar si la fecha ingresada es anterior a hoy
  const esFechaPasada = fechaHora && new Date(fechaHora) < new Date();

  useEffect(() => {
    Promise.all([
      api('/mascotas', { token }),
      api('/sedes', { token }),
      api('/veterinarios', { token }),
      api('/medicamentos', { token }),
      api('/planes-vacunacion', { token })
    ])
      .then(([m, s, v, med, vac]) => {
        setMascotas(m);
        setSedes(s);
        setVeterinarios(v);
        setMedicamentosDisponibles(med);
        setPlanesVacunacion(vac);
        if (m.length) setIdMascota(String(m[0].id));
        if (s.length) setIdSede(String(s[0].id));
        if (v.length) setIdVeterinario(String(v[0].id));
      })
      .catch(err => alert(err.message));
  }, [token]);

  const crearCita = async (e) => {
    e.preventDefault();
    if (!fechaHora) return;
    setSaving(true);
    try {
      await api('/citas', {
        method: 'POST',
        token,
        body: {
          id_mascota: Number(idMascota),
          id_sede: Number(idSede),
          id_veterinario: Number(idVeterinario),
          tipo_atencion: tipoAtencion,
          fecha_hora: fechaHora,
          diagnostico: esFechaPasada ? diagnostico : undefined,
          tratamiento: esFechaPasada ? tratamiento : undefined,
          medicamentos: esFechaPasada && idMedicamento ? [Number(idMedicamento)] : [],
          cantidades: esFechaPasada && idMedicamento ? [Number(cantidad)] : [],
          id_vacuna: esFechaPasada && idVacuna ? Number(idVacuna) : null,
          numero_refuerzo: esFechaPasada && idVacuna ? Number(numeroRefuerzo) : 0
        }
      });
      setFechaHora('');
      setDiagnostico('');
      setTratamiento('');
      setIdMedicamento('');
      setIdVacuna('');
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={crearCita} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
      <h3>Agregar Cita Médica (Futura o Pasada)</h3>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Mascota:</span>
          <select value={idMascota} onChange={e => setIdMascota(e.target.value)} required>
            {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Tutor: {m.tutor})</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Sede:</span>
          <select value={idSede} onChange={e => setIdSede(e.target.value)} required>
            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Veterinario:</span>
          <select value={idVeterinario} onChange={e => setIdVeterinario(e.target.value)} required>
            {veterinarios.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Tipo:</span>
          <select value={tipoAtencion} onChange={e => setTipoAtencion(e.target.value)}>
            <option value="Sede">Sede</option>
            <option value="Domicilio">Domicilio</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Fecha y Hora:</span>
          <input type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required />
        </label>
      </div>

      {/* Si la fecha es pasada, mostramos los campos para registrar la atención de inmediato */}
      {esFechaPasada && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>⚠️ La fecha es pasada: Se registrará como atención completada.</p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Diagnóstico:</span>
              <input type="text" value={diagnostico} onChange={e => setDiagnostico(e.target.value)} required={esFechaPasada} placeholder="Ej. Control sano o patología" />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Tratamiento:</span>
              <input type="text" value={tratamiento} onChange={e => setTratamiento(e.target.value)} required={esFechaPasada} placeholder="Ej. Reposo y cuidados" />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Recetar Medicamento (Opcional):</span>
              <select value={idMedicamento} onChange={e => setIdMedicamento(e.target.value)}>
                <option value="">-- Ninguno --</option>
                {medicamentosDisponibles.map(med => <option key={med.id} value={med.id}>{med.nombre_comercial} ({med.principio_activo})</option>)}
              </select>
            </label>

            {idMedicamento && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span>Cantidad:</span>
                <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={{ width: '80px' }} />
              </label>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Aplicar Vacuna (Opcional):</span>
              <select value={idVacuna} onChange={e => setIdVacuna(e.target.value)}>
                <option value="">-- Ninguna --</option>
                {planesVacunacion.map(vac => <option key={vac.id} value={vac.id}>{vac.nombre_vacuna} (Especie ID: {vac.id_especie})</option>)}
              </select>
            </label>

            {idVacuna && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span>Nro Refuerzo:</span>
                <input type="number" min="0" value={numeroRefuerzo} onChange={e => setNumeroRefuerzo(e.target.value)} style={{ width: '80px' }} />
              </label>
            )}
          </div>
        </div>
      )}

      <div>
        <button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Agregar Cita'}
        </button>
      </div>
    </form>
  );
}

function CitaActions({ row, reload, token, rol }) {
  // Solo permitir cancelar si la cita está Programada y el usuario es Admin o Veterinario
  const puedeCancelar = row.estado === 'Programada' && (rol === 'Administrador' || rol === 'Veterinario');

  const cancelarCita = async () => {
    if (!window.confirm(`¿Estás seguro de cancelar la cita de ${row.mascota}? Esto eliminará su ficha clínica abierta asociada.`)) return;
    try {
      await api(`/citas/${row.id}/estado`, {
        method: 'PATCH',
        token,
        body: { estado: 'Cancelada' }
      });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!puedeCancelar) return <span>—</span>;

  return (
    <button onClick={cancelarCita} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
      Cancelar Cita
    </button>
  );
}

function SedeForm({ reload, token }) {
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  const crearSede = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await api('/sedes', { method: 'POST', token, body: { nombre: nombre.trim() } });
      setNombre('');
      reload(); // Recarga la tabla para mostrar la nueva sede
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={crearSede} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Nombre de la nueva sede"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Creando...' : 'Crear Sede'}
      </button>
    </form>
  );
}

function SedeActions({ row, reload, token }) {
  const editar = async () => {
    const nuevoNombre = window.prompt('Editar nombre de la sede:', row.nombre);
    if (!nuevoNombre || nuevoNombre.trim() === '' || nuevoNombre === row.nombre) return;
    try {
      await api(`/sedes/${row.id}`, { method: 'PATCH', token, body: { nombre: nuevoNombre.trim() } });
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar la sede "${row.nombre}"?`)) return;
    try {
      await api(`/sedes/${row.id}`, { method: 'DELETE', token });
      reload();
    } catch (err) {
      alert(err.message); // Mostrará error si la sede tiene inventario, veterinarios o citas asociadas
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button onClick={editar}>Editar</button>
      <button onClick={eliminar} style={{ background: '#dc3545', color: 'white', border: 'none' }}>Eliminar</button>
    </div>
  );
}

function StockEditor({ row, reload, token }) {
  const [nuevoStock, setNuevoStock] = useState(row.stock_actual);
  const [saving, setSaving] = useState(false);

  const actualizarStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/inventario', {
        method: 'POST',
        token,
        body: {
          id_sede: row.id_sede,
          id_medicamento: row.id_medicamento,
          stock_actual: Number(nuevoStock),
        },
      });
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={actualizarStock} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="number"
        min="0"
        value={nuevoStock}
        onChange={(e) => setNuevoStock(e.target.value)}
        style={{ width: '75px', padding: '0.25rem' }}
        required
      />
      <button type="submit" disabled={saving || Number(nuevoStock) === row.stock_actual}>
        {saving ? '...' : 'Guardar'}
      </button>
    </form>
  );
}

const views = {
  mascotas: { 
    title: 'Mascotas', 
    endpoint: '/mascotas', 
    columns: [['nombre', 'Nombre'], ['especie', 'Especie'], ['tutor', 'Tutor']] 
  },
  citas: {
    title: 'Citas Médicas',
    endpoint: '/citas',
    columns: [
      ['mascota', 'Mascota'],
      ['sede', 'Sede'],
      ['veterinario', 'Veterinario'],
      ['tipo_atencion', 'Tipo de Atención'],
      ['fecha_hora', 'Fecha y Hora'],
      ['estado', 'Estado']
    ],
    topContent: (reload, session) => (
      (session.usuario.rol === 'Administrador' || session.usuario.rol === 'Veterinario') &&
      <CitaForm reload={reload} token={session.token} />
    ),
    renderActions: (row, reload, session) => (
      <CitaActions row={row} reload={reload} token={session.token} rol={session.usuario.rol} />
    )
  },
  veterinarios: { 
    title: 'Veterinarios', 
    endpoint: '/veterinarios', 
    columns: [['nombre', 'Nombre'], ['sede', 'Sede'], ['email', 'Correo']] 
  },
  sedes: { 
    title: 'Gestión de Sedes', 
    endpoint: '/sedes', 
    columns: [['nombre', 'Nombre de Sede']],
    topContent: (reload, session) => <SedeForm reload={reload} token={session.token} />,
    renderActions: (row, reload, session) => <SedeActions row={row} reload={reload} token={session.token} />
  },
  fichas: { 
    title: 'Fichas Clínicas', 
    endpoint: '/fichas', 
    columns: [
      ['mascota', 'Mascota'], 
      ['veterinario', 'Veterinario'], 
      ['diagnostico', 'Diagnóstico'], 
      ['tratamiento', 'Tratamiento'],
      ['abierta', 'Estado', (val) => (val ? 'Abierta' : 'Cerrada')]
    ],
    renderActions: (row, reload, session) => (
      <FichaActions row={row} reload={reload} token={session.token} rol={session.usuario.rol} />
    )
  },
  vacunaciones: { 
    title: 'Registros de Vacunación', 
    endpoint: '/vacunaciones', 
    filterConfig: {
      endpoint: '/vacunaciones/por-vencer',
      title: 'Vacunas Vencidas o Próximas a Vencer (30 días)',
      buttonLabel: 'Ver vencidas / próximas a vencer (30 días)',
      clearLabel: 'Ver todas las vacunas',
      roles: ['Administrador', 'Veterinario']
    },
    columns: [['mascota', 'Mascota'], ['nombre_vacuna', 'Vacuna'], ['numero_refuerzo', 'Refuerzo N°'], ['vencimiento_vacuna', 'Vencimiento', (val, row) => row.fecha_aplicacion == row.vencimiento_vacuna ? 'Permanente' : (val ?? '—')]] 
  },
  inventario: { 
    title: 'Inventario de Farmacia', 
    endpoint: '/inventario', 
    columns: [
      ['sede', 'Sede'], 
      ['nombre_comercial', 'Medicamento'], 
      ['principio_activo', 'Principio Activo'], 
      ['stock_actual', 'Stock Actual']
    ],
    renderActions: (row, reload, session) => (
      <StockEditor row={row} reload={reload} token={session.token} />
    )
  },
  auditoria: {
    title: 'Registro de Auditoría (Modificaciones en Fichas Cerradas)',
    endpoint: '/auditoria',
    columns: [
      ['id_ficha', 'ID Ficha'],
      ['mascota', 'Mascota'],
      ['diagnostico_anterior', 'Diagnóstico Anterior'],
      ['diagnostico_nuevo', 'Diagnóstico Nuevo'],
      ['id_usuario_modificador', 'ID Usuario Modificador'],
      ['fecha_modificacion', 'Fecha Modificación']
    ]
  },
  estadisticas: {
    title: 'Estadísticas de Atención - Últimos 12 Meses (Vista Materializada)',
    endpoint: '/estadisticas',
    columns: [
      ['nombre_sede', 'Sede'],
      ['especie', 'Especie'],
      ['cantidad_atenciones', 'Cantidad de Atenciones'],
      ['diagnostico_mas_frecuente', 'Diagnóstico Más Frecuente']
    ]
  }
};

export default function App() {
  const { session } = useAuth();
  const [page, setPage] = useState('inicio');
  // Cada vez que cambia la sesión (login/logout), vuelve a la pestaña de inicio
  useEffect(() => {
    setPage('inicio');
  }, [session]);

  if (!session) return <Login />;

  return (
    <Layout page={page} setPage={setPage}>
      {page === 'inicio' ? (
        <Dashboard />
      ) : page === 'disponibilidad' ? (
        <DisponibilidadPage />
      ) : (
        <ListPage {...views[page]} />
      )}
    </Layout>
  );
}