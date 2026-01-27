import supabase from './supabase'

export interface TurnData {
  id?: string
  numero: string | null
  estado: string | null
  tiempo_espera: number | null
  fecha_llamado: string | null
  fecha_creacion?: string | null
  categoria_nombre?: string | null
  categoria_tiempo?: number | null
  es_recuperado?: boolean | null
}

function normalizeEstado(estadoDb: string | null): string | null {
  if (!estadoDb) return null;
  return estadoDb.toLowerCase();
}

function extractCategoryData(row: any) {
  const cat = row.categoria ?? row.categorias ?? null;
  const data = Array.isArray(cat) ? cat[0] : cat;

  let minutos = 15;
  if (data?.tiempo_prom_seg) {
    minutos = Math.ceil(data.tiempo_prom_seg / 60);
  }
  return {
    nombre: data?.nombre ?? "Turno Regular",
    tiempo: minutos
  };
}

function calculateWaitTime(tiempoDbSeconds: number | null, categoriaMinutos: number): number {
  if (tiempoDbSeconds && tiempoDbSeconds > 0) {
    return Math.ceil(tiempoDbSeconds / 60);
  }
  return categoriaMinutos;
}

// --- FUNCIÓN PRINCIPAL ---
export async function getTurnByNumber(turnCode: string): Promise<TurnData | null> {
  try {
    console.log("🔍 Buscando turno:", turnCode);

    const { data, error } = await supabase
      .from('turno')
      .select(`*,es_recuperado,categoria:categoria_id ( nombre, tiempo_prom_seg )`)
      .eq('codigo', turnCode)
      .order('emitido_en', { ascending: false })
      .limit(1)
      .single();



    if (error) {
      console.error("❌ Error Supabase:", error);
      return null;
    }

    if (!data) {
      console.warn("⚠️ Turno no encontrado en BD.");
      return null; // Retorna null real para mostrar error en pantalla
    }

    const catData = extractCategoryData(data);
    const tiempoFinal = calculateWaitTime(data.tiempo_espera, catData.tiempo);

    return {
      id: data.id,
      numero: data.codigo,
      estado: normalizeEstado(data.estado),
      tiempo_espera: tiempoFinal,
      fecha_llamado: data.llamado_en,
      fecha_creacion: data.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
      es_recuperado: data.es_recuperado
    };
  } catch (err) {
    console.error('Crash en getTurnByNumber:', err);
    return null;
  }
}

// --- FUNCIONES SECUNDARIAS (Desactivadas para evitar datos falsos) ---

export async function getRandomTurn(): Promise<TurnData | null> {
  // CAMBIO IMPORTANTE: Devolvemos null siempre.
  // Así evitamos que el usuario vea un turno "random" si su QR falla.
  return null;
}

export async function getActiveTurn(): Promise<TurnData | null> {
  // Esta la dejamos activa por si la usas en alguna pantalla de TV
  try {
    const { data, error } = await supabase
      .from('turno')
      .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
      .eq('estado', 'llamado')
      .order('llamado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null;

    const catData = extractCategoryData(data);
    const tiempoFinal = calculateWaitTime(data.tiempo_espera, catData.tiempo);

    return {
      numero: data.codigo,
      estado: normalizeEstado(data.estado),
      tiempo_espera: tiempoFinal,
      fecha_llamado: data.llamado_en,
      fecha_creacion: data.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
      es_recuperado: data.es_recuperado ?? false
    }
  } catch (err) {
    return null;
  }
}

export async function getCurrentTurn(): Promise<string | null> {
  return null;
}

export default {
  getCurrentTurn,
  getActiveTurn,
  getRandomTurn,
  getTurnByNumber,
}