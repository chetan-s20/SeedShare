// Database Types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'farmer' | 'gardener' | 'expert' | 'admin' | 'supplier'

export type SeedStatus = 'available' | 'pending' | 'exchanged' | 'sold_out'

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

export type TransactionType = 'seed_share' | 'seed_request' | 'purchase' | 'consultation'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          avatar_url: string | null
          bio: string | null
          points: number
          badges: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          avatar_url?: string | null
          bio?: string | null
          points?: number
          badges?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          avatar_url?: string | null
          bio?: string | null
          points?: number
          badges?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      seeds: {
        Row: {
          id: string
          owner_id: string
          variety: string
          common_name: string
          scientific_name: string | null
          origin: string
          harvest_year: number
          germination_rate: number | null
          purity: number | null
          treatment: string | null
          quantity: number
          unit: string
          description: string | null
          status: SeedStatus
          qr_code_url: string | null
          images: string[]
          is_organic: boolean
          is_heirloom: boolean
          category: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          variety: string
          common_name: string
          scientific_name?: string | null
          origin: string
          harvest_year: number
          germination_rate?: number | null
          purity?: number | null
          treatment?: string | null
          quantity: number
          unit?: string
          description?: string | null
          status?: SeedStatus
          qr_code_url?: string | null
          images?: string[]
          is_organic?: boolean
          is_heirloom?: boolean
          category: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          variety?: string
          common_name?: string
          scientific_name?: string | null
          origin?: string
          harvest_year?: number
          germination_rate?: number | null
          purity?: number | null
          treatment?: string | null
          quantity?: number
          unit?: string
          description?: string | null
          status?: SeedStatus
          qr_code_url?: string | null
          images?: string[]
          is_organic?: boolean
          is_heirloom?: boolean
          category?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_products: {
        Row: {
          id: string
          supplier_id: string
          name: string
          variety: string
          category: string
          description: string | null
          price: number
          quantity_available: number
          unit: string
          min_order_quantity: number
          max_order_quantity: number | null
          discount_percentage: number | null
          is_certified: boolean
          certification_number: string | null
          germination_rate: number | null
          purity: number | null
          images: string[]
          tags: string[]
          rating: number
          review_count: number
          is_subscription_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          name: string
          variety: string
          category: string
          description?: string | null
          price: number
          quantity_available: number
          unit?: string
          min_order_quantity?: number
          max_order_quantity?: number | null
          discount_percentage?: number | null
          is_certified?: boolean
          certification_number?: string | null
          germination_rate?: number | null
          purity?: number | null
          images?: string[]
          tags?: string[]
          rating?: number
          review_count?: number
          is_subscription_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          name?: string
          variety?: string
          category?: string
          description?: string | null
          price?: number
          quantity_available?: number
          unit?: string
          min_order_quantity?: number
          max_order_quantity?: number | null
          discount_percentage?: number | null
          is_certified?: boolean
          certification_number?: string | null
          germination_rate?: number | null
          purity?: number | null
          images?: string[]
          tags?: string[]
          rating?: number
          review_count?: number
          is_subscription_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          items: Json
          total_amount: number
          discount_amount: number
          tax_amount: number
          final_amount: number
          status: OrderStatus
          payment_id: string | null
          payment_status: string
          shipping_address: Json
          tracking_number: string | null
          carrier: string | null
          estimated_delivery: string | null
          delivered_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items: Json
          total_amount: number
          discount_amount?: number
          tax_amount?: number
          final_amount: number
          status?: OrderStatus
          payment_id?: string | null
          payment_status?: string
          shipping_address: Json
          tracking_number?: string | null
          carrier?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: Json
          total_amount?: number
          discount_amount?: number
          tax_amount?: number
          final_amount?: number
          status?: OrderStatus
          payment_id?: string | null
          payment_status?: string
          shipping_address?: Json
          tracking_number?: string | null
          carrier?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      seed_requests: {
        Row: {
          id: string
          requester_id: string
          seed_id: string
          quantity_requested: number
          message: string | null
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          response_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          seed_id: string
          quantity_requested: number
          message?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          response_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          seed_id?: string
          quantity_requested?: number
          message?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          response_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qa_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          category: string
          tags: string[]
          seed_id: string | null
          upvotes: number
          downvotes: number
          answer_count: number
          is_answered: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          category: string
          tags?: string[]
          seed_id?: string | null
          upvotes?: number
          downvotes?: number
          answer_count?: number
          is_answered?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          seed_id?: string | null
          upvotes?: number
          downvotes?: number
          answer_count?: number
          is_answered?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      qa_answers: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          upvotes: number
          is_accepted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          upvotes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          upvotes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          region: string
          state: string
          city: string | null
          avatar_url: string | null
          member_count: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          region: string
          state: string
          city?: string | null
          avatar_url?: string | null
          member_count?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          region?: string
          state?: string
          city?: string | null
          avatar_url?: string | null
          member_count?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          expert_id: string
          user_id: string
          title: string
          description: string
          scheduled_at: string
          duration_minutes: number
          price: number
          status: 'scheduled' | 'completed' | 'cancelled'
          meeting_link: string | null
          payment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expert_id: string
          user_id: string
          title: string
          description: string
          scheduled_at: string
          duration_minutes?: number
          price: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          meeting_link?: string | null
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expert_id?: string
          user_id?: string
          title?: string
          description?: string
          scheduled_at?: string
          duration_minutes?: number
          price?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          meeting_link?: string | null
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gamification: {
        Row: {
          id: string
          user_id: string
          action_type: string
          points_earned: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          points_earned: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          points_earned?: number
          description?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      seed_status: SeedStatus
      order_status: OrderStatus
    }
  }
}

// Convenient type exports
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Seed = Database['public']['Tables']['seeds']['Row'];
export type MarketplaceProduct = Database['public']['Tables']['marketplace_products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type SeedRequest = Database['public']['Tables']['seed_requests']['Row'];
export type QAPost = Database['public']['Tables']['qa_posts']['Row'];
export type QAAnswer = Database['public']['Tables']['qa_answers']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type GamificationRecord = Database['public']['Tables']['gamification']['Row'];
