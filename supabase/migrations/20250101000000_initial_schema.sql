-- DessaTech - Schema Inicial
-- Migration creada: 2025-01-01

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tabla de Perfiles (extiende auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre_completo text not null,
  especialidad text[],
  numero_matricula text,
  telefono text,
  configuracion jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabla de Consultantes
create table if not exists public.consultantes (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid references public.profiles(id) on delete cascade not null,
  nombre_completo text not null, -- cifrado en app layer
  email text,
  telefono text,
  fecha_nacimiento date,
  motivo_consulta text, -- cifrado en app layer
  objetivos_terapeuticos jsonb default '[]'::jsonb,
  estado text default 'activo' check (estado in ('activo', 'inactivo', 'alta')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabla de Sesiones
create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  consultante_id uuid references public.consultantes(id) on delete cascade not null,
  fecha timestamptz not null,
  duracion int not null check (duracion > 0 and duracion <= 300),
  modalidad text not null check (modalidad in ('presencial', 'videollamada', 'telefónica')),
  notas text, -- cifrado en app layer
  objetivos_trabajados text[],
  tareas_asignadas text,
  proxima_sesion timestamptz,
  estado text default 'completada' check (estado in ('programada', 'completada', 'cancelada')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabla de Citas
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  consultante_id uuid references public.consultantes(id) on delete cascade not null,
  fecha_hora timestamptz not null,
  duracion int not null check (duracion > 0 and duracion <= 300),
  modalidad text not null check (modalidad in ('presencial', 'videollamada', 'telefónica')),
  estado text default 'pendiente' check (estado in ('confirmada', 'pendiente', 'cancelada')),
  notas text,
  recordatorio_enviado boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabla de Interacciones con IA (auditoría)
create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid references public.profiles(id) on delete cascade not null,
  tipo text not null, -- 'summary', 'suggestion', 'search', etc
  prompt_hash text not null, -- hash del prompt, no el contenido
  tokens_usados int,
  costo numeric(10,6),
  created_at timestamptz default now() not null
);

-- Índices para mejorar performance
create index if not exists idx_consultantes_profesional_id on public.consultantes(profesional_id);
create index if not exists idx_consultantes_estado on public.consultantes(estado);
create index if not exists idx_sesiones_consultante_id on public.sesiones(consultante_id);
create index if not exists idx_sesiones_fecha on public.sesiones(fecha);
create index if not exists idx_citas_consultante_id on public.citas(consultante_id);
create index if not exists idx_citas_fecha_hora on public.citas(fecha_hora);
create index if not exists idx_ai_interactions_profesional_id on public.ai_interactions(profesional_id);

-- Función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger consultantes_updated_at before update on public.consultantes
  for each row execute procedure public.handle_updated_at();

create trigger sesiones_updated_at before update on public.sesiones
  for each row execute procedure public.handle_updated_at();

create trigger citas_updated_at before update on public.citas
  for each row execute procedure public.handle_updated_at();

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.consultantes enable row level security;
alter table public.sesiones enable row level security;
alter table public.citas enable row level security;
alter table public.ai_interactions enable row level security;

-- Políticas RLS para Profiles
create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Políticas RLS para Consultantes
create policy "Los profesionales ven solo sus consultantes"
  on public.consultantes for select
  using (auth.uid() = profesional_id);

create policy "Los profesionales pueden crear consultantes"
  on public.consultantes for insert
  with check (auth.uid() = profesional_id);

create policy "Los profesionales pueden actualizar sus consultantes"
  on public.consultantes for update
  using (auth.uid() = profesional_id);

create policy "Los profesionales pueden eliminar sus consultantes"
  on public.consultantes for delete
  using (auth.uid() = profesional_id);

-- Políticas RLS para Sesiones
create policy "Los profesionales ven sesiones de sus consultantes"
  on public.sesiones for select
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = sesiones.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden crear sesiones de sus consultantes"
  on public.sesiones for insert
  with check (
    exists (
      select 1 from public.consultantes
      where consultantes.id = sesiones.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden actualizar sesiones de sus consultantes"
  on public.sesiones for update
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = sesiones.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden eliminar sesiones de sus consultantes"
  on public.sesiones for delete
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = sesiones.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

-- Políticas RLS para Citas
create policy "Los profesionales ven citas de sus consultantes"
  on public.citas for select
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = citas.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden crear citas de sus consultantes"
  on public.citas for insert
  with check (
    exists (
      select 1 from public.consultantes
      where consultantes.id = citas.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden actualizar citas de sus consultantes"
  on public.citas for update
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = citas.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

create policy "Los profesionales pueden eliminar citas de sus consultantes"
  on public.citas for delete
  using (
    exists (
      select 1 from public.consultantes
      where consultantes.id = citas.consultante_id
      and consultantes.profesional_id = auth.uid()
    )
  );

-- Políticas RLS para AI Interactions
create policy "Los profesionales ven solo sus interacciones con IA"
  on public.ai_interactions for select
  using (auth.uid() = profesional_id);

create policy "Los profesionales pueden crear interacciones con IA"
  on public.ai_interactions for insert
  with check (auth.uid() = profesional_id);

-- Función para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre_completo)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', 'Usuario'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para crear perfil al registrarse
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
