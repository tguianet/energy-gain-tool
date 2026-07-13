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
          cidade: string | null
          consumo_medio_mensal: number
          cpf_cnpj: string
          created_at: string
          distribuidora: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          lead_id: string | null
          nome_completo: string
          observacoes: string | null
          status: string
          telefone: string
          tipo_cliente: string
          unidade_consumidora: string | null
          valor_medio_conta: number
        }
        Insert: {
          cidade?: string | null
          consumo_medio_mensal?: number
          cpf_cnpj: string
          created_at?: string
          distribuidora?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          lead_id?: string | null
          nome_completo: string
          observacoes?: string | null
          status?: string
          telefone: string
          tipo_cliente?: string
          unidade_consumidora?: string | null
          valor_medio_conta?: number
        }
        Update: {
          cidade?: string | null
          consumo_medio_mensal?: number
          cpf_cnpj?: string
          created_at?: string
          distribuidora?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          lead_id?: string | null
          nome_completo?: string
          observacoes?: string | null
          status?: string
          telefone?: string
          tipo_cliente?: string
          unidade_consumidora?: string | null
          valor_medio_conta?: number
        }
        Relationships: [
          {
            foreignKeyName: "clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_simulacao"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          id: number
          nome_empresa: string
          taxa_comissao: number
          taxa_desconto_padrao: number
          taxas_fixas_padrao: number
          updated_at: string
        }
        Insert: {
          id?: number
          nome_empresa?: string
          taxa_comissao?: number
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
          updated_at?: string
        }
        Update: {
          id?: number
          nome_empresa?: string
          taxa_comissao?: number
          taxa_desconto_padrao?: number
          taxas_fixas_padrao?: number
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
          cliente_id: string | null
          created_at: string
          data_adesao: string
          desconto_contratado: number
          distribuidora: string | null
          historico: Json | null
          id: string
          nome_cliente: string
          observacoes: string | null
          proposta_id: string | null
          status: string
          taxa_desconto: number
          valor_final: number
          valor_original: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_adesao?: string
          desconto_contratado: number
          distribuidora?: string | null
          historico?: Json | null
          id?: string
          nome_cliente: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string
          taxa_desconto: number
          valor_final: number
          valor_original: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_adesao?: string
          desconto_contratado?: number
          distribuidora?: string | null
          historico?: Json | null
          id?: string
          nome_cliente?: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string
          taxa_desconto?: number
          valor_final?: number
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          cidade: string
          cliente_id: string | null
          cpf_cnpj: string
          created_at: string
          email: string
          estado: string
          id: string
          nome_completo: string
          telefone: string
          tipo_cliente: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          cidade?: string
          cliente_id?: string | null
          cpf_cnpj?: string
          created_at?: string
          email?: string
          estado?: string
          id: string
          nome_completo: string
          telefone?: string
          tipo_cliente?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          cidade?: string
          cliente_id?: string | null
          cpf_cnpj?: string
          created_at?: string
          email?: string
          estado?: string
          id?: string
          nome_completo?: string
          telefone?: string
          tipo_cliente?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string | null
          created_at: string
          desconto_aplicado: number
          distribuidora: string | null
          economia_anual: number
          economia_mensal: number
          id: string
          nome_cliente: string
          resumo_comercial: string | null
          simulacao_id: string | null
          status: string
          taxa_desconto: number
          valor_atual: number
          valor_final: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          desconto_aplicado: number
          distribuidora?: string | null
          economia_anual: number
          economia_mensal: number
          id?: string
          nome_cliente: string
          resumo_comercial?: string | null
          simulacao_id?: string | null
          status?: string
          taxa_desconto: number
          valor_atual: number
          valor_final: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          desconto_aplicado?: number
          distribuidora?: string | null
          economia_anual?: number
          economia_mensal?: number
          id?: string
          nome_cliente?: string
          resumo_comercial?: string | null
          simulacao_id?: string | null
          status?: string
          taxa_desconto?: number
          valor_atual?: number
          valor_final?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_simulacao_id_fkey"
            columns: ["simulacao_id"]
            isOneToOne: false
            referencedRelation: "simulacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          base_desconto: number
          cliente_id: string | null
          codigo_solicitacao: string | null
          consumo_medio: number
          conta_energia_url: string | null
          created_at: string
          desconto_reais: number
          distribuidora: string | null
          economia_anual: number
          economia_mensal: number
          id: string
          nome_cliente: string
          percentual_economia: number
          status: string
          taxa_desconto: number
          taxas_fixas: number
          user_id: string | null
          valor_fatura: number
          valor_final: number
        }
        Insert: {
          base_desconto: number
          cliente_id?: string | null
          codigo_solicitacao?: string | null
          consumo_medio?: number
          conta_energia_url?: string | null
          created_at?: string
          desconto_reais: number
          distribuidora?: string | null
          economia_anual: number
          economia_mensal: number
          id?: string
          nome_cliente: string
          percentual_economia: number
          status?: string
          taxa_desconto: number
          taxas_fixas?: number
          user_id?: string | null
          valor_fatura: number
          valor_final: number
        }
        Update: {
          base_desconto?: number
          cliente_id?: string | null
          codigo_solicitacao?: string | null
          consumo_medio?: number
          conta_energia_url?: string | null
          created_at?: string
          desconto_reais?: number
          distribuidora?: string | null
          economia_anual?: number
          economia_mensal?: number
          id?: string
          nome_cliente?: string
          percentual_economia?: number
          status?: string
          taxa_desconto?: number
          taxas_fixas?: number
          user_id?: string | null
          valor_fatura?: number
          valor_final?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "user"
      status_cliente: "ativo" | "inativo" | "prospecto"
      status_contrato: "ativo" | "pendente" | "cancelado"
      status_proposta: "gerada" | "enviada" | "aceita" | "recusada"
      tipo_cliente: "residencial" | "comercial" | "rural"
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
      app_role: ["admin", "user"],
      status_cliente: ["ativo", "inativo", "prospecto"],
      status_contrato: ["ativo", "pendente", "cancelado"],
      status_proposta: ["gerada", "enviada", "aceita", "recusada"],
      tipo_cliente: ["residencial", "comercial", "rural"],
    },
  },
} as const
