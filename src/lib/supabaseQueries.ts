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
}

function normalizeEstado(estadoDb: string | null): string | null {
  if (!estadoDb) return null;
  return estadoDb.toLowerCase(); 
}

function extractCategoryData(row: any) {
  // 1. SEGURIDAD: Verificamos si vino la info de la categoría
  // Supabase a veces la devuelve como 'categoria' (singular) o 'categorias' (plural)
  const cat = row.categoria ?? row.categorias ?? null;
  const data = Array.isArray(cat) ? cat[0] : cat;
  
  // Si no hay datos de categoría (null), devolvemos valores seguros para no romper la app
  if (!data) {
    return { nombre: "Atención General", tiempo: 15 };
  }

  // 2. LÓGICA DE TIEMPO (CATEGORÍA):
  // Tu tabla 'categoria' tiene 'tiempo_prom_seg' (SEGUNDOS).
  // Ejemplo SQL: 1200 seg -> 20 minutos.
  let minutos = 15; // Default

  if (data.tiempo_prom_seg) {
    minutos = Math.ceil(Number(data.tiempo_prom_seg) / 60);
  }

  return {
    nombre: data.nombre ?? "Turno Regular", 
    tiempo: minutos 
  };
}

export async function getTurnByNumber(turnCode: string): Promise<TurnData | null> {
  try {
    console.log("🔍 Buscando turno:", turnCode); // Log para depurar

    const { data, error } = await supabase
      .from('turno')
      // IMPORTANTE: Pedimos las columnas exactas de tus archivos SQL
      .select(`
        id, codigo, estado, tiempo_espera, emitido_en, llamado_en,
        categoria:categoria_id ( nombre, tiempo_prom_seg )
      `)
      .eq('codigo', turnCode)
      // Ordenamos por fecha de emisión descendente para tomar el más nuevo
      .order('emitido_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ Error Supabase:", error);
      throw error;
    }

    if (!data) {
      console.warn("⚠️ No se encontró el turno en la BD");
      return null;
    }

    // Extraemos datos de categoría de forma segura
    const catData = extractCategoryData(data);

    // 3. LÓGICA DE TIEMPO (TURNO):
    // Tu tabla 'turno' tiene 'tiempo_espera' (SEGUNDOS).
    // Ejemplo SQL: 120 seg -> 2 minutos.
    let tiempoEsperaFinal = catData.tiempo;

    if (data.tiempo_espera !== null && data.tiempo_espera !== undefined) {
        const segundos = Number(data.tiempo_espera);
        if (!isNaN(segundos) && segundos > 0) {
            tiempoEsperaFinal = Math.ceil(segundos / 60);
        }
    }

    return {
      id: data.id,
      numero: data.codigo,             // Columna 'codigo' en tu tabla turno
      estado: normalizeEstado(data.estado),
      tiempo_espera: tiempoEsperaFinal, // ¡Aquí ya va en MINUTOS!
      fecha_llamado: data.llamado_en,
      fecha_creacion: data.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    };

  } catch (err) {
    console.error('🔥 CRASH en getTurnByNumber:', err);
    return null;
  }
}

// Stubs para que no falle la importación si usas estas funciones en otro lado
export async function getRandomTurn() { return null; }
export async function getCurrentTurn() { return null; }
export async function getActiveTurn() { return null; }

export default { getTurnByNumber, getRandomTurn, getCurrentTurn, getActiveTurn }