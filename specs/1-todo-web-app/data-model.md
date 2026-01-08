# Data Model: Todo Web Application

## Entities

### User
**Fields**:
- id: UUID (Primary Key, default: gen_random_uuid())
- email: VARCHAR (Unique, Not Null)
- password_hash: VARCHAR (Not Null)
- created_at: TIMESTAMP (Default: current_timestamp)
- updated_at: TIMESTAMP (Default: current_timestamp)

**Validation rules**:
- Email must be valid email format
- Email must be unique across all users
- Password must be properly hashed (not stored in plain text)

**Relationships**:
- One-to-Many: User has many Tasks (via user_id foreign key)

### Task
**Fields**:
- id: UUID (Primary Key, default: gen_random_uuid())
- user_id: UUID (Foreign Key to users.id, Not Null)
- title: VARCHAR (Not Null)
- description: TEXT (Optional)
- completed: BOOLEAN (Default: false)
- created_at: TIMESTAMP (Default: current_timestamp)
- updated_at: TIMESTAMP (Default: current_timestamp)

**Validation rules**:
- Title must not be empty
- User_id must reference an existing user
- Task can only be modified by the owning user

**State transitions**:
- created → active (initial state)
- active → completed (when marked complete)
- completed → active (when marked incomplete)

## Relationships

### User → Task (One-to-Many)
- A User can own zero or more Tasks
- Each Task belongs to exactly one User
- Foreign key constraint: tasks.user_id references users.id
- Cascade delete: When a User is deleted, all their Tasks are also deleted

## Indexes

### Users table
- Primary Index: id
- Unique Index: email
- Secondary Index: created_at

### Tasks table
- Primary Index: id
- Foreign Key Index: user_id (for efficient user-specific queries)
- Secondary Index: completed (for filtering completed/incomplete tasks)
- Secondary Index: created_at (for chronological sorting)

## Constraints

### Data integrity
- All NOT NULL constraints enforced at database level
- Foreign key relationships enforced with referential integrity
- Unique constraints on email field to prevent duplicate accounts

### Security
- No direct access to other users' data possible through database constraints
- All data access must go through authenticated API endpoints that verify user ownership