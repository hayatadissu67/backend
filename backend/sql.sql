-- Create and use the database
CREATE DATABASE IF NOT EXISTS pmo_database;
USE pmo_database;

-- Drop existing tables if re-running script
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS projects;

-- 1. Projects Table (Supports Project View)
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Planning', 'Active', 'On Hold', 'Completed') DEFAULT 'Planning',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Risks Table (Supports Risk View)
CREATE TABLE risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    risk_title VARCHAR(255) NOT NULL,
    description TEXT,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    likelihood ENUM('Low', 'Medium', 'High') NOT NULL,
    status ENUM('Identified', 'Mitigated', 'Resolved', 'Accepted') DEFAULT 'Identified',
    mitigation_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. Insert Sample Data for Testing
INSERT INTO projects (project_name, description, status, priority, start_date, end_date, budget) VALUES
('Executive Control Tower', 'Real-time portfolio intelligence and telemetry monitoring dashboard.', 'Active', 'High', '2026-01-10', '2026-12-31', 150000.00),
('Cloud Infrastructure Migration', 'Migrate legacy local server setups to cloud cluster environment.', 'Planning', 'Critical', '2026-03-01', '2026-09-30', 85000.00);

INSERT INTO risks (project_id, risk_title, description, severity, likelihood, status, mitigation_plan) VALUES
(1, 'API Latency Spikes', 'High volume telemetry traffic might cause slowdowns in real-time dashboard updates.', 'High', 'Medium', 'Identified', 'Implement Redis caching layer and optimize database indexing.'),
(2, 'Data Loss During Migration', 'Potential corruption of historical records during database transition.', 'Critical', 'Low', 'Mitigated', 'Perform weekly automated backups and run dry-run staging migrations.');