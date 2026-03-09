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
      attendance_logs: {
        Row: {
          check_in_method: Database["public"]["Enums"]["checkin_method"]
          check_in_time: string
          gym_id: string
          id: string
          member_id: string
        }
        Insert: {
          check_in_method?: Database["public"]["Enums"]["checkin_method"]
          check_in_time?: string
          gym_id: string
          id?: string
          member_id: string
        }
        Update: {
          check_in_method?: Database["public"]["Enums"]["checkin_method"]
          check_in_time?: string
          gym_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      body_measurements: {
        Row: {
          chest_cm: number | null
          height_cm: number | null
          hips_cm: number | null
          id: string
          measured_at: string
          member_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          chest_cm?: number | null
          height_cm?: number | null
          hips_cm?: number | null
          id?: string
          measured_at?: string
          member_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          chest_cm?: number | null
          height_cm?: number | null
          hips_cm?: number | null
          id?: string
          measured_at?: string
          member_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          status: Database["public"]["Enums"]["gym_status"]
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan_type"]
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["gym_status"]
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_type"]
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["gym_status"]
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_type"]
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      member_workout_assignments: {
        Row: {
          assigned_at: string
          id: string
          member_id: string
          workout_plan_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          member_id: string
          workout_plan_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          member_id?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_workout_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_workout_assignments_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          expiry_date: string | null
          gym_id: string
          id: string
          join_date: string
          name: string
          notes: string | null
          phone: string
          photo_url: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["member_status"]
          trainer_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          gym_id: string
          id?: string
          join_date?: string
          name: string
          notes?: string | null
          phone: string
          photo_url?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          trainer_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          gym_id?: string
          id?: string
          join_date?: string
          name?: string
          notes?: string | null
          phone?: string
          photo_url?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          trainer_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          gym_id: string
          id: string
          is_active: boolean | null
          name: string
          price: number
          trainer_included: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          gym_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          trainer_included?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          gym_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          trainer_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          member_id: string | null
          message: string
          phone_number: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          member_id?: string | null
          message: string
          phone_number?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          member_id?: string | null
          message?: string
          phone_number?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          gym_id: string
          id: string
          member_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          gym_id: string
          id?: string
          member_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          gym_id?: string
          id?: string
          member_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          gym_id: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          expires_at?: string | null
          gym_id: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          expires_at?: string | null
          gym_id?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          message: string
          reply: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          message: string
          reply?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          message?: string
          reply?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          created_at: string
          email: string | null
          gym_id: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          schedule: string | null
          specialization: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          gym_id: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          schedule?: string | null
          specialization?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          gym_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          schedule?: string | null
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          category: Database["public"]["Enums"]["workout_category"]
          created_at: string
          created_by: string | null
          description: string | null
          exercises: Json | null
          gym_id: string
          id: string
          name: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["workout_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          exercises?: Json | null
          gym_id: string
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["workout_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          exercises?: Json | null
          gym_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_gym: { Args: { _gym_id: string }; Returns: boolean }
      owns_member: { Args: { _member_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "gym_owner" | "member"
      checkin_method: "qr" | "manual"
      gym_status: "pending" | "active" | "suspended" | "rejected"
      member_status: "active" | "expired" | "paused"
      notification_status: "pending" | "sent" | "failed"
      notification_type:
        | "expiry_reminder"
        | "payment_reminder"
        | "welcome"
        | "workout_assigned"
        | "attendance"
        | "announcement"
      payment_method: "cash" | "upi" | "card" | "other"
      payment_status: "paid" | "pending" | "partial"
      subscription_plan_type: "starter" | "pro" | "enterprise"
      subscription_status: "active" | "expired" | "cancelled"
      ticket_status: "open" | "in_progress" | "closed"
      workout_category: "weight_loss" | "muscle_gain" | "beginner" | "custom"
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
    Enums: {
      app_role: ["super_admin", "gym_owner", "member"],
      checkin_method: ["qr", "manual"],
      gym_status: ["pending", "active", "suspended", "rejected"],
      member_status: ["active", "expired", "paused"],
      notification_status: ["pending", "sent", "failed"],
      notification_type: [
        "expiry_reminder",
        "payment_reminder",
        "welcome",
        "workout_assigned",
        "attendance",
        "announcement",
      ],
      payment_method: ["cash", "upi", "card", "other"],
      payment_status: ["paid", "pending", "partial"],
      subscription_plan_type: ["starter", "pro", "enterprise"],
      subscription_status: ["active", "expired", "cancelled"],
      ticket_status: ["open", "in_progress", "closed"],
      workout_category: ["weight_loss", "muscle_gain", "beginner", "custom"],
    },
  },
} as const
