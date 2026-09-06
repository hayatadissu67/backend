DROP DATABASE IF EXISTS pmo_db;
CREATE DATABASE pmo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pmo_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    roleId CHAR(36),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    avatar VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (roleId) REFERENCES roles(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE portfolios (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    managerId CHAR(36),
    status ENUM('active', 'inactive', 'completed') NOT NULL DEFAULT 'active',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_portfolios_manager
        FOREIGN KEY (managerId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'DELAYED')
        NOT NULL DEFAULT 'PLANNING',
    managerId CHAR(36),
    startDate DATE,
    endDate DATE,
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_manager
        FOREIGN KEY (managerId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('public', 'private') NOT NULL DEFAULT 'public',
    projectId CHAR(36),
    createdBy CHAR(36),

    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rooms_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_rooms_creator
        FOREIGN KEY (createdBy) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY,
    roomId CHAR(36) NOT NULL,
    senderId CHAR(36),
    content TEXT NOT NULL,
    replyTo CHAR(36),
    forwardedFrom CHAR(36),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_room
        FOREIGN KEY (roomId) REFERENCES rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (senderId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_messages_reply
        FOREIGN KEY (replyTo) REFERENCES messages(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_messages_forwarded
        FOREIGN KEY (forwardedFrom) REFERENCES messages(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reactions (
    id CHAR(36) PRIMARY KEY,
    messageId CHAR(36) NOT NULL,
    userId CHAR(36),
    emoji VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_message_user_emoji (messageId, userId, emoji),

    CONSTRAINT fk_reactions_message
        FOREIGN KEY (messageId) REFERENCES messages(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_reactions_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tasks (
    id CHAR(36) PRIMARY KEY,
    projectId CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignedTo CHAR(36),
    status ENUM('TO_DO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED')
        NOT NULL DEFAULT 'TO_DO',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        NOT NULL DEFAULT 'MEDIUM',
    dueDate DATE,
    progress INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_tasks_progress
        CHECK (progress BETWEEN 0 AND 100),

    CONSTRAINT fk_tasks_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_tasks_assignee
        FOREIGN KEY (assignedTo) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE risks (
    id CHAR(36) PRIMARY KEY,
    projectId CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        NOT NULL DEFAULT 'MEDIUM',
    probability ENUM('LOW', 'MEDIUM', 'HIGH')
        NOT NULL DEFAULT 'MEDIUM',
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
        NOT NULL DEFAULT 'MEDIUM',
    ownerId CHAR(36),
    mitigation TEXT,
    status ENUM('IDENTIFIED', 'MITIGATED', 'RESOLVED', 'ACCEPTED')
        NOT NULL DEFAULT 'IDENTIFIED',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_risks_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_risks_owner
        FOREIGN KEY (ownerId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    userId CHAR(36),
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    referenceId CHAR(36),
    referenceType VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE change_requests (
    id CHAR(36) PRIMARY KEY,
    projectId CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requesterId CHAR(36),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
        NOT NULL DEFAULT 'PENDING',
    approverId CHAR(36),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_change_requests_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_change_requests_requester
        FOREIGN KEY (requesterId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_change_requests_approver
        FOREIGN KEY (approverId) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE documents (
    id CHAR(36) PRIMARY KEY,
    projectId CHAR(36),
    title VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    uploadedBy CHAR(36),
    approvedBy CHAR(36),
    status ENUM('PENDING', 'APPROVED', 'REJECTED')
        NOT NULL DEFAULT 'PENDING',
    version VARCHAR(255) NOT NULL DEFAULT '1.0',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_documents_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_documents_uploader
        FOREIGN KEY (uploadedBy) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_documents_approver
        FOREIGN KEY (approvedBy) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE templates (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    phase VARCHAR(255),
    createdBy CHAR(36),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_templates_creator
        FOREIGN KEY (createdBy) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE budgets (
    id CHAR(36) PRIMARY KEY,
    projectId CHAR(36),
    category VARCHAR(255) NOT NULL,
    allocated DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    spent DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    remaining DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_budgets_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reports (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    generatedBy CHAR(36),
    projectId CHAR(36),
    data JSON,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_generator
        FOREIGN KEY (generatedBy) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_reports_project
        FOREIGN KEY (projectId) REFERENCES projects(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles
    (id, code, name, description)
VALUES
    ('11111111-1111-1111-1111-111111111111',
     'ADMIN', 'Admin', 'System administrator'),

    ('22222222-2222-2222-2222-222222222222',
     'EXECUTIVE_MANAGER', 'Executive PM',
     'Executive project manager'),

    ('33333333-3333-3333-3333-333333333333',
     'PROJECT_MANAGER', 'PM', 'Project manager'),

    ('44444444-4444-4444-4444-444444444444',
     'DEVELOPER', 'Developer', 'Software developer'),

    ('55555555-5555-5555-5555-555555555555',
     'QA', 'QA', 'Quality assurance'),

    ('66666666-6666-6666-6666-666666666666',
     'INTERN', 'Intern', 'Intern user');

INSERT INTO users
    (id, email, password, name, roleId, status)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'admin@pmo.com',
     '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr5nFvZ5ZQ.Z5ZQ.Z5ZQ.Z5ZQ.Z5ZQ.',
     'Administrator',
     '11111111-1111-1111-1111-111111111111',
     'active');

INSERT INTO projects
    (id, name, code, description, status, managerId, startDate, endDate, budget)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     'Project Alpha',
     'ALPHA-001',
     'Sample project for development and testing.',
     'ACTIVE',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '2026-01-01',
     '2026-12-31',
     100000.00);

INSERT INTO rooms
    (id, name, type, projectId, createdBy)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     'General Chat',
     'public',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');