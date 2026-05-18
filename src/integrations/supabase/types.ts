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
      email_drip_log: {
        Row: {
          brevo_message_id: string | null
          contact_email: string
          day_offset: number
          error: string | null
          id: number
          sent_at: string
          status: string
          template_id: number
        }
        Insert: {
          brevo_message_id?: string | null
          contact_email: string
          day_offset: number
          error?: string | null
          id?: number
          sent_at?: string
          status?: string
          template_id: number
        }
        Update: {
          brevo_message_id?: string | null
          contact_email?: string
          day_offset?: number
          error?: string | null
          id?: number
          sent_at?: string
          status?: string
          template_id?: number
        }
        Relationships: []
      }
      email_engagement_events: {
        Row: {
          contact_email: string
          event: string
          id: number
          link: string | null
          occurred_at: string
          raw: Json | null
          template_id: number | null
        }
        Insert: {
          contact_email: string
          event: string
          id?: number
          link?: string | null
          occurred_at?: string
          raw?: Json | null
          template_id?: number | null
        }
        Update: {
          contact_email?: string
          event?: string
          id?: number
          link?: string | null
          occurred_at?: string
          raw?: Json | null
          template_id?: number | null
        }
        Relationships: []
      }
      email_suppressions: {
        Row: {
          contact_email: string
          created_at: string
          id: number
          reason: string
          source: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: number
          reason?: string
          source?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: number
          reason?: string
          source?: string | null
        }
        Relationships: []
      }
      plan_events: {
        Row: {
          created_at: string
          event: string
          id: number
          ip_hash: string | null
          meta: Json | null
          share_token: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          ip_hash?: string | null
          meta?: Json | null
          share_token: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          ip_hash?: string | null
          meta?: Json | null
          share_token?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_events_share_token_fkey"
            columns: ["share_token"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["share_token"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          goal_label: string | null
          inputs: Json
          outputs: Json
          pdf_url: string | null
          share_token: string
          updated_at: string
          utm: Json | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          goal_label?: string | null
          inputs: Json
          outputs: Json
          pdf_url?: string | null
          share_token?: string
          updated_at?: string
          utm?: Json | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          goal_label?: string | null
          inputs?: Json
          outputs?: Json
          pdf_url?: string | null
          share_token?: string
          updated_at?: string
          utm?: Json | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          bucket: string
          hits?: number
          key: string
          window_start?: string
        }
        Update: {
          bucket?: string
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      email_lead_engagement: {
        Row: {
          clicks: number | null
          contact_email: string | null
          emails_sent: number | null
          last_event_at: string | null
          last_sent_at: string | null
          opens: number | null
          unique_templates: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      consume_rate_limit: {
        Args: {
          p_bucket: string
          p_key: string
          p_limit?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
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
