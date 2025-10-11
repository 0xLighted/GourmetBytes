-- This SQL script sets up the necessary tables and functions for the Gourmet Bytes recipe database
-- Execute these statements in the Supabase SQL Editor

-- Table for marketplace recipes (shared publicly)
CREATE TABLE IF NOT EXISTS marketplace_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  publisher_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  cooking_time TEXT,
  difficulty TEXT,
  servings INTEGER,
  cuisine TEXT,
  tags TEXT[] DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user-saved recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  cooking_time TEXT,
  difficulty TEXT,
  servings INTEGER,
  cuisine TEXT,
  tags TEXT[] DEFAULT '{}',
  marketplace_id UUID REFERENCES marketplace_recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for recipe likes (many-to-many relationship)
CREATE TABLE IF NOT EXISTS recipe_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES marketplace_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Create a unique constraint to prevent multiple likes from same user
  UNIQUE(recipe_id, user_id)
);

-- Table for recipe comments
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES marketplace_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment recipe views
CREATE OR REPLACE FUNCTION increment_recipe_views(recipe_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_recipes
  SET views = views + 1
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(recipe_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_recipes
  SET comments_count = comments_count + 1
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(recipe_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_recipes
  SET comments_count = GREATEST(comments_count - 1, 0)  -- Prevent negative count
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment recipe likes
CREATE OR REPLACE FUNCTION increment_recipe_likes(recipe_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_recipes
  SET likes = likes + 1
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement recipe likes
CREATE OR REPLACE FUNCTION decrement_recipe_likes(recipe_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_recipes
  SET likes = GREATEST(likes - 1, 0)  -- Prevent negative likes
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row-level security policies
-- Saved recipes are visible only to the owner
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved recipes"
  ON saved_recipes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved recipes"
  ON saved_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes"
  ON saved_recipes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes"
  ON saved_recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Marketplace recipes are readable by anyone, but only modifiable by the owner
ALTER TABLE marketplace_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view marketplace recipes"
  ON marketplace_recipes
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create their own marketplace recipes"
  ON marketplace_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace recipes"
  ON marketplace_recipes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace recipes"
  ON marketplace_recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe likes policies
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any recipe_likes"
  ON recipe_likes
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create their own recipe_likes"
  ON recipe_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe_likes"
  ON recipe_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe comments policies
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipe comments"
  ON recipe_comments
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create their own recipe comments"
  ON recipe_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe comments"
  ON recipe_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe comments"
  ON recipe_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS saved_recipes_user_id_idx ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS saved_recipes_marketplace_id_idx ON saved_recipes(marketplace_id);
CREATE INDEX IF NOT EXISTS marketplace_recipes_user_id_idx ON marketplace_recipes(user_id);
CREATE INDEX IF NOT EXISTS marketplace_recipes_slug_idx ON marketplace_recipes(slug);
CREATE INDEX IF NOT EXISTS recipe_likes_recipe_id_idx ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_likes_user_id_idx ON recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS recipe_comments_recipe_id_idx ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_comments_user_id_idx ON recipe_comments(user_id); 