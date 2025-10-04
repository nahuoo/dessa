export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          costo: number | null
          created_at: string
          id: string
          profesional_id: string
          prompt_hash: string
          tipo: string
          tokens_usados: number | null
        }
        Insert: {
          costo?: number | null
          created_at?: string
          id?: string
          profesional_id: string
          prompt_hash: string
          tipo: string
          tokens_usados?: number | null
        }
        Update: {
          costo?: number | null
          created_at?: string
          id?: string
          profesional_id?: string
          prompt_hash?: string
          tipo?: string
          tokens_usados?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_profesional_id_fkey"
            columns: ["profesional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      citas: {
        Row: {
          consultante_id: string
          created_at: string
          duracion: number
          estado: string | null
          fecha_hora: string
          id: string
          modalidad: string
          notas: string | null
          recordatorio_enviado: boolean | null
          updated_at: string
        }
        Insert: {
          consultante_id: string
          created_at?: string
          duracion: number
          estado?: string | null
          fecha_hora: string
          id?: string
          modalidad: string
          notas?: string | null
          recordatorio_enviado?: boolean | null
          updated_at?: string
        }
        Update: {
          consultante_id?: string
          created_at?: string
          duracion?: number
          estado?: string | null
          fecha_hora?: string
          id?: string
          modalidad?: string
          notas?: string | null
          recordatorio_enviado?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "citas_consultante_id_fkey"
            columns: ["consultante_id"]
            isOneToOne: false
            referencedRelation: "consultantes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultantes: {
        Row: {
          created_at: string
          email: string | null
          estado: string | null
          fecha_nacimiento: string | null
          id: string
          metadata: Json | null
          motivo_consulta: string | null
          nombre_completo: string
          objetivos_terapeuticos: Json | null
          profesional_id: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_consulta?: string | null
          nombre_completo: string
          objetivos_terapeuticos?: Json | null
          profesional_id: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          id?: string
          metadata?: Json | null
          motivo_consulta?: string | null
          nombre_completo?: string
          objetivos_terapeuticos?: Json | null
          profesional_id?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultantes_profesional_id_fkey"
            columns: ["profesional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          configuracion: Json | null
          created_at: string
          especialidad: string[] | null
          id: string
          nombre_completo: string
          numero_matricula: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          configuracion?: Json | null
          created_at?: string
          especialidad?: string[] | null
          id: string
          nombre_completo: string
          numero_matricula?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          configuracion?: Json | null
          created_at?: string
          especialidad?: string[] | null
          id?: string
          nombre_completo?: string
          numero_matricula?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sesiones: {
        Row: {
          consultante_id: string
          created_at: string
          duracion: number
          estado: string | null
          fecha: string
          id: string
          modalidad: string
          notas: string | null
          objetivos_trabajados: string[] | null
          proxima_sesion: string | null
          tareas_asignadas: string | null
          updated_at: string
        }
        Insert: {
          consultante_id: string
          created_at?: string
          duracion: number
          estado?: string | null
          fecha: string
          id?: string
          modalidad: string
          notas?: string | null
          objetivos_trabajados?: string[] | null
          proxima_sesion?: string | null
          tareas_asignadas?: string | null
          updated_at?: string
        }
        Update: {
          consultante_id?: string
          created_at?: string
          duracion?: number
          estado?: string | null
          fecha?: string
          id?: string
          modalidad?: string
          notas?: string | null
          objetivos_trabajados?: string[] | null
          proxima_sesion?: string | null
          tareas_asignadas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_consultante_id_fkey"
            columns: ["consultante_id"]
            isOneToOne: false
            referencedRelation: "consultantes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
