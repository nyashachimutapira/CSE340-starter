const pool = require("../database/");

/**
 * Get user profile by account ID
 */
async function getProfileByAccountId(account_id) {
  const sql = `
    SELECT profile_id, account_id, bio, phone_number, address, profile_picture, created_at, updated_at
    FROM public.user_profile
    WHERE account_id = $1
  `;
  const result = await pool.query(sql, [Number(account_id)]);
  return result.rows[0];
}

/**
 * Create a new user profile
 */
async function createProfile(account_id, bio, phone_number, address, profile_picture) {
  const sql = `
    INSERT INTO public.user_profile (account_id, bio, phone_number, address, profile_picture)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING profile_id, account_id, bio, phone_number, address, profile_picture, created_at, updated_at
  `;
  const values = [Number(account_id), bio || null, phone_number || null, address || null, profile_picture || null];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

/**
 * Update user profile
 */
async function updateProfile(account_id, bio, phone_number, address, profile_picture) {
  const sql = `
    UPDATE public.user_profile
    SET bio = $1, phone_number = $2, address = $3, profile_picture = $4, updated_at = CURRENT_TIMESTAMP
    WHERE account_id = $5
    RETURNING profile_id, account_id, bio, phone_number, address, profile_picture, created_at, updated_at
  `;
  const values = [bio || null, phone_number || null, address || null, profile_picture || null, Number(account_id)];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

/**
 * Initialize profile for new account
 */
async function initializeProfile(account_id) {
  try {
    const existingProfile = await getProfileByAccountId(account_id);
    if (existingProfile) {
      return existingProfile;
    }
    return await createProfile(account_id);
  } catch (error) {
    console.error("Profile initialization error:", error);
    throw error;
  }
}

/**
 * Get all users with profile data for admin reporting
 */
async function getAllUsersWithProfiles() {
  const sql = `
    SELECT 
      a.account_id,
      a.account_firstname,
      a.account_lastname,
      a.account_email,
      a.account_type,
      a.created_at as account_created_at,
      p.profile_id,
      p.bio,
      p.phone_number,
      p.address,
      p.profile_picture,
      p.created_at as profile_created_at,
      p.updated_at as profile_updated_at
    FROM public.account a
    LEFT JOIN public.user_profile p ON a.account_id = p.account_id
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = {
  getProfileByAccountId,
  createProfile,
  updateProfile,
  initializeProfile,
  getAllUsersWithProfiles,
};
