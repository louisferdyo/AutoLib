/*
  # Add Book Ratings Schema

  1. New Tables
    - `book_ratings`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)  
      - `rating` (integer, 1-5)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `book_ratings` table
    - Add policies for authenticated users to:
      - Read all ratings
      - Create ratings for themselves
      - Update their own ratings
*/

CREATE TABLE IF NOT EXISTS book_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, user_id)
);

ALTER TABLE book_ratings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all ratings
CREATE POLICY "Anyone can read book ratings"
  ON book_ratings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create their own ratings
CREATE POLICY "Users can create their own ratings"
  ON book_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON book_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);