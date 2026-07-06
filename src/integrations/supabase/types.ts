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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bradykinesia_data: {
        Row: {
          created_at: string
          id: string
          interval_consistency: number
          missed_taps: number
          patient_id: string
          reaction_time: number
          score: number
          tap_count: number
          tapping_speed: number
        }
        Insert: {
          created_at?: string
          id?: string
          interval_consistency?: number
          missed_taps?: number
          patient_id: string
          reaction_time: number
          score?: number
          tap_count: number
          tapping_speed: number
        }
        Update: {
          created_at?: string
          id?: string
          interval_consistency?: number
          missed_taps?: number
          patient_id?: string
          reaction_time?: number
          score?: number
          tap_count?: number
          tapping_speed?: number
        }
        Relationships: []
      }
      prediction_data: {
        Row: {
          bradykinesia_score: number
          confidence_percentage: number
          created_at: string
          id: string
          patient_id: string
          prediction_result: string
          rigidity_score: number
          severity: string
          summary: string | null
          tremor_score: number
          typing_score: number
        }
        Insert: {
          bradykinesia_score: number
          confidence_percentage: number
          created_at?: string
          id?: string
          patient_id: string
          prediction_result: string
          rigidity_score: number
          severity: string
          summary?: string | null
          tremor_score: number
          typing_score?: number
        }
        Update: {
          bradykinesia_score?: number
          confidence_percentage?: number
          created_at?: string
          id?: string
          patient_id?: string
          prediction_result?: string
          rigidity_score?: number
          severity?: string
          summary?: string | null
          tremor_score?: number
          typing_score?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          gender: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          gender?: string | null
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rigidity_data: {
        Row: {
          angular_velocity: number
          created_at: string
          id: string
          movement_score: number
          patient_id: string
          range_of_motion: number
          score: number
          smoothness: number
        }
        Insert: {
          angular_velocity: number
          created_at?: string
          id?: string
          movement_score: number
          patient_id: string
          range_of_motion: number
          score?: number
          smoothness?: number
        }
        Update: {
          angular_velocity?: number
          created_at?: string
          id?: string
          movement_score?: number
          patient_id?: string
          range_of_motion?: number
          score?: number
          smoothness?: number
        }
        Relationships: []
      }
      typing_data: {
        Row: {
          completion_time_ms: number
          created_at: string
          error_count: number
          error_rate: number
          id: string
          interval_consistency: number
          patient_id: string
          pause_count: number
          score: number
          wpm: number
        }
        Insert: {
          completion_time_ms: number
          created_at?: string
          error_count?: number
          error_rate?: number
          id?: string
          interval_consistency?: number
          patient_id: string
          pause_count?: number
          score?: number
          wpm: number
        }
        Update: {
          completion_time_ms?: number
          created_at?: string
          error_count?: number
          error_rate?: number
          id?: string
          interval_consistency?: number
          patient_id?: string
          pause_count?: number
          score?: number
          wpm?: number
        }
        Relationships: []
      }
      tremor_data: {
        Row: {
          angular_velocity_x: number
          angular_velocity_y: number
          angular_velocity_z: number
          created_at: string
          id: string
          motion_variability: number
          patient_id: string
          score: number
          tremor_amplitude: number
          tremor_frequency: number
        }
        Insert: {
          angular_velocity_x: number
          angular_velocity_y: number
          angular_velocity_z: number
          created_at?: string
          id?: string
          motion_variability?: number
          patient_id: string
          score?: number
          tremor_amplitude: number
          tremor_frequency: number
        }
        Update: {
          angular_velocity_x?: number
          angular_velocity_y?: number
          angular_velocity_z?: number
          created_at?: string
          id?: string
          motion_variability?: number
          patient_id?: string
          score?: number
          tremor_amplitude?: number
          tremor_frequency?: number
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
    ? DefaultSchema[DefaultSchemaEnumNameOrOptions]
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
    ? DefaultSchema[PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
