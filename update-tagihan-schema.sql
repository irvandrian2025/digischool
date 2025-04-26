-- Check if tahun column exists in tagihan table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tagihan' AND column_name = 'tahun'
  ) THEN
    -- Add tahun column if it doesn't exist
    ALTER TABLE tagihan ADD COLUMN tahun INTEGER;
    
    -- Update existing records with year from tanggal_jatuh_tempo
    UPDATE tagihan
    SET tahun = EXTRACT(YEAR FROM tanggal_jatuh_tempo);
  END IF;
END $$;
