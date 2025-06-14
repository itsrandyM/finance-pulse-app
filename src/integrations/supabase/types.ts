export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budget_items: {
        Row: {
          amount: number
          budget_id: string
          created_at: string | null
          deadline: string | null
          id: string
          is_continuous: boolean | null
          is_impulse: boolean | null
          is_recurring: boolean | null
          name: string
          note: string | null
          spent: number
          tag: string | null
        }
        Insert: {
          amount: number
          budget_id: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          is_continuous?: boolean | null
          is_impulse?: boolean | null
          is_recurring?: boolean | null
          name: string
          note?: string | null
          spent?: number
          tag?: string | null
        }
        Update: {
          amount?: number
          budget_id?: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          is_continuous?: boolean | null
          is_impulse?: boolean | null
          is_recurring?: boolean | null
          name?: string
          note?: string | null
          spent?: number
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_sub_items: {
        Row: {
          amount: number
          budget_item_id: string
          created_at: string | null
          id: string
          name: string
          note: string | null
          tag: string | null
        }
        Insert: {
          amount: number
          budget_item_id: string
          created_at?: string | null
          id?: string
          name: string
          note?: string | null
          tag?: string | null
        }
        Update: {
          amount?: number
          budget_item_id?: string
          created_at?: string | null
          id?: string
          name?: string
          note?: string | null
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_sub_items_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_end_date: string | null
          created_at: string | null
          id: string
          period: string
          status: Database["public"]["Enums"]["budget_status"] | null
          total_budget: number
          total_transactions: number | null
          user_id: string
          utilization_percentage: number | null
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string | null
          id?: string
          period: string
          status?: Database["public"]["Enums"]["budget_status"] | null
          total_budget: number
          total_transactions?: number | null
          user_id: string
          utilization_percentage?: number | null
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string | null
          id?: string
          period?: string
          status?: Database["public"]["Enums"]["budget_status"] | null
          total_budget?: number
          total_transactions?: number | null
          user_id?: string
          utilization_percentage?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          budget_item_id: string
          created_at: string | null
          id: string
          sub_item_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          budget_item_id: string
          created_at?: string | null
          id?: string
          sub_item_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          budget_item_id?: string
          created_at?: string | null
          id?: string
          sub_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_sub_item_id_fkey"
            columns: ["sub_item_id"]
            isOneToOne: false
            referencedRelation: "budget_sub_items"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          amount: number
          budget_period_start: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          amount: number
          budget_period_start: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_period_start?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          contact_info: string
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          contact_info: string
          created_at?: string
          full_name: string
          id?: string
        }
        Update: {
          contact_info?: string
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_budget_status: {
        Args: {
          p_budget_id: string
          p_period: string
          p_created_at: string
          p_total_budget: number
          p_total_spent: number
          p_total_transactions: number
        }
        Returns: Database["public"]["Enums"]["budget_status"]
      }
      update_budget_item_spent: {
        Args: { p_budget_item_id: string }
        Returns: undefined
      }
      update_budget_metrics: {
        Args: { p_budget_id: string }
        Returns: undefined
      }
    }
    Enums: {
      budget_status:
        | "active"
        | "completed"
        | "abandoned"
        | "overspent"
        | "interrupted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      budget_status: [
        "active",
        "completed",
        "abandoned",
        "overspent",
        "interrupted",
      ],
    },
  },
} as const
