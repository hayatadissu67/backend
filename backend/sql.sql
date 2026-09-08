-- Enterprise PMO database schema.
-- This script is safe to run repeatedly and matches the Sequelize models.

CREATE DATABASE IF NOT EXISTS pmo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE pmo;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS roles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  roleId CHAR(36) NULL,
  department VARCHAR(150) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Active',
  avatar VARCHAR(500) NULL,
  mustChangePassword TINYINT(1) NOT NULL DEFAULT 0,
  assignedProjectCodes JSON NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (roleId) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_users_role (roleId),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(150) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'DELAYED', 'PLANNING') NOT NULL DEFAULT 'PLANNING',
  health ENUM('GREEN', 'YELLOW', 'RED') NOT NULL DEFAULT 'GREEN',
  budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  spent DECIMAL(15,2) NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  gate VARCHAR(100) NULL,
  targetDate DATE NULL,
  startDate DATE NULL,
  description TEXT NULL,
  priority ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
  lifecycleStage VARCHAR(100) NULL,
  approvalStatus VARCHAR(50) NULL,
  approvedBy VARCHAR(255) NULL,
  rejectionReason TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_status (status),
  INDEX idx_projects_owner (owner),
  CONSTRAINT chk_projects_progress CHECK (progress BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_team (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  projectCode VARCHAR(255) NOT NULL,
  responsibility VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_team_member (userId, projectCode),
  CONSTRAINT fk_project_team_user FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_project_team_project (projectCode)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  targetProject VARCHAR(255) NOT NULL,
  assignee VARCHAR(255) NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  estimatedWorkHours INT NOT NULL,
  completionDeadline DATE NOT NULL,
  status ENUM('TO_DO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED') NOT NULL DEFAULT 'TO_DO',
  progress INT NOT NULL DEFAULT 0,
  description TEXT NULL,
  progressUpdatedAt DATETIME NULL,
  parentTaskId CHAR(36) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_parent FOREIGN KEY (parentTaskId) REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_tasks_project (targetProject),
  INDEX idx_tasks_assignee (assignee),
  INDEX idx_tasks_status (status),
  CONSTRAINT chk_tasks_progress CHECK (progress BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS risks (
  id CHAR(36) NOT NULL PRIMARY KEY,
  ref VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
  owner VARCHAR(255) NOT NULL,
  category ENUM('Risk', 'Issue') NOT NULL DEFAULT 'Risk',
  projectRef VARCHAR(100) NULL,
  status ENUM('OPEN', 'REPORTED', 'ESCALATED', 'IN_REVIEW', 'MITIGATED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
  assignedRiskManager VARCHAR(255) NULL,
  flaggedBy VARCHAR(255) NULL,
  submittedBy VARCHAR(255) NULL,
  milestoneRef VARCHAR(255) NULL,
  delegationNotes TEXT NULL,
  escalationNotes TEXT NULL,
  resolutionNotes TEXT NULL,
  resolvedBy INT NULL,
  resolvedByRole VARCHAR(100) NULL,
  delegatedAt DATETIME NULL,
  escalatedAt DATETIME NULL,
  resolvedAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_risks_resolver FOREIGN KEY (resolvedBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_risks_project (projectRef),
  INDEX idx_risks_status (status),
  INDEX idx_risks_severity (severity)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budgets (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_budgets_project (projectId),
  INDEX idx_budgets_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resources (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  projectId CHAR(36) NULL,
  userId INT NULL,
  type ENUM('ALLOCATION', 'ASSIGNMENT_REQUEST') NOT NULL DEFAULT 'ALLOCATION',
  employeeName VARCHAR(255) NULL,
  projectTarget VARCHAR(255) NULL,
  assignedTask VARCHAR(255) NULL,
  hoursPerWeek INT NOT NULL DEFAULT 40,
  pmRequesterName VARCHAR(255) NULL,
  requestedWorkEmail VARCHAR(255) NULL,
  department VARCHAR(150) NOT NULL,
  projectRoleTitle VARCHAR(255) NULL,
  businessJustification TEXT NULL,
  approvalComment TEXT NULL,
  rejectionComment TEXT NULL,
  status ENUM('ACTIVE', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resources_project FOREIGN KEY (projectId) REFERENCES projects(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_resources_user FOREIGN KEY (userId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_resources_project (projectId),
  INDEX idx_resources_user (userId),
  INDEX idx_resources_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS change_requests (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NULL,
  impactAnalysis TEXT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  requestedBy INT NULL,
  projectId VARCHAR(100) NULL,
  approvedBy INT NULL,
  approvedAt DATETIME NULL,
  rejectionReason TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_change_requests_requester FOREIGN KEY (requestedBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_change_requests_approver FOREIGN KEY (approvedBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_change_requests_status (status),
  INDEX idx_change_requests_project (projectId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'alert') NOT NULL DEFAULT 'info',
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  timestamp VARCHAR(50) NOT NULL DEFAULT 'Just now',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (userId, isRead),
  INDEX idx_notifications_created (createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_channels (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('channel', 'dm') NOT NULL DEFAULT 'channel',
  description VARCHAR(500) NULL,
  projectCode VARCHAR(50) NULL,
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_channels_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_communication_channels_type (type),
  INDEX idx_communication_channels_project (projectCode)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_messages (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  channelId VARCHAR(100) NOT NULL,
  senderId INT NOT NULL,
  sender VARCHAR(150) NOT NULL,
  senderRole VARCHAR(150) NULL,
  avatar VARCHAR(500) NULL,
  content TEXT NOT NULL,
  timestamp VARCHAR(50) NULL,
  isCodeSnippet TINYINT(1) NOT NULL DEFAULT 0,
  isVoiceNote TINYINT(1) NOT NULL DEFAULT 0,
  voiceDuration VARCHAR(20) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  isPinned TINYINT(1) NOT NULL DEFAULT 0,
  replyTo JSON NULL,
  reactions JSON NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_messages_channel FOREIGN KEY (channelId) REFERENCES communication_channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_communication_messages_sender FOREIGN KEY (senderId) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_communication_messages_channel_created (channelId, createdAt),
  INDEX idx_communication_messages_sender (senderId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_discussions (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  author VARCHAR(150) NOT NULL,
  role VARCHAR(150) NULL,
  avatar VARCHAR(500) NULL,
  content TEXT NOT NULL,
  timestamp VARCHAR(50) NULL,
  repliesCount INT NOT NULL DEFAULT 0,
  projectTag VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_discussions_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_communication_discussions_project (projectTag),
  INDEX idx_communication_discussions_created (createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_meetings (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(100) NULL,
  attendees JSON NULL,
  location VARCHAR(300) NULL,
  status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  agenda TEXT NULL,
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_meetings_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_communication_meetings_date (date),
  INDEX idx_communication_meetings_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS communication_documents (
  id VARCHAR(100) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NULL,
  size VARCHAR(50) NULL,
  date DATE NULL,
  author VARCHAR(150) NULL,
  projectCode VARCHAR(50) NULL,
  fileName VARCHAR(255) NULL,
  mimeType VARCHAR(150) NULL,
  fileData LONGBLOB NOT NULL,
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_communication_documents_creator FOREIGN KEY (createdBy) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_communication_documents_project (projectCode),
  INDEX idx_communication_documents_created (createdAt)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Portfolios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  budget DECIMAL(10,2) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Reports (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  format ENUM('PDF', 'Excel') NOT NULL,
  fileSize VARCHAR(100) NULL,
  generatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Templates (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  templateCode VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
  category VARCHAR(100) NOT NULL,
  description TEXT NULL,
  requiredSignOff VARCHAR(150) NOT NULL DEFAULT 'Executive Sponsor',
  requiredFields INT NOT NULL DEFAULT 2,
  fileUrl VARCHAR(500) NULL,
  fileName VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Roles are safe to seed repeatedly. Run seedRolesAndUsers.js after this script
-- to create the default accounts with bcrypt password hashes.
INSERT INTO roles (id, code, name, description)
VALUES
  (UUID(), 'EXECUTIVE_MANAGER', 'Executive Manager', 'Executive portfolio and governance access'),
  (UUID(), 'PROJECT_MANAGER', 'Project Manager', 'Project delivery and planning access'),
  (UUID(), 'RISK_MANAGER', 'Risk Manager', 'Risk and issue management access'),
  (UUID(), 'TEAM_MEMBER', 'Team Member', 'Assigned delivery and collaboration access')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
