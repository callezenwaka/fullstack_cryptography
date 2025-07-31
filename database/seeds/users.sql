-- Insert sample users
-- Password hash is for 'password123' (bcrypt with salt rounds 10)
INSERT INTO users (username, email, first_name, last_name, password_hash) VALUES
('john_doe', 'john@example.com', 'John', 'Doe', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC'),
('jane_smith', 'jane@example.com', 'Jane', 'Smith', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC'),
('alice_johnson', 'alice@example.com', 'Alice', 'Johnson', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC'),
('bob_wilson', 'bob@example.com', 'Bob', 'Wilson', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC'),
('carol_brown', 'carol@example.com', 'Carol', 'Brown', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC')
ON CONFLICT (username) DO NOTHING;

-- Add comment
INSERT INTO users (username, email, first_name, last_name, password_hash) VALUES
('demo_user', 'demo@crypto.local', 'Demo', 'User', '$2b$10$rQZ9QmjOGfEj.4lVV7B8LeNlzP7S8qL8eQZ1oGx5QqOQP2H9K7WTC')
ON CONFLICT (username) DO NOTHING;