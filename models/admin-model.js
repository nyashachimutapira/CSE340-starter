const pool = require("../database/");

/**
 * Log admin activity
 */
async function logActivity(admin_id, action_type, target_type = null, target_id = null, description = null) {
  try {
    const sql = `
      INSERT INTO public.admin_activity (admin_id, action_type, target_type, target_id, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING activity_id, admin_id, action_type, target_type, target_id, description, created_at
    `;
    const values = [Number(admin_id), action_type, target_type || null, target_id || null, description || null];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
}

/**
 * Get all admin activities with pagination
 */
async function getAdminActivities(limit = 50, offset = 0) {
  const sql = `
    SELECT 
      aa.activity_id,
      aa.admin_id,
      a.account_firstname,
      a.account_lastname,
      aa.action_type,
      aa.target_type,
      aa.target_id,
      aa.description,
      aa.created_at
    FROM public.admin_activity aa
    JOIN public.account a ON aa.admin_id = a.account_id
    ORDER BY aa.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(sql, [limit, offset]);
  return result.rows;
}

/**
 * Get total account count
 */
async function getTotalAccounts() {
  const sql = `SELECT COUNT(*) as total FROM public.account`;
  const result = await pool.query(sql);
  return parseInt(result.rows[0].total);
}

/**
 * Get account count by type
 */
async function getAccountsByType() {
  const sql = `
    SELECT account_type, COUNT(*) as count
    FROM public.account
    GROUP BY account_type
    ORDER BY count DESC
  `;
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * Get new accounts in the last N days
 */
async function getNewAccountsTrend(days = 30) {
  const sql = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_accounts
    FROM public.account
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(sql, [days]);
  return result.rows;
}

/**
 * Get profile completion statistics
 */
async function getProfileCompletionStats() {
  const sql = `
    SELECT
      COUNT(DISTINCT a.account_id) as total_accounts,
      COUNT(DISTINCT CASE WHEN p.profile_id IS NOT NULL THEN a.account_id END) as profiles_created,
      COUNT(DISTINCT CASE WHEN p.bio IS NOT NULL AND p.bio != '' THEN a.account_id END) as with_bio,
      COUNT(DISTINCT CASE WHEN p.phone_number IS NOT NULL AND p.phone_number != '' THEN a.account_id END) as with_phone,
      COUNT(DISTINCT CASE WHEN p.address IS NOT NULL AND p.address != '' THEN a.account_id END) as with_address,
      COUNT(DISTINCT CASE WHEN p.profile_picture IS NOT NULL AND p.profile_picture != '' THEN a.account_id END) as with_picture
    FROM public.account a
    LEFT JOIN public.user_profile p ON a.account_id = p.account_id
  `;
  const result = await pool.query(sql);
  return result.rows[0];
}

/**
 * Get admin activity summary
 */
async function getActivitySummary(days = 30) {
  const sql = `
    SELECT
      action_type,
      COUNT(*) as count
    FROM public.admin_activity
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
    GROUP BY action_type
    ORDER BY count DESC
  `;
  const result = await pool.query(sql, [days]);
  return result.rows;
}

/**
 * Get activity count by date
 */
async function getActivityTrend(days = 30) {
  const sql = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as activity_count
    FROM public.admin_activity
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(sql, [days]);
  return result.rows;
}

module.exports = {
  logActivity,
  getAdminActivities,
  getTotalAccounts,
  getAccountsByType,
  getNewAccountsTrend,
  getProfileCompletionStats,
  getActivitySummary,
  getActivityTrend,
};
