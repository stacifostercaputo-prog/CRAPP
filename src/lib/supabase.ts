import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Restroom = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  review_count: number;
  changing_table: boolean;
  accessible: boolean;
  single_stall: boolean;
  well_lit: boolean;
  stocked: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  restroom_id: string;
  user_id: string;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
};

export type UserProfile = {
  id: string;
  username: string;
  review_count: number;
  restroom_added_count: number;
  badge?: string;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  restroom_id: string;
  created_at: string;
};

export type UserPreferences = {
  user_id: string;
  notifications_enabled: boolean;
  location_tracking: boolean;
  dark_mode: boolean;
  distance_unit: string;
  updated_at: string;
};

export const db = {
  async getRestrooms() {
    const { data, error } = await supabase
      .from('restrooms')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data as Restroom[];
  },

  async createRestroom(restroom: Omit<Restroom, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('restrooms')
      .insert([restroom])
      .select()
      .single();

    if (error) throw error;
    return data as Restroom;
  },

  async getReviews(restroomId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('restroom_id', restroomId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as UserProfile | null;
  },

  async createUserProfile(profile: UserProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, restrooms(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addFavorite(userId: string, restroomId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, restroom_id: restroomId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFavorite(userId: string, restroomId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('restroom_id', restroomId);

    if (error) throw error;
  },

  async isFavorite(userId: string, restroomId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('restroom_id', restroomId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as UserPreferences | null;
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ user_id: userId, ...preferences, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data as UserPreferences;
  },

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, restrooms(name, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserRestrooms(userId: string) {
    const { data, error } = await supabase
      .from('restrooms')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Restroom[];
  },
};
