import { createClient } from '@/lib/supabase/client'

export interface DiseaseReport {
  id?: string
  seed_id?: string
  product_id?: string
  reporter_id?: string
  disease_detected: boolean
  severity: 'HEALTHY' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  disease_name: string
  confidence: number
  symptoms: string[]
  causative_agent: string
  germination_impact: string
  safe_to_plant: boolean
  treatment_steps: string[]
  prevention_measures: string[]
  detailed_analysis: string
  recommendations: string
  buyer_warning_show: boolean
  buyer_warning_message: string
  buyer_warning_severity: 'INFO' | 'WARNING' | 'DANGER'
  image_url: string
  image_size?: number
  image_type?: string
  seed_type?: string
  context?: string
  analyzed_at?: string
  created_at?: string
}

/**
 * Save disease analysis report to database
 */
export async function saveDiseaseReport(report: DiseaseReport) {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Add reporter_id
    const reportData = {
      ...report,
      reporter_id: user.id,
    }

    const { data, error } = await supabase
      .from('seed_disease_reports')
      .insert(reportData)
      .select()
      .single()

    if (error) throw error

    // If disease detected and severe, update seed/product warning flags
    if (report.disease_detected && ['SEVERE', 'CRITICAL'].includes(report.severity)) {
      if (report.seed_id) {
        await supabase
          .from('seeds')
          .update({
            disease_warning: true,
            disease_warning_message: report.buyer_warning_message,
            last_quality_check: new Date().toISOString()
          })
          .eq('id', report.seed_id)
      }

      if (report.product_id) {
        await supabase
          .from('marketplace_products')
          .update({
            disease_warning: true,
            disease_warning_message: report.buyer_warning_message,
            last_quality_check: new Date().toISOString()
          })
          .eq('id', report.product_id)
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error('Error saving disease report:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get disease reports for a specific seed
 */
export async function getSeedDiseaseReports(seedId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('seed_disease_reports_with_details')
      .select('*')
      .eq('seed_id', seedId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching seed disease reports:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get disease reports for a marketplace product
 */
export async function getProductDiseaseReports(productId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('seed_disease_reports_with_details')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching product disease reports:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get all disease reports (for admin dashboard)
 */
export async function getAllDiseaseReports(filters?: {
  diseaseDetected?: boolean
  severity?: string
  limit?: number
}) {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('seed_disease_reports_with_details')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.diseaseDetected !== undefined) {
      query = query.eq('disease_detected', filters.diseaseDetected)
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching all disease reports:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get disease reports by current user
 */
export async function getMyDiseaseReports() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('seed_disease_reports_with_details')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching my disease reports:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update disease report
 */
export async function updateDiseaseReport(reportId: string, updates: Partial<DiseaseReport>) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('seed_disease_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating disease report:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete disease report
 */
export async function deleteDiseaseReport(reportId: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('seed_disease_reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Error deleting disease report:', error)
    return { error: error.message }
  }
}

/**
 * Get disease statistics
 */
export async function getDiseaseStatistics() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('seed_disease_reports')
      .select('disease_detected, severity')

    if (error) throw error

    const stats = {
      total: data.length,
      diseaseDetected: data.filter(r => r.disease_detected).length,
      healthy: data.filter(r => r.severity === 'HEALTHY').length,
      mild: data.filter(r => r.severity === 'MILD').length,
      moderate: data.filter(r => r.severity === 'MODERATE').length,
      severe: data.filter(r => r.severity === 'SEVERE').length,
      critical: data.filter(r => r.severity === 'CRITICAL').length,
    }

    return { data: stats, error: null }
  } catch (error: any) {
    console.error('Error fetching disease statistics:', error)
    return { data: null, error: error.message }
  }
}
