-- Kandilli Rasathanesi API - PostgreSQL Migration
-- Run this script to create the required schema and tables

-- Create schema
CREATE SCHEMA IF NOT EXISTS earthquake;

-- Earthquakes data table
CREATE TABLE IF NOT EXISTS earthquake.data_v2 (
    id SERIAL PRIMARY KEY,
    earthquake_id VARCHAR(50) UNIQUE NOT NULL,
    provider VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    date VARCHAR(50),
    mag DECIMAL(3,1),
    depth DECIMAL(6,2),
    geojson JSONB,
    location_properties JSONB,
    date_time TIMESTAMP NOT NULL,
    created_at BIGINT,
    rev INTEGER DEFAULT 0,
    
    CONSTRAINT chk_provider CHECK (provider IN ('kandilli', 'afad'))
);

-- Rate limiting requests table
CREATE TABLE IF NOT EXISTS earthquake.requests (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    created_at VARCHAR(20) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_v2_provider ON earthquake.data_v2(provider);
CREATE INDEX IF NOT EXISTS idx_data_v2_date_time ON earthquake.data_v2(date_time);
CREATE INDEX IF NOT EXISTS idx_data_v2_mag ON earthquake.data_v2(mag);
CREATE INDEX IF NOT EXISTS idx_data_v2_earthquake_id ON earthquake.data_v2(earthquake_id);
CREATE INDEX IF NOT EXISTS idx_data_v2_provider_date ON earthquake.data_v2(provider, date_time);

CREATE INDEX IF NOT EXISTS idx_requests_ip ON earthquake.requests(ip);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON earthquake.requests(created_at);

-- GIN index for JSONB columns (for location queries)
CREATE INDEX IF NOT EXISTS idx_data_v2_geojson ON earthquake.data_v2 USING GIN(geojson);
CREATE INDEX IF NOT EXISTS idx_data_v2_location ON earthquake.data_v2 USING GIN(location_properties);
