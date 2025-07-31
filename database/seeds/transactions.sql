-- Insert sample transactions
-- These will reference the users created in users.sql
INSERT INTO transactions (user_id, amount, type, description, status) VALUES
-- John Doe transactions (user_id 1)
(1, 1000.00, 'credit', 'Initial deposit - Account opening', 'completed'),
(1, 50.25, 'debit', 'Coffee shop purchase - Starbucks', 'completed'),
(1, 25.99, 'debit', 'Subscription payment - Netflix', 'completed'),
(1, 2500.00, 'credit', 'Salary payment - Monthly salary', 'completed'),
(1, 125.75, 'debit', 'Grocery shopping - Whole Foods', 'completed'),

-- Jane Smith transactions (user_id 2)
(2, 2500.00, 'credit', 'Salary payment - Bi-weekly salary', 'completed'),
(2, 125.75, 'debit', 'Grocery shopping - Safeway', 'completed'),
(2, 85.50, 'debit', 'Utility bill - Electric company', 'completed'),
(2, 500.00, 'credit', 'Freelance payment - Web design', 'completed'),
(2, 45.99, 'debit', 'Online purchase - Amazon', 'pending'),

-- Alice Johnson transactions (user_id 3)
(3, 500.00, 'credit', 'Freelance payment - Logo design', 'completed'),
(3, 25.99, 'debit', 'Subscription payment - Spotify', 'completed'),
(3, 150.00, 'debit', 'Restaurant bill - Dinner with friends', 'completed'),
(3, 75.50, 'debit', 'Gas station - Shell', 'completed'),
(3, 1200.00, 'credit', 'Contract payment - Consulting work', 'pending'),

-- Bob Wilson transactions (user_id 4)
(4, 3000.00, 'credit', 'Salary payment - Monthly salary', 'completed'),
(4, 200.00, 'debit', 'ATM withdrawal', 'completed'),
(4, 89.99, 'debit', 'Software subscription - Adobe Creative', 'completed'),
(4, 45.00, 'debit', 'Parking fee - Downtown', 'failed'),

-- Carol Brown transactions (user_id 5)
(5, 1800.00, 'credit', 'Part-time salary - Bi-weekly', 'completed'),
(5, 65.99, 'debit', 'Gym membership - Monthly fee', 'completed'),
(5, 35.50, 'debit', 'Movie tickets - Cinema', 'completed'),
(5, 120.00, 'debit', 'Medical appointment - Dentist', 'pending'),

-- Demo User transactions (user_id 6)
(6, 100.00, 'credit', 'Demo account funding', 'completed'),
(6, 10.00, 'debit', 'Demo transaction - Test purchase', 'completed')

ON CONFLICT DO NOTHING;