# Setup de Supabase para DessaTech

## Paso 1: Ejecutar la Migration

Tienes dos opciones para ejecutar la migration inicial:

### Opción A: Desde la interfaz web de Supabase (Recomendado)

1. Ve a https://supabase.com/dashboard/project/qspfugnrkmmnihiztojs/sql/new
2. Copia y pega el contenido del archivo `supabase/migrations/20250101000000_initial_schema.sql`
3. Click en "Run" para ejecutar la migration
4. Verifica que todas las tablas se crearon correctamente en la sección "Table Editor"

### Opción B: Desde la CLI (Requiere access token)

1. Ve a https://supabase.com/dashboard/account/tokens
2. Genera un nuevo access token
3. Exporta el token:
   ```bash
   export SUPABASE_ACCESS_TOKEN=tu-token-aqui
   ```
4. Conecta el proyecto:
   ```bash
   npx supabase link --project-ref qspfugnrkmmnihiztojs
   ```
5. Ejecuta las migrations:
   ```bash
   npx supabase db push
   ```

## Paso 2: Obtener el Service Role Key

1. Ve a https://supabase.com/dashboard/project/qspfugnrkmmnihiztojs/settings/api
2. Busca "service_role key" (⚠️ Nunca expongas esta key al cliente)
3. Copia la key y agrégala a tu archivo `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   ```

## Paso 3: Generar tipos TypeScript (Opcional pero recomendado)

Después de ejecutar las migrations, genera los tipos TypeScript actualizados:

```bash
npx supabase gen types typescript --project-id qspfugnrkmmnihiztojs > types/database.ts
```

## Paso 4: Verificar la configuración

Las siguientes tablas deberían existir en tu base de datos:

- ✅ `profiles` - Perfiles de profesionales
- ✅ `consultantes` - Consultantes/pacientes
- ✅ `sesiones` - Sesiones terapéuticas
- ✅ `citas` - Citas programadas
- ✅ `ai_interactions` - Auditoría de interacciones con IA

Todas las tablas tienen Row Level Security (RLS) habilitado con políticas para proteger los datos.

## Paso 5: Configurar Storage (Opcional - Para documentos)

1. Ve a https://supabase.com/dashboard/project/qspfugnrkmmnihiztojs/storage/buckets
2. Crea dos buckets:
   - `avatars` (público) - Para fotos de perfil
   - `documents` (privado) - Para documentos de consultantes
3. Configura las políticas de acceso según necesites

## Problemas comunes

### Error: "relation does not exist"
- Verifica que ejecutaste la migration correctamente
- Revisa los logs en Supabase Dashboard > Logs

### Error: "RLS policy violation"
- Asegúrate de estar autenticado
- Verifica que las políticas RLS estén configuradas correctamente

### No puedo insertar datos
- Verifica que el usuario esté autenticado
- Revisa que el `auth.uid()` coincida con el `profesional_id` o `id` según corresponda
