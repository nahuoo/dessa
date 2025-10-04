import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/encryption';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchTerm = query.toLowerCase().trim();

    // Buscar en consultantes
    const { data: consultantes } = await supabase
      .from('consultantes')
      .select('id, nombre_completo, email, estado')
      .eq('profesional_id', user.id)
      .limit(10);

    // Buscar en sesiones
    const { data: sesiones } = await supabase
      .from('sesiones')
      .select('id, fecha, notas, consultantes!inner(id, nombre_completo, profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .order('fecha', { ascending: false })
      .limit(20);

    const results: Array<{
      id: string;
      type: 'consultante' | 'sesion';
      title: string;
      subtitle?: string;
      url: string;
    }> = [];

    // Filtrar consultantes por nombre o email (descifrados)
    consultantes?.forEach((consultante) => {
      try {
        const nombreDescifrado = decrypt(consultante.nombre_completo).toLowerCase();
        const emailDescifrado = consultante.email ? decrypt(consultante.email).toLowerCase() : '';

        if (nombreDescifrado.includes(searchTerm) || emailDescifrado.includes(searchTerm)) {
          results.push({
            id: consultante.id,
            type: 'consultante',
            title: decrypt(consultante.nombre_completo),
            subtitle: consultante.email ? decrypt(consultante.email) : undefined,
            url: `/consultantes/${consultante.id}`,
          });
        }
      } catch (error) {
        // Skip if decryption fails
        console.error('Error decrypting consultante:', error);
      }
    });

    // Filtrar sesiones por notas (descifradas) o nombre de consultante
    sesiones?.forEach((sesion) => {
      try {
        const nombreConsultante = decrypt(sesion.consultantes.nombre_completo);
        const notasDescifradas = sesion.notas ? decrypt(sesion.notas).toLowerCase() : '';

        if (
          nombreConsultante.toLowerCase().includes(searchTerm) ||
          notasDescifradas.includes(searchTerm)
        ) {
          const fecha = new Date(sesion.fecha);
          results.push({
            id: sesion.id,
            type: 'sesion',
            title: `Sesión con ${nombreConsultante}`,
            subtitle: fecha.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            url: `/sesiones/${sesion.id}`,
          });
        }
      } catch (error) {
        // Skip if decryption fails
        console.error('Error decrypting sesion:', error);
      }
    });

    // Ordenar resultados: consultantes primero, luego sesiones
    results.sort((a, b) => {
      if (a.type === 'consultante' && b.type === 'sesion') return -1;
      if (a.type === 'sesion' && b.type === 'consultante') return 1;
      return 0;
    });

    // Limitar a 10 resultados
    const limitedResults = results.slice(0, 10);

    return NextResponse.json({ results: limitedResults });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 });
  }
}
