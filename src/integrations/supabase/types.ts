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
      clientes: {
        Row: {
          id: string
          nome_completo: string
          telefone: string
          email: string | null
          cpf_cnpj: string
          tipo_cliente: string
          distribuidora: string | null
          cidade: string | null
          estado: string | null
          endereco: string | null
          unidade_consumidora: string | null
          consumo_medio_mensal: number | null
          valor_medio_conta: number | null
          observacoes: string | null
          status: string
          lead_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          nome_completo: string
          telefone: string
          email?: string | null
          cpf_cnpj: string
          tipo_cliente?: string
          distribuidora?: string | null
          cidade?: string | null
          estado?: string | null
          endereco?: string | null
          unidade_consumidora?: string | null
          consumo_medio_mensal?: number | null
          valor_medio_conta?: number | null
          observacoes?: string | null
          status?: string
          lead_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          telefone?: string
          email?: string | null
          cpf_cnpj?: string
          tipo_cliente?: string
          distribuidora?: string | null
          cidade?: string | null
          estado?: string | null
          endereco?: string | null
          unidade_consumidora?: string | null
          consumo_medio_mensal?: number | null
          valor_medio_conta?: number | null
          observacoes?: string | null
          status?: string
          lead_id?: string | null
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          id: string
          user_id: string
          nome_empresa: string
          taxa_desconto_padrao: number
          taxas_fixas_padrao: number
          taxa_comissao: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome_empresa?: string
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
          taxa_comissao?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome_empresa?: string
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
          taxa_comissao?: number
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_publicas: {
        Row: {
          id: number
          taxa_desconto_padrao: number
          taxas_fixas_padrao: number
          updated_at: string
        }
        Insert: {
          id?: number
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
          updated_at?: string
        }
        Update: {
          id?: number
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
          updated_at?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          id: string
          cliente_id: string | null
          proposta_id: string | null
          nome_cliente: string
          distribuidora: string | null
          data_adesao: string
          status: string
          desconto_contratado: number
          taxa_desconto: number
          valor_original: number
          valor_final: number
          observacoes: string | null
          historico: Json
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          proposta_id?: string | null
          nome_cliente: string
          distribuidora?: string | null
          data_adesao?: string
          status?: string
          desconto_contratado: number
          taxa_desconto: number
          valor_original: number
          valor_final: number
          observacoes?: string | null
          historico?: Json
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          proposta_id?: string | null
          nome_cliente?: string
          distribuidora?: string | null
          data_adesao?: string
          status?: string
          desconto_contratado?: number
          taxa_desconto?: number
          valor_original?: number
          valor_final?: number
          observacoes?: string | null
          historico?: Json
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      leads_simulacao: {
        Row: {
          cidade: string | null
          consumo_medio: number | null
          cpf_cnpj: string
          created_at: string
          desconto_percentual: number
          distribuidora: string
          economia_anual: number
          economia_mensal: number
          email: string | null
          estado: string | null
          id: string
          nome: string
          status: string
          telefone: string
          tipo_cliente: string
          valor_fatura: number
          valor_final: number
        }
        Insert: {
          cidade?: string | null
          consumo_medio?: number | null
          cpf_cnpj: string
          created_at?: string
          desconto_percentual: number
          distribuidora: string
          economia_anual: number
          economia_mensal: number
          email?: string | null
          estado?: string | null
          id?: string
          nome: string
          status?: string
          telefone: string
          tipo_cliente?: string
          valor_fatura: number
          valor_final: number
        }
        Update: {
          cidade?: string | null
          consumo_medio?: number | null
          cpf_cnpj?: string
          created_at?: string
          desconto_percentual?: number
          distribuidora?: string
          economia_anual?: number
          economia_mensal?: number
          email?: string | null
          estado?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string
          tipo_cliente?: string
          valor_fatura?: number
          valor_final?: number
        }
        Relationships: []
      }
      propostas: {
        Row: {
          id: string
          simulacao_id: string | null
          cliente_id: string | null
          nome_cliente: string
          distribuidora: string | null
          valor_atual: number
          desconto_aplicado: number
          taxa_desconto: number
          economia_mensal: number
          economia_anual: number
          valor_final: number
          resumo_comercial: string | null
          status: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          simulacao_id?: string | null
          cliente_id?: string | null
          nome_cliente: string
          distribuidora?: string | null
          valor_atual: number
          desconto_aplicado: number
          taxa_desconto: number
          economia_mensal: number
          economia_anual: number
          valor_final: number
          resumo_comercial?: string | null
          status?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          simulacao_id?: string | null
          cliente_id?: string | null
          nome_cliente?: string
          distribuidora?: string | null
          valor_atual?: number
          desconto_aplicado?: number
          taxa_desconto?: number
          economia_mensal?: number
          economia_anual?: number
          valor_final?: number
          resumo_comercial?: string | null
          status?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      simulacoes: {
        Row: {
          id: string
          cliente_id: string | null
          nome_cliente: string
          distribuidora: string | null
          valor_fatura: number
          consumo_medio: number | null
          taxa_desconto: number
          taxas_fixas: number
          base_desconto: number
          desconto_reais: number
          valor_final: number
          economia_mensal: number
          economia_anual: number
          percentual_economia: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          nome_cliente: string
          distribuidora?: string | null
          valor_fatura: number
          consumo_medio?: number | null
          taxa_desconto: number
          taxas_fixas?: number
          base_desconto: number
          desconto_reais: number
          valor_final: number
          economia_mensal: number
          economia_anual: number
          percentual_economia: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          nome_cliente?: string
          distribuidora?: string | null
          valor_fatura?: number
          consumo_medio?: number | null
          taxa_desconto?: number
          taxas_fixas?: number
          base_desconto?: number
          desconto_reais?: number
          valor_final?: number
          economia_mensal?: number
          economia_anual?: number
          percentual_economia?: number
          user_id?: string
          created_at?: string
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
