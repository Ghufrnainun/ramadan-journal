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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_status: {
        Row: {
          created_at: string | null
          date: string
          id: string
          intention: string | null
          mood: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          intention?: string | null
          mood?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          intention?: string | null
          mood?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_tracker: {
        Row: {
          created_at: string
          date: string
          id: string
          items: Json | null
          notes: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          items?: Json | null
          notes?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          items?: Json | null
          notes?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dhikr_sessions: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          preset_id: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          preset_id: string
          target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          preset_id?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fasting_log: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          display_name: string | null
          focus_modules: string[] | null
          hide_streak: boolean | null
          id: string
          language: string | null
          onboarding_completed: boolean | null
          province: string | null
          ramadan_end_date: string | null
          ramadan_start_date: string | null
          reminders_iftar: boolean | null
          reminders_prayer: boolean | null
          reminders_reflection: boolean | null
          reminders_sahur: boolean | null
          setup_completed_at: string | null
          silent_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          display_name?: string | null
          focus_modules?: string[] | null
          hide_streak?: boolean | null
          id?: string
          language?: string | null
          onboarding_completed?: boolean | null
          province?: string | null
          ramadan_end_date?: string | null
          ramadan_start_date?: string | null
          reminders_iftar?: boolean | null
          reminders_prayer?: boolean | null
          reminders_reflection?: boolean | null
          reminders_sahur?: boolean | null
          setup_completed_at?: string | null
          silent_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          display_name?: string | null
          focus_modules?: string[] | null
          hide_streak?: boolean | null
          id?: string
          language?: string | null
          onboarding_completed?: boolean | null
          province?: string | null
          ramadan_end_date?: string | null
          ramadan_start_date?: string | null
          reminders_iftar?: boolean | null
          reminders_prayer?: boolean | null
          reminders_reflection?: boolean | null
          reminders_sahur?: boolean | null
          setup_completed_at?: string | null
          silent_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current: number | null
          goal_type: string
          id: string
          target: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current?: number | null
          goal_type: string
          id?: string
          target?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current?: number | null
          goal_type?: string
          id?: string
          target?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          ayah_number: number
          created_at: string
          daily_target_pages: number | null
          date: string
          id: string
          juz_number: number | null
          page_number: number | null
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number: number
          created_at?: string
          daily_target_pages?: number | null
          date?: string
          id?: string
          juz_number?: number | null
          page_number?: number | null
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number
          created_at?: string
          daily_target_pages?: number | null
          date?: string
          id?: string
          juz_number?: number | null
          page_number?: number | null
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          completed: boolean | null
          content: string | null
          created_at: string | null
          date: string
          id: string
          mood: string | null
          prompt_id: string
          prompt_text: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          content?: string | null
          created_at?: string | null
          date?: string
          id?: string
          mood?: string | null
          prompt_id: string
          prompt_text: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          content?: string | null
          created_at?: string | null
          date?: string
          id?: string
          mood?: string | null
          prompt_id?: string
          prompt_text?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sedekah_log: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tarawih_log: {
        Row: {
          created_at: string | null
          date: string
          id: string
          mosque_name: string | null
          rakaat_count: number | null
          tarawih_done: boolean | null
          updated_at: string | null
          user_id: string
          witir_done: boolean | null
          witir_rakaat: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          mosque_name?: string | null
          rakaat_count?: number | null
          tarawih_done?: boolean | null
          updated_at?: string | null
          user_id: string
          witir_done?: boolean | null
          witir_rakaat?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          mosque_name?: string | null
          rakaat_count?: number | null
          tarawih_done?: boolean | null
          updated_at?: string | null
          user_id?: string
          witir_done?: boolean | null
          witir_rakaat?: number | null
        }
        Relationships: []
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
