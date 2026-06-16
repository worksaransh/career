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
      assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          language: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          language?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          language?: string
          user_id?: string
        }
        Relationships: []
      }
      career_degree_links: {
        Row: {
          career_id: string
          degree_id: string
          notes: string | null
          requirement_level: string
        }
        Insert: {
          career_id: string
          degree_id: string
          notes?: string | null
          requirement_level?: string
        }
        Update: {
          career_id?: string
          degree_id?: string
          notes?: string | null
          requirement_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_degree_links_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_degree_links_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      career_learning_resources: {
        Row: {
          career_id: string
          display_order: number
          id: string
          is_free: boolean | null
          language_code: string
          provider: string | null
          resource_type: string
          title: string
          url: string
        }
        Insert: {
          career_id: string
          display_order?: number
          id?: string
          is_free?: boolean | null
          language_code?: string
          provider?: string | null
          resource_type: string
          title: string
          url: string
        }
        Update: {
          career_id?: string
          display_order?: number
          id?: string
          is_free?: boolean | null
          language_code?: string
          provider?: string | null
          resource_type?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_learning_resources_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_outlook_scores: {
        Row: {
          ai_disruption_risk: number
          assessed_at: string
          career_id: string
          entrepreneurship_potential: number
          future_demand_score: number
          methodology_version: string
          rationale: string | null
          remote_work_potential: number
          source_names: string[]
          updated_at: string
          work_life_balance_score: number
        }
        Insert: {
          ai_disruption_risk: number
          assessed_at: string
          career_id: string
          entrepreneurship_potential: number
          future_demand_score: number
          methodology_version: string
          rationale?: string | null
          remote_work_potential: number
          source_names?: string[]
          updated_at?: string
          work_life_balance_score: number
        }
        Update: {
          ai_disruption_risk?: number
          assessed_at?: string
          career_id?: string
          entrepreneurship_potential?: number
          future_demand_score?: number
          methodology_version?: string
          rationale?: string | null
          remote_work_potential?: number
          source_names?: string[]
          updated_at?: string
          work_life_balance_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "career_outlook_scores_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: true
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_relations: {
        Row: {
          career_id: string
          related_career_id: string
          relation_type: string
          similarity_score: number | null
        }
        Insert: {
          career_id: string
          related_career_id: string
          relation_type?: string
          similarity_score?: number | null
        }
        Update: {
          career_id?: string
          related_career_id?: string
          relation_type?: string
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "career_relations_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_relations_related_career_id_fkey"
            columns: ["related_career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_responsibilities: {
        Row: {
          career_id: string
          display_order: number
          id: string
          responsibility: string
        }
        Insert: {
          career_id: string
          display_order?: number
          id?: string
          responsibility: string
        }
        Update: {
          career_id?: string
          display_order?: number
          id?: string
          responsibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_responsibilities_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_salary_benchmarks: {
        Row: {
          annual_max: number
          annual_median: number
          annual_min: number
          as_of_year: number
          career_id: string
          career_stage: string
          confidence: number
          currency_code: string
          id: string
          market_code: string
          market_name: string
          salary_unit: string
          source_name: string
          source_url: string | null
        }
        Insert: {
          annual_max: number
          annual_median: number
          annual_min: number
          as_of_year: number
          career_id: string
          career_stage: string
          confidence?: number
          currency_code: string
          id?: string
          market_code: string
          market_name: string
          salary_unit?: string
          source_name: string
          source_url?: string | null
        }
        Update: {
          annual_max?: number
          annual_median?: number
          annual_min?: number
          as_of_year?: number
          career_id?: string
          career_stage?: string
          confidence?: number
          currency_code?: string
          id?: string
          market_code?: string
          market_name?: string
          salary_unit?: string
          source_name?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_salary_benchmarks_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_taxonomy_links: {
        Row: {
          career_id: string
          display_order: number
          notes: string | null
          relevance: number
          requirement_level: string | null
          term_id: string
        }
        Insert: {
          career_id: string
          display_order?: number
          notes?: string | null
          relevance?: number
          requirement_level?: string | null
          term_id: string
        }
        Update: {
          career_id?: string
          display_order?: number
          notes?: string | null
          relevance?: number
          requirement_level?: string | null
          term_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_taxonomy_links_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_taxonomy_links_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "career_taxonomy_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      career_taxonomy_terms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          provider: string | null
          slug: string
          term_type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          provider?: string | null
          slug: string
          term_type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          provider?: string | null
          slug?: string
          term_type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      careers: {
        Row: {
          ai_risk: string | null
          alternatives: string[] | null
          canonical_name: string
          career_code: string
          category: string | null
          certifications: string[] | null
          created_at: string
          data_version: string
          day_to_day_summary: string | null
          degrees_accepted: string[] | null
          demand_index: number | null
          description: string | null
          emoji: string
          future_demand: string | null
          growth_rate: number | null
          id: string
          is_published: boolean
          last_reviewed_at: string | null
          personality_fit: string | null
          remote_opportunities: string | null
          required_education: string | null
          salary_entry: number | null
          salary_mid: number | null
          salary_senior: number | null
          skills_required: string[] | null
          source_reference: string | null
          source_system: string
          tags: string[] | null
          title: string
          top_companies: string[] | null
          updated_at: string
        }
        Insert: {
          ai_risk?: string | null
          alternatives?: string[] | null
          canonical_name: string
          career_code: string
          category?: string | null
          certifications?: string[] | null
          created_at?: string
          data_version?: string
          day_to_day_summary?: string | null
          degrees_accepted?: string[] | null
          demand_index?: number | null
          description?: string | null
          emoji?: string
          future_demand?: string | null
          growth_rate?: number | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          personality_fit?: string | null
          remote_opportunities?: string | null
          required_education?: string | null
          salary_entry?: number | null
          salary_mid?: number | null
          salary_senior?: number | null
          skills_required?: string[] | null
          source_reference?: string | null
          source_system?: string
          tags?: string[] | null
          title: string
          top_companies?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_risk?: string | null
          alternatives?: string[] | null
          canonical_name?: string
          career_code?: string
          category?: string | null
          certifications?: string[] | null
          created_at?: string
          data_version?: string
          day_to_day_summary?: string | null
          degrees_accepted?: string[] | null
          demand_index?: number | null
          description?: string | null
          emoji?: string
          future_demand?: string | null
          growth_rate?: number | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          personality_fit?: string | null
          remote_opportunities?: string | null
          required_education?: string | null
          salary_entry?: number | null
          salary_mid?: number | null
          salary_senior?: number | null
          skills_required?: string[] | null
          source_reference?: string | null
          source_system?: string
          tags?: string[] | null
          title?: string
          top_companies?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      college_accreditations: {
        Row: {
          accreditation_body: string
          accreditation_name: string
          college_id: string
          created_at: string
          credential_url: string | null
          grade: string | null
          id: string
          source_reference: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          accreditation_body: string
          accreditation_name: string
          college_id: string
          created_at?: string
          credential_url?: string | null
          grade?: string | null
          id?: string
          source_reference?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          accreditation_body?: string
          accreditation_name?: string
          college_id?: string
          created_at?: string
          credential_url?: string | null
          grade?: string | null
          id?: string
          source_reference?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_accreditations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_degree_offerings: {
        Row: {
          annual_fee_inr: number | null
          application_url: string | null
          college_id: string
          course_name: string
          created_at: string
          degree_id: string
          duration_years: number | null
          eligibility_notes: string | null
          entrance_exams: string[]
          id: string
          is_active: boolean
          last_reviewed_at: string | null
          seats: number | null
          source_reference: string | null
          study_mode: string
          total_fee_inr: number | null
          updated_at: string
        }
        Insert: {
          annual_fee_inr?: number | null
          application_url?: string | null
          college_id: string
          course_name: string
          created_at?: string
          degree_id: string
          duration_years?: number | null
          eligibility_notes?: string | null
          entrance_exams?: string[]
          id?: string
          is_active?: boolean
          last_reviewed_at?: string | null
          seats?: number | null
          source_reference?: string | null
          study_mode?: string
          total_fee_inr?: number | null
          updated_at?: string
        }
        Update: {
          annual_fee_inr?: number | null
          application_url?: string | null
          college_id?: string
          course_name?: string
          created_at?: string
          degree_id?: string
          duration_years?: number | null
          eligibility_notes?: string | null
          entrance_exams?: string[]
          id?: string
          is_active?: boolean
          last_reviewed_at?: string | null
          seats?: number | null
          source_reference?: string | null
          study_mode?: string
          total_fee_inr?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_degree_offerings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_degree_offerings_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      college_placements: {
        Row: {
          average_package_inr: number | null
          college_id: string
          created_at: string
          degree_id: string | null
          highest_package_inr: number | null
          id: string
          median_package_inr: number | null
          placement_rate: number | null
          placement_year: number
          source_url: string | null
          students_placed: number | null
          top_recruiters: string[]
        }
        Insert: {
          average_package_inr?: number | null
          college_id: string
          created_at?: string
          degree_id?: string | null
          highest_package_inr?: number | null
          id?: string
          median_package_inr?: number | null
          placement_rate?: number | null
          placement_year: number
          source_url?: string | null
          students_placed?: number | null
          top_recruiters?: string[]
        }
        Update: {
          average_package_inr?: number | null
          college_id?: string
          created_at?: string
          degree_id?: string | null
          highest_package_inr?: number | null
          id?: string
          median_package_inr?: number | null
          placement_rate?: number | null
          placement_year?: number
          source_url?: string | null
          students_placed?: number | null
          top_recruiters?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "college_placements_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_placements_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      college_rankings: {
        Row: {
          college_id: string
          created_at: string
          id: string
          rank: number | null
          ranking_body: string
          ranking_category: string
          ranking_year: number
          score: number | null
          source_url: string | null
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          rank?: number | null
          ranking_body: string
          ranking_category?: string
          ranking_year: number
          score?: number | null
          source_url?: string | null
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          rank?: number | null
          ranking_body?: string
          ranking_category?: string
          ranking_year?: number
          score?: number | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_rankings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      college_scholarships: {
        Row: {
          application_url: string | null
          award_type: string
          award_value: number | null
          college_id: string
          created_at: string
          currency_code: string
          deadline: string | null
          eligibility: string
          id: string
          is_active: boolean
          name: string
          scholarship_code: string
          source_reference: string | null
          updated_at: string
        }
        Insert: {
          application_url?: string | null
          award_type: string
          award_value?: number | null
          college_id: string
          created_at?: string
          currency_code?: string
          deadline?: string | null
          eligibility: string
          id?: string
          is_active?: boolean
          name: string
          scholarship_code: string
          source_reference?: string | null
          updated_at?: string
        }
        Update: {
          application_url?: string | null
          award_type?: string
          award_value?: number | null
          college_id?: string
          created_at?: string
          currency_code?: string
          deadline?: string | null
          eligibility?: string
          id?: string
          is_active?: boolean
          name?: string
          scholarship_code?: string
          source_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_scholarships_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          avg_fees: number | null
          canonical_name: string
          city: string | null
          college_code: string
          country_code: string
          created_at: string
          data_version: string
          description: string | null
          id: string
          is_published: boolean
          last_reviewed_at: string | null
          name: string
          offered_degrees: string[] | null
          postal_code: string | null
          ranking: number | null
          source_reference: string | null
          source_system: string
          state: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avg_fees?: number | null
          canonical_name: string
          city?: string | null
          college_code: string
          country_code?: string
          created_at?: string
          data_version?: string
          description?: string | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          name: string
          offered_degrees?: string[] | null
          postal_code?: string | null
          ranking?: number | null
          source_reference?: string | null
          source_system?: string
          state?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avg_fees?: number | null
          canonical_name?: string
          city?: string | null
          college_code?: string
          country_code?: string
          created_at?: string
          data_version?: string
          description?: string | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          name?: string
          offered_degrees?: string[] | null
          postal_code?: string | null
          ranking?: number | null
          source_reference?: string | null
          source_system?: string
          state?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      counsellor_sessions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          scheduled_for: string
          status: string
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_for: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_for?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      degree_certification_links: {
        Row: {
          certification_id: string
          degree_id: string
          notes: string | null
          recommendation_level: string
          relevance: number
        }
        Insert: {
          certification_id: string
          degree_id: string
          notes?: string | null
          recommendation_level?: string
          relevance?: number
        }
        Update: {
          certification_id?: string
          degree_id?: string
          notes?: string | null
          recommendation_level?: string
          relevance?: number
        }
        Relationships: [
          {
            foreignKeyName: "degree_certification_links_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "education_certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "degree_certification_links_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: false
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      degree_outlook_metrics: {
        Row: {
          ai_disruption_risk: number
          assessed_at: string
          degree_id: string
          demand_score: number
          estimated_payback_months: number | null
          future_outlook_score: number
          methodology_version: string
          rationale: string | null
          roi_score: number
          source_names: string[]
          updated_at: string
        }
        Insert: {
          ai_disruption_risk: number
          assessed_at: string
          degree_id: string
          demand_score: number
          estimated_payback_months?: number | null
          future_outlook_score: number
          methodology_version: string
          rationale?: string | null
          roi_score: number
          source_names?: string[]
          updated_at?: string
        }
        Update: {
          ai_disruption_risk?: number
          assessed_at?: string
          degree_id?: string
          demand_score?: number
          estimated_payback_months?: number | null
          future_outlook_score?: number
          methodology_version?: string
          rationale?: string | null
          roi_score?: number
          source_names?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "degree_outlook_metrics_degree_id_fkey"
            columns: ["degree_id"]
            isOneToOne: true
            referencedRelation: "degrees"
            referencedColumns: ["id"]
          },
        ]
      }
      degrees: {
        Row: {
          avg_fees: number | null
          canonical_name: string
          career_tags: string[] | null
          created_at: string
          data_version: string
          degree_code: string
          description: string | null
          duration_years: number | null
          eligibility_summary: string | null
          fee_max_inr: number | null
          fee_min_inr: number | null
          id: string
          is_published: boolean
          last_reviewed_at: string | null
          level: string | null
          name: string
          short_name: string | null
          source_reference: string | null
          source_system: string
          stream: string | null
          updated_at: string
        }
        Insert: {
          avg_fees?: number | null
          canonical_name: string
          career_tags?: string[] | null
          created_at?: string
          data_version?: string
          degree_code: string
          description?: string | null
          duration_years?: number | null
          eligibility_summary?: string | null
          fee_max_inr?: number | null
          fee_min_inr?: number | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          level?: string | null
          name: string
          short_name?: string | null
          source_reference?: string | null
          source_system?: string
          stream?: string | null
          updated_at?: string
        }
        Update: {
          avg_fees?: number | null
          canonical_name?: string
          career_tags?: string[] | null
          created_at?: string
          data_version?: string
          degree_code?: string
          description?: string | null
          duration_years?: number | null
          eligibility_summary?: string | null
          fee_max_inr?: number | null
          fee_min_inr?: number | null
          id?: string
          is_published?: boolean
          last_reviewed_at?: string | null
          level?: string | null
          name?: string
          short_name?: string | null
          source_reference?: string | null
          source_system?: string
          stream?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      education_certifications: {
        Row: {
          certification_code: string
          created_at: string
          description: string | null
          id: string
          name: string
          provider: string | null
          updated_at: string
          validity_months: number | null
          website: string | null
        }
        Insert: {
          certification_code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          provider?: string | null
          updated_at?: string
          validity_months?: number | null
          website?: string | null
        }
        Update: {
          certification_code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          provider?: string | null
          updated_at?: string
          validity_months?: number | null
          website?: string | null
        }
        Relationships: []
      }
      email_drips: {
        Row: {
          created_at: string
          drip_type: string
          id: string
          payload: Json | null
          send_at: string
          sent_at: string | null
          status: string
          step: number
          user_id: string
        }
        Insert: {
          created_at?: string
          drip_type: string
          id?: string
          payload?: Json | null
          send_at: string
          sent_at?: string | null
          status?: string
          step?: number
          user_id: string
        }
        Update: {
          created_at?: string
          drip_type?: string
          id?: string
          payload?: Json | null
          send_at?: string
          sent_at?: string | null
          status?: string
          step?: number
          user_id?: string
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          id: string
          plan_id: string
          source_order_id: string | null
          tier: number
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          plan_id?: string
          source_order_id?: string | null
          tier?: number
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          plan_id?: string
          source_order_id?: string | null
          tier?: number
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_inr: number
          created_at: string
          discount_inr: number
          id: string
          idempotency_key: string | null
          mock_payment_method: string | null
          paid_at: string | null
          plan_id: string
          referral_code: string | null
          status: string
          trigger_source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          discount_inr?: number
          id?: string
          idempotency_key?: string | null
          mock_payment_method?: string | null
          paid_at?: string | null
          plan_id: string
          referral_code?: string | null
          status?: string
          trigger_source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          discount_inr?: number
          id?: string
          idempotency_key?: string | null
          mock_payment_method?: string | null
          paid_at?: string | null
          plan_id?: string
          referral_code?: string | null
          status?: string
          trigger_source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price_inr: number
          tagline: string | null
          tier: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id: string
          is_active?: boolean
          name: string
          price_inr: number
          tagline?: string | null
          tier: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_inr?: number
          tagline?: string | null
          tier?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          class_level: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string
          streak: number
          stream: string | null
          updated_at: string
          xp: number
        }
        Insert: {
          city?: string | null
          class_level?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          streak?: number
          stream?: string | null
          updated_at?: string
          xp?: number
        }
        Update: {
          city?: string | null
          class_level?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          streak?: number
          stream?: string | null
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          assessment_id: string | null
          careers: Json
          created_at: string
          id: string
          status: string
          summary: string | null
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          careers: Json
          created_at?: string
          id?: string
          status?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          careers?: Json
          created_at?: string
          id?: string
          status?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          credit_inr: number
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          credit_inr?: number
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          credit_inr?: number
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          career_title: string
          created_at: string
          id: string
          phases: Json
          user_id: string
        }
        Insert: {
          career_title: string
          created_at?: string
          id?: string
          phases: Json
          user_id: string
        }
        Update: {
          career_title?: string
          created_at?: string
          id?: string
          phases?: Json
          user_id?: string
        }
        Relationships: []
      }
      shared_reports: {
        Row: {
          created_at: string
          expires_at: string | null
          recommendation_id: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          recommendation_id?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          recommendation_id?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_reports_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          current_streak: number
          last_active_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upgrade_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          plan_id: string | null
          trigger_source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          trigger_source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          trigger_source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      export_career_catalog: { Args: { _career_code?: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      mock_complete_order: {
        Args: { _order_id: string }
        Returns: {
          amount_inr: number
          created_at: string
          discount_inr: number
          id: string
          idempotency_key: string | null
          mock_payment_method: string | null
          paid_at: string | null
          plan_id: string
          referral_code: string | null
          status: string
          trigger_source: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      validate_referral_code: {
        Args: { _code: string }
        Returns: {
          credit_inr: number
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
