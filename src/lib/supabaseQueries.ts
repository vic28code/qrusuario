import supabase from './supabase'

// Interfaz compatible con tu Frontend actual
export interface TurnData {
  id?: string
  numero: string | null        
  estado: string | null        
  tiempo_espera: number | null 
  fecha_llamado: string | null 
  fecha_creacion?: string | null 
  categoria_nombre?: string | null
  categoria_tiempo?: number | null
}

/**
 * Traduce los estados de tu nueva BD a los colores del semáforo
 */
function normalizeEstado(estadoDb: string | null): string | null {
  if (!estadoDb) return null;
  const e = estadoDb.toLowerCase();
  // Mapeo de estados
  if (e === 'llamado') return 'en_atencion';      // Rojo
  if (e === 'en_espera') return 'pendiente';      // Amarillo/Verde
  if (e === 'atendido') return 'completado';      // Gris/Finalizado
  if (e === 'perdido') return 'cancelado';
  return e;
}

/**
 * Extrae y CONVIERTE los datos de la categoría
 */
function extractCategoryData(row: any) {
  // Intentamos leer la relación 'categoria'
  const cat = row.categoria ?? row.categorias ?? null;
  const data = Array.isArray(cat) ? cat[0] : cat;
  
  // LÓGICA DE CONVERSIÓN DE TIEMPO:
  // Tu BD tiene 'tiempo_prom_seg' (segundos).
  // El frontend espera minutos.
  // Hacemos: segundos / 60 y redondeamos hacia arriba.
  let minutos = 15; // Valor por defecto
  
  if (data?.tiempo_prom_seg) {
    minutos = Math.ceil(data.tiempo_prom_seg / 60);
  } else if (data?.tiempo_estimado) {
    // Por si acaso alguna vez usas la columna vieja
    minutos = data.tiempo_estimado;
  }

  return {
    nombre: data?.nombre ?? "Turno Regular", 
    tiempo: minutos 
  };
}

/**
 * Obtiene un turno por su código (QR)
 */
export async function getTurnByNumber(turnCode: string): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno') 
      // CAMBIO: Pedimos 'tiempo_prom_seg' en lugar de 'tiempo_estimado'
      .select(`
        *,
        categoria:categoria_id ( nombre, tiempo_prom_seg ) 
      `)
      .eq('codigo', turnCode)
      .order('emitido_en', { ascending: false }) 
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const catData = extractCategoryData(data);

    return {
      id: data.id,
      numero: data.codigo,          
      estado: normalizeEstado(data.estado),
      tiempo_espera: data.tiempo_espera, // Si este campo en 'turno' también es segundos, avísame para dividirlo
      fecha_llamado: data.llamado_en, 
      fecha_creacion: data.emitido_en, 
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    };
  } catch (err) {
    console.error('getTurnByNumber error:', err);
    return null;
  }
}

/**
 * Obtiene turno aleatorio (para demos)
 */
export async function getRandomTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno')
      .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
      .order('emitido_en', { ascending: false })
      .limit(50)

    if (error) throw error
    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('No turnos')

    const rows = data as any[]
    const idx = Math.floor(Math.random() * rows.length)
    const row = rows[idx]
    const catData = extractCategoryData(row);

    return {
      numero: row.codigo,
      estado: normalizeEstado(row.estado),
      tiempo_espera: row.tiempo_espera,
      fecha_llamado: row.llamado_en,
      fecha_creacion: row.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    }
  } catch (err) {
    console.warn('getRandomTurn: fallo al leer DB', err)
    return { 
      numero: 'SAMPLE-100', 
      estado: 'pendiente', 
      tiempo_espera: 15, 
      fecha_llamado: null, 
      categoria_nombre: 'General' 
    };
  }
}

/**
 * Obtiene el turno activo en pantalla
 */
export async function getActiveTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno')
      .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
      .eq('estado', 'llamado') 
      .order('llamado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    let row: any = null

    if (!error && data) {
      row = data;
    } else {
      const res = await supabase
        .from('turno')
        .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
        .order('emitido_en', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (res.error || !res.data) return null
      row = res.data
    }

    const catData = extractCategoryData(row);

    return {
      numero: row.codigo,
      estado: normalizeEstado(row.estado),
      tiempo_espera: row.tiempo_espera,
      fecha_llamado: row.llamado_en,
      fecha_creacion: row.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    }
  } catch (err) {
    console.error('getActiveTurn error', err)
    return null;
  }
}

export async function getCurrentTurn(): Promise<string | null> {
  try {
    const active = await getActiveTurn()
    return active?.numero ?? null
  } catch (err) {
    return null
  }
}

export default {
  getCurrentTurn,
  getActiveTurn,
  getRandomTurn,
  getTurnByNumber,
}