-- ============================================
-- Urban Harvest Hub - Seed Data
-- Sample data for testing and development
-- ============================================

-- ============================================
-- USERS DATA
-- ============================================

-- Admin User (password: admin123 - hashed with bcrypt)
-- Customer User (password: customer123 - hashed with bcrypt)
INSERT INTO users (email, password, name, role) VALUES 
('admin@urban.com', '$2b$10$m3qaU9/4ewO3ITB5rYRYS.PuAFbYUv67Kj4YPAv/7z.YPzo3m15Pq', 'Admin User', 'admin'),
('customer@example.com', '$2b$10$n9uNHFNxlv1trdKcW41oL.PZe0uY5TittL9Nd.S6u9T5Aj6GM.K82', 'John Doe', 'customer');

-- ============================================
-- INSTRUCTORS DATA
-- ============================================

INSERT INTO instructors (name, bio, image, email) VALUES
('Dr. Aravinda Silva', 'Expert agriculturalist with 20+ years of experience in organic farming and sustainable agriculture.', '/assets/instructors/instructor-1.jpg', 'aravinda@urban.com'),
('Malini Jayawardena', 'Passionate environmentalist and sustainability advocate specializing in urban gardening.', '/assets/instructors/instructor-2.jpg', 'malini@urban.com'),
('Rohan Fernando', 'Master craftsman and DIY expert teaching practical skills for sustainable living.', '/assets/instructors/instructor-3.jpg', 'rohan@urban.com');

-- ============================================
-- PRODUCTS DATA (Schema uses: product_id, name, price, category, short_description, description, image, rating, reviews_count, stock)
-- ============================================

INSERT INTO products (name, price, category, short_description, description, image, rating, reviews_count, stock) VALUES
('Organic Heirloom Tomatoes', 450.00, 'Fresh Produce', 'Juicy, sun-ripened heirloom tomatoes', 'Experience the authentic taste of locally grown organic heirloom tomatoes. Pesticide-free and harvested daily.', '/assets/products/product-1.jpg', 4.8, 124, 25),
('Fresh Organic Lettuce', 200.00, 'Fresh Produce', 'Crisp and fresh organic lettuce', 'Locally sourced organic lettuce, perfect for salads. Grown without chemicals.', '/assets/products/product-2.jpg', 4.6, 89, 40),
('Eco-Friendly Bamboo Toothbrush Set', 350.00, 'Lifestyle', 'Sustainable bamboo toothbrushes', 'Set of 4 biodegradable bamboo toothbrushes. Zero waste alternative to plastic.', '/assets/products/product-3.jpg', 4.9, 256, 100),
('Organic Carrot Bundle', 280.00, 'Fresh Produce', 'Sweet and crunchy organic carrots', 'Farm-fresh organic carrots, rich in beta-carotene. Perfect for juicing or cooking.', '/assets/products/product-4.jpg', 4.7, 67, 35),
('Heirloom Vegetable Seed Collection', 1200.00, 'Seeds', 'Premium heirloom seeds variety pack', 'Collection of 12 heirloom vegetable seed varieties. Non-GMO, open-pollinated seeds for your garden.', '/assets/products/product-5.jpg', 4.9, 143, 50),
('Reusable Beeswax Food Wraps', 550.00, 'Lifestyle', 'Eco-friendly food storage solution', 'Set of 5 organic cotton wraps infused with beeswax. Sustainable alternative to plastic wrap.', '/assets/products/product-6.jpg', 4.8, 198, 75),
('Organic Spinach', 220.00, 'Fresh Produce', 'Nutrient-rich organic spinach', 'Fresh organic spinach leaves, packed with iron and vitamins. Hydroponically grown.', '/assets/products/product-7.jpg', 4.5, 54, 30),
('Stainless Steel Garden Tool Set', 2800.00, 'Tools', 'Professional gardening tool kit', 'Premium 7-piece stainless steel garden tool set with ergonomic wooden handles. Built to last.', '/assets/products/product-8.jpg', 4.9, 312, 20),
('Organic Herb Starter Kit', 850.00, 'Seeds', 'Grow your own fresh herbs', 'Complete kit with 6 organic herb seed varieties, biodegradable pots, and organic soil mix.', '/assets/products/product-9.jpg', 4.7, 176, 45),
('Natural Jute Shopping Bags', 420.00, 'Lifestyle', 'Durable eco-friendly shopping bags', 'Set of 3 handwoven jute bags. Strong, reusable, and biodegradable. Perfect for grocery shopping.', '/assets/products/product-10.jpg', 4.6, 89, 60);

-- Product Features (Schema uses: feature_id, product_id, feature, display_order)
INSERT INTO product_features (product_id, feature, display_order) VALUES
(1, '100% Organic Certified', 0),
(1, 'Locally grown within 50km', 1),
(1, 'Pesticide-free cultivation', 2),
(1, 'Harvested daily for freshness', 3),
(2, 'Certified Organic', 0),
(2, 'Hydroponically grown', 1),
(2, 'Rich in nutrients', 2),
(3, 'Biodegradable bamboo', 0),
(3, 'BPA-free bristles', 1),
(3, 'Compostable packaging', 2),
(4, '100% Organic', 0),
(4, 'High in beta-carotene', 1),
(4, 'Locally sourced', 2),
(4, 'No chemical fertilizers', 3),
(5, 'Non-GMO heirloom varieties', 0),
(5, 'Open-pollinated seeds', 1),
(5, '12 different vegetables', 2),
(5, 'Includes planting guide', 3),
(6, 'Organic cotton base', 0),
(6, 'Natural beeswax coating', 1),
(6, 'Washable and reusable', 2),
(6, 'Multiple sizes included', 3),
(7, 'Certified Organic', 0),
(7, 'High in iron and vitamins', 1),
(7, 'Pesticide-free', 2),
(8, 'Rust-resistant stainless steel', 0),
(8, 'Ergonomic wooden handles', 1),
(8, '7-piece complete set', 2),
(8, 'Lifetime warranty', 3),
(9, '6 popular herb varieties', 0),
(9, 'Biodegradable pots included', 1),
(9, 'Organic soil mix', 2),
(9, 'Complete growing instructions', 3),
(10, 'Handwoven natural jute', 0),
(10, 'Strong and durable', 1),
(10, 'Biodegradable material', 2),
(10, 'Set of 3 different sizes', 3);

-- Product Specifications (Schema uses: spec_id, product_id, spec_key, spec_value, display_order)
INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES
(1, 'Weight', '1kg Basket', 0),
(1, 'Origin', 'Local Community Gardens', 1),
(1, 'Harvest Date', 'Daily', 2),
(1, 'Shelf Life', '5-7 days refrigerated', 3),
(2, 'Weight', '250g Bundle', 0),
(2, 'Origin', 'Urban Hydroponic Farm', 1),
(2, 'Shelf Life', '7-10 days', 2),
(3, 'Material', '100% Bamboo', 0),
(3, 'Bristle Type', 'Soft Nylon', 1),
(3, 'Quantity', '4 pieces', 2),
(4, 'Weight', '500g Bundle', 0),
(4, 'Origin', 'Organic Farm, Nuwara Eliya', 1),
(4, 'Shelf Life', '2-3 weeks refrigerated', 2),
(5, 'Varieties', '12 seed packets', 0),
(5, 'Seed Count', '50-100 per packet', 1),
(5, 'Germination Rate', '85-95%', 2),
(5, 'Storage', 'Cool, dry place', 3),
(6, 'Material', 'Organic Cotton & Beeswax', 0),
(6, 'Sizes', '2 Small, 2 Medium, 1 Large', 1),
(6, 'Care', 'Hand wash with cold water', 2),
(6, 'Lifespan', '1 year with proper care', 3),
(7, 'Weight', '300g Bundle', 0),
(7, 'Origin', 'Hydroponic Farm, Colombo', 1),
(7, 'Shelf Life', '5-7 days refrigerated', 2),
(8, 'Material', 'Stainless Steel & Wood', 0),
(8, 'Tools Included', 'Trowel, Fork, Pruner, Weeder, Rake, Hoe, Transplanter', 1),
(8, 'Handle Length', '30-35cm', 2),
(8, 'Warranty', 'Lifetime', 3),
(9, 'Herbs Included', 'Basil, Mint, Cilantro, Parsley, Thyme, Oregano', 0),
(9, 'Pot Size', '8cm biodegradable', 1),
(9, 'Soil Volume', '2kg organic mix', 2),
(9, 'Growing Time', '4-6 weeks to harvest', 3),
(10, 'Material', '100% Natural Jute', 0),
(10, 'Dimensions', 'Small: 30x25cm, Medium: 40x35cm, Large: 50x45cm', 1),
(10, 'Weight Capacity', 'Up to 10kg per bag', 2),
(10, 'Care', 'Spot clean, air dry', 3);


-- ============================================
-- EVENTS DATA (Schema uses: event_id, title, date, location, description, category, image)
-- ============================================

INSERT INTO events (title, date, location, description, category, price, image) VALUES
('Eco Awareness Meetup', '2026-03-12', 'Colombo Community Center', 'Join us for an inspiring meetup focused on environmental awareness and sustainable living practices.', 'Community', 500.00, '/assets/events/event-1.jpg'),
('Urban Farming Seminar', '2026-03-20', 'Green Space Gardens, Kandy', 'Learn the basics of urban farming and how to grow your own food in small spaces.', 'Education', 2500.00, '/assets/events/event-2.jpg'),
('Beach Cleanup Drive', '2026-04-05', 'Mount Lavinia Beach', 'Volunteer beach cleanup event to protect our coastal environment.', 'Volunteering', 750.00, '/assets/events/event-3.jpg'),
('Sustainable Living Expo', '2026-04-15', 'BMICH, Colombo', 'Annual expo showcasing eco-friendly products, green technologies, and sustainable lifestyle solutions.', 'Networking', 1000.00, '/assets/events/event-4.jpg'),
('Community Garden Launch', '2026-04-22', 'Viharamahadevi Park, Colombo', 'Celebrate the opening of our new community garden with planting activities and local food tasting.', 'Community', 300.00, '/assets/events/event-5.jpg'),
('Zero Waste Seminar Series', '2026-05-03', 'Eco Hub, Galle', 'Three-day intensive seminar on reducing waste and living a zero-waste lifestyle.', 'Education', 4500.00, '/assets/events/event-6.jpg'),
('Yoga in the Park', '2026-05-10', 'Galle Face Green, Colombo', 'Free outdoor yoga session promoting wellness and connection with nature.', 'Wellness', 500.00, '/assets/events/event-7.jpg'),
('Green Business Networking Night', '2026-05-18', 'Cinnamon Grand, Colombo', 'Connect with eco-conscious entrepreneurs and sustainable business leaders.', 'Networking', 3000.00, '/assets/events/event-8.jpg');

-- Event Highlights (Schema uses: highlight_id, event_id, highlight, display_order)
INSERT INTO event_highlights (event_id, highlight, display_order) VALUES
(1, 'Networking with eco-conscious community members', 0),
(1, 'Expert panel discussion on sustainability', 1),
(1, 'Free organic refreshments', 2),
(2, 'Hands-on planting demonstration', 0),
(2, 'Take home your own starter plants', 1),
(2, 'Q&A with urban farming experts', 2),
(3, 'Make a real environmental impact', 0),
(3, 'Meet like-minded volunteers', 1),
(3, 'Cleanup supplies provided', 2),
(4, 'Over 50 eco-friendly exhibitors', 0),
(4, 'Live demonstrations and interactive sessions', 1),
(4, 'Sustainable product marketplace', 2),
(4, 'Keynote speakers from global brands', 3),
(5, 'Plant your own vegetables', 0),
(5, 'Local organic food tasting', 1),
(5, 'Live music and entertainment', 2),
(5, 'Free gardening starter kits', 3),
(6, 'Comprehensive waste audit training', 0),
(6, 'DIY natural cleaning products', 1),
(6, 'Composting masterclass', 2),
(6, 'Take-home zero waste kit', 3),
(7, 'All levels welcome', 0),
(7, 'Professional yoga instructor', 1),
(7, 'Free yoga mats provided', 2),
(7, 'Healthy refreshments after session', 3),
(8, 'Speed networking sessions', 0),
(8, 'Pitch your green business idea', 1),
(8, 'Meet potential investors', 2),
(8, 'Complimentary dinner and drinks', 3);

-- Event Agenda (Schema uses: agenda_id, event_id, time, activity, display_order)
INSERT INTO event_agenda (event_id, time, activity, display_order) VALUES
(1, '10:00 AM', 'Registration and Welcome Coffee', 0),
(1, '10:30 AM', 'Opening Keynote: The Future of Sustainable Living', 1),
(1, '11:30 AM', 'Panel Discussion: Local Sustainability Initiatives', 2),
(1, '12:30 PM', 'Networking Lunch', 3),
(2, '09:00 AM', 'Introduction to Urban Farming', 0),
(2, '10:00 AM', 'Hands-on Planting Session', 1),
(2, '12:00 PM', 'Q&A and Closing', 2),
(3, '08:00 AM', 'Registration and Team Assignment', 0),
(3, '08:30 AM', 'Beach Cleanup Activity', 1),
(3, '11:00 AM', 'Wrap-up and Refreshments', 2),
(4, '09:00 AM', 'Expo Opens - Exhibitor Booths', 0),
(4, '10:00 AM', 'Keynote: Innovation in Sustainable Technology', 1),
(4, '11:30 AM', 'Seminar Sessions Begin', 2),
(4, '01:00 PM', 'Lunch Break', 3),
(4, '02:00 PM', 'Panel: Building Green Businesses', 4),
(4, '04:00 PM', 'Networking Reception', 5),
(5, '10:00 AM', 'Welcome and Garden Tour', 0),
(5, '10:30 AM', 'Community Planting Activity', 1),
(5, '12:00 PM', 'Local Food Tasting', 2),
(5, '01:00 PM', 'Live Music Performance', 3),
(5, '02:00 PM', 'Closing Remarks', 4),
(6, '09:00 AM', 'Day 1: Waste Audit Seminar', 0),
(6, '09:00 AM', 'Day 2: Natural Cleaning Products', 1),
(6, '09:00 AM', 'Day 3: Composting Masterclass', 2),
(7, '06:00 AM', 'Registration and Setup', 0),
(7, '06:30 AM', 'Sunrise Yoga Session', 1),
(7, '07:30 AM', 'Meditation and Cool Down', 2),
(7, '08:00 AM', 'Healthy Breakfast', 3),
(8, '06:00 PM', 'Registration and Welcome Drinks', 0),
(8, '06:30 PM', 'Speed Networking Sessions', 1),
(8, '07:30 PM', 'Dinner and Keynote Speech', 2),
(8, '08:30 PM', 'Pitch Competition', 3),
(8, '09:30 PM', 'Closing Networking', 4);

-- Event Speakers (Schema uses: speaker_id, event_id, name, role, image, display_order)
INSERT INTO event_speakers (event_id, name, role, image, display_order) VALUES
(1, 'Dr. Aruna Perera', 'Environmental Scientist', '/assets/speakers/speaker-1.jpg', 0),
(1, 'Nimal Gunawardena', 'Sustainability Consultant', '/assets/speakers/speaker-2.jpg', 1),
(2, 'Chaminda Silva', 'Urban Agriculture Expert', '/assets/speakers/speaker-3.jpg', 0),
(4, 'Sarah Mitchell', 'Green Tech Innovator', '/assets/speakers/speaker-4.jpg', 0),
(4, 'Rajesh Kumar', 'Sustainable Business Strategist', '/assets/speakers/speaker-5.jpg', 1),
(4, 'Emma Thompson', 'Climate Action Advocate', '/assets/speakers/speaker-6.jpg', 2),
(5, 'Priya Jayasinghe', 'Community Organizer', '/assets/speakers/speaker-7.jpg', 0),
(6, 'Michael Chen', 'Zero Waste Expert', '/assets/speakers/speaker-8.jpg', 0),
(6, 'Lisa Anderson', 'Eco-lifestyle Coach', '/assets/speakers/speaker-9.jpg', 1),
(7, 'Ananda Wickramasinghe', 'Certified Yoga Instructor', '/assets/speakers/speaker-10.jpg', 0),
(8, 'David Perera', 'Impact Investor', '/assets/speakers/speaker-11.jpg', 0),
(8, 'Nina Rodrigo', 'Social Entrepreneur', '/assets/speakers/speaker-12.jpg', 1);


-- ============================================

-- WORKSHOPS DATA (Schema uses: workshop_id, title, date, duration, location, description, category, instructor_id, price, image, slots)
-- ============================================

INSERT INTO workshops (title, date, duration, location, description, category, instructor_id, price, image, slots) VALUES
('Organic Farming Basics', '2026-03-21', '6 Hours (09:00 AM - 03:00 PM)', 'Urban Harvest Training Center, Colombo', 'Learn the fundamentals of organic farming and sustainable agriculture practices.', 'Farming', 1, 5000.00, '/assets/workshops/workshop-1.jpg', 20),
('Sustainable Home Gardening', '2026-04-10', '4 Hours (10:00 AM - 02:00 PM)', 'Green Spaces Community Garden, Kandy', 'Transform your home into a green oasis with sustainable gardening techniques.', 'Gardening', 2, 3500.00, '/assets/workshops/workshop-2.jpg', 15),
('DIY Composting Workshop', '2026-04-18', '3 Hours (02:00 PM - 05:00 PM)', 'Eco Hub, Galle', 'Master the art of composting and turn kitchen waste into garden gold.', 'DIY', 3, 2500.00, '/assets/workshops/workshop-3.jpg', 25),
('Permaculture Design Fundamentals', '2026-04-25', '8 Hours (09:00 AM - 05:00 PM)', 'Eco Village, Matale', 'Comprehensive introduction to permaculture principles and sustainable land design.', 'Farming', 1, 7500.00, '/assets/workshops/workshop-4.jpg', 10),
('Vertical Gardening Techniques', '2026-05-05', '3 Hours (10:00 AM - 01:00 PM)', 'Urban Harvest Center, Colombo', 'Maximize small spaces with innovative vertical gardening methods.', 'Gardening', 2, 3000.00, '/assets/workshops/workshop-5.jpg', 20),
('Natural Pest Control Methods', '2026-05-12', '4 Hours (09:00 AM - 01:00 PM)', 'Green Farm, Kandy', 'Learn organic pest management techniques without harmful chemicals.', 'Farming', 1, 4000.00, '/assets/workshops/workshop-6.jpg', 15),
('Farm-to-Table Cooking', '2026-05-20', '5 Hours (11:00 AM - 04:00 PM)', 'Culinary Garden, Galle', 'Cook delicious meals using fresh organic produce from the garden.', 'Cooking', 2, 6000.00, '/assets/workshops/workshop-7.jpg', 12),
('Mindful Gardening & Wellness', '2026-05-28', '3 Hours (07:00 AM - 10:00 AM)', 'Wellness Garden, Colombo', 'Combine gardening with mindfulness practices for mental and physical health.', 'Wellness', 2, 3500.00, '/assets/workshops/workshop-8.jpg', 18);

-- ============================================
-- WORKSHOP BOOKINGS DATA
-- ============================================

-- bookings table is created in schema, but we can seed some data if needed.
-- For now we will leave it empty or just comment it out.
-- CREATE TABLE IF NOT EXISTS workshop_bookings (
--    id INTEGER PRIMARY KEY AUTOINCREMENT,
--    workshop_id INTEGER,
--    user_id INTEGER,
--    tickets INTEGER,
--    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
--    total_price REAL,
--    status TEXT DEFAULT 'confirmed',
--    FOREIGN KEY (workshop_id) REFERENCES workshops(id),
--    FOREIGN KEY (user_id) REFERENCES users(id)
-- );


-- Workshop Learning Outcomes (Schema uses: outcome_id, workshop_id, outcome, display_order)
INSERT INTO workshop_learning_outcomes (workshop_id, outcome, display_order) VALUES
(1, 'Understand the principles of organic farming', 0),
(1, 'Learn soil preparation and composting techniques', 1),
(1, 'Identify common pests and organic pest control methods', 2),
(1, 'Plan and implement a small-scale organic farm', 3),
(2, 'Design a sustainable home garden layout', 0),
(2, 'Select appropriate plants for your climate', 1),
(2, 'Implement water-saving irrigation techniques', 2),
(2, 'Create natural fertilizers and pest deterrents', 3),
(3, 'Understand the composting process', 0),
(3, 'Build your own compost bin', 1),
(3, 'Identify compostable materials', 2),
(3, 'Troubleshoot common composting problems', 3),
(4, 'Master permaculture design principles', 0),
(4, 'Create sustainable food production systems', 1),
(4, 'Design water harvesting and management systems', 2),
(4, 'Develop a complete permaculture site plan', 3),
(5, 'Build vertical garden structures', 0),
(5, 'Choose plants suitable for vertical growing', 1),
(5, 'Install efficient irrigation systems', 2),
(5, 'Maintain vertical gardens year-round', 3),
(6, 'Identify common garden pests', 0),
(6, 'Create natural pest repellents', 1),
(6, 'Attract beneficial insects', 2),
(6, 'Implement integrated pest management', 3),
(7, 'Harvest and prepare fresh organic produce', 0),
(7, 'Cook seasonal farm-fresh meals', 1),
(7, 'Preserve excess harvest', 2),
(7, 'Plan menus around garden availability', 3),
(8, 'Practice mindfulness while gardening', 0),
(8, 'Reduce stress through nature connection', 1),
(8, 'Create a therapeutic garden space', 2),
(8, 'Integrate wellness routines with gardening', 3);

-- Workshop Agenda (Schema uses: agenda_id, workshop_id, time, activity, display_order)
INSERT INTO workshop_agenda (workshop_id, time, activity, display_order) VALUES
(1, '09:00 AM', 'Introduction to Organic Farming', 0),
(1, '10:00 AM', 'Soil Health and Preparation', 1),
(1, '11:00 AM', 'Break', 2),
(1, '11:15 AM', 'Organic Pest Management', 3),
(1, '12:30 PM', 'Lunch', 4),
(1, '01:30 PM', 'Hands-on Planting Session', 5),
(2, '10:00 AM', 'Garden Planning and Design', 0),
(2, '11:00 AM', 'Plant Selection Workshop', 1),
(2, '12:00 PM', 'Lunch Break', 2),
(2, '01:00 PM', 'Practical Gardening Session', 3),
(3, '02:00 PM', 'Composting Basics', 0),
(3, '03:00 PM', 'Building a Compost Bin', 1),
(3, '04:00 PM', 'Q&A and Wrap-up', 2),
(4, '09:00 AM', 'Permaculture Ethics and Principles', 0),
(4, '10:30 AM', 'Site Analysis and Assessment', 1),
(4, '12:00 PM', 'Lunch Break', 2),
(4, '01:00 PM', 'Design Workshop', 3),
(4, '03:00 PM', 'Water Management Systems', 4),
(4, '04:00 PM', 'Q&A and Site Tour', 5),
(5, '10:00 AM', 'Introduction to Vertical Gardening', 0),
(5, '10:30 AM', 'Building Vertical Structures', 1),
(5, '11:30 AM', 'Plant Selection and Planting', 2),
(5, '12:30 PM', 'Maintenance and Care', 3),
(6, '09:00 AM', 'Common Garden Pests Identification', 0),
(6, '10:00 AM', 'Natural Pest Control Methods', 1),
(6, '11:00 AM', 'Making Organic Pest Sprays', 2),
(6, '12:00 PM', 'Beneficial Insects Workshop', 3),
(7, '11:00 AM', 'Garden Tour and Harvest', 0),
(7, '12:00 PM', 'Cooking Demonstration', 1),
(7, '01:00 PM', 'Hands-on Cooking Session', 2),
(7, '02:30 PM', 'Lunch and Tasting', 3),
(7, '03:30 PM', 'Food Preservation Techniques', 4),
(8, '07:00 AM', 'Mindfulness Meditation', 0),
(8, '07:30 AM', 'Therapeutic Gardening Activities', 1),
(8, '08:30 AM', 'Garden Design for Wellness', 2),
(8, '09:30 AM', 'Closing Reflection and Tea', 3);

-- ============================================
-- SUBSCRIPTIONS DATA
-- ============================================

INSERT INTO subscriptions (name, description, price, type, image) VALUES
('Weekly Harvest Box', 'A curated selection of the season''s best organic vegetables, delivered straight to your door every week.', 2500.00, 'Veggie Box', '/assets/subscriptions/sub-1.jpg'),
('Fruit Lover''s Basket', 'Enjoy a colorful variety of fresh, organic fruits. Perfect for smoothies, snacking, and healthy desserts.', 3000.00, 'Fruit Box', '/assets/subscriptions/sub-2.jpg'),
('Herb Garden Refill', 'Fresh potted herbs delivered to keep your kitchen garden thriving. Basil, mint, thyme, and more.', 1500.00, 'Plant Box', '/assets/subscriptions/sub-3.jpg'),
('Organic Compost Sack', 'Monthly delivery of nutrient-rich organic compost for your home garden.', 1500.00, 'Gardening Box', '/assets/subscriptions/sub-4.jpg'),
('Gardener''s Essentials Box', 'Seasonal selection of seeds, tools, and gardening accessories.', 4500.00, 'Tool Box', '/assets/subscriptions/sub-5.jpg'),
('Urban Grower''s Premium Crate', 'Professional-grade gardening supplies, premium seeds, and exclusive tools.', 8000.00, 'Grower Crate', '/assets/subscriptions/sub-6.jpg'),
('Exotic Mushroom Box', 'Discover the world of gourmet mushrooms with a weekly delivery of oyster, shiitake, and lion''s mane mushrooms.', 2000.00, 'Veggie Box', '/assets/subscriptions/sub-7.jpg'),
('Microgreens Power Pack', 'Nutrient-dense microgreens to elevate your meals. A mix of sunflower, radish, and pea shoots.', 1200.00, 'Veggie Box', '/assets/subscriptions/sub-8.jpg'),
('Flower Power Bouquet', 'Brighten your home with a stunning arrangement of locally grown, seasonal flowers.', 2500.00, 'Flower Box', '/assets/subscriptions/sub-9.jpg'),
('Zero Waste Kit Refill', 'Replenish your eco-friendly essentials like bamboo toothbrushes, soap bars, and solid shampoo.', 3500.00, 'Lifestyle Box', '/assets/subscriptions/sub-10.jpg');

INSERT INTO subscription_features (subscription_id, feature, display_order) VALUES
(1, '6-8 varieties of seasonal vegetables', 0),
(1, '100% Organic certified', 1),
(1, 'Recipe card included', 2),
(2, '4-5 types of organic fruits', 0),
(2, 'Perfect for families', 1),
(2, 'Seasonal selection', 2),
(3, '3 potted herbs per delivery', 0),
(3, 'Care instructions included', 1),
(3, 'Pots are biodegradable', 2),
(4, '10kg bag of organic compost', 0),
(4, 'pH balanced mixture', 1),
(4, 'Weed-free guarantee', 2),
(5, '2-3 packets of seasonal seeds', 0),
(5, 'Small hand tools included', 1),
(5, 'Gardening gloves', 2),
(6, 'Premium heirloom seeds', 0),
(6, 'Pro-grade fertilizer', 1),
(6, 'Heavy-duty tools', 2),
(7, '3 varieties of gourmet mushrooms', 0),
(7, 'Freshly harvested', 1),
(7, 'Includes cooking tips', 2),
(8, '4 packs of mixed microgreens', 0),
(8, 'Harvested on delivery day', 1),
(8, 'High nutrient content', 2),
(9, 'Fresh cut seasonal flowers', 0),
(9, 'Arranged by professional florists', 1),
(9, 'Long vase life', 2),
(10, 'Curated eco-essentials', 0),
(10, 'Plastic-free packaging', 1),
(10, 'Quarterly delivery', 2);

-- ============================================
-- USER SUBSCRIPTIONS DATA
-- ============================================

INSERT INTO user_subscriptions (user_id, subscription_id, frequency, box_size, delivery_day, delivery_address, delivery_city, delivery_state, delivery_zip, delivery_phone, status) VALUES
(2, 1, 'weekly', 'medium', 'Monday', '123 Garden Lane', 'Colombo', 'Western', '00100', '0771234567', 'active'),
(2, 2, 'monthly', 'large', 'Wednesday', '123 Garden Lane', 'Colombo', 'Western', '00100', '0771234567', 'cancelled');


-- ============================================
-- ORDERS & ITEMS DATA
-- ============================================

INSERT INTO orders (user_id, total_amount, status, payment_method, delivery_address, recipient_name, recipient_phone) VALUES
(2, 1250.00, 'completed', 'card', '123 Garden Lane, Colombo', 'John Doe', '0771234567'),
(2, 450.00, 'pending', 'card', '123 Garden Lane, Colombo', 'John Doe', '0771234567');

INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 2, 450.00),
(1, 2, 1, 200.00),
(1, 3, 1, 150.00),
(2, 1, 1, 450.00);

-- ============================================
-- REVIEWS DATA
-- ============================================

-- Product Reviews
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text) VALUES
(1, 2, 5, 'Best tomatoes ever!', 'These tomatoes are incredibly juicy and flavorful. Made the best pasta sauce with them.'),
(1, 1, 4, 'Great quality', 'Very fresh and tasty, but a bit pricey.'),
(2, 2, 5, 'Crisp and fresh', 'Love the organic lettuce. Lasts a long time in the fridge.'),
(3, 2, 4, 'Good alternative', 'Takes some getting used to, but glad to reduce plastic waste.'),
(8, 2, 5, 'Solid tools', 'These tools are heavy duty and feel great in hand. The wooden handles are a nice touch.');

-- Workshop Reviews
INSERT INTO workshop_reviews (workshop_id, user_id, rating, review_title, review_text) VALUES
(1, 2, 5, 'Transformative experience', 'I learned so much about soil health. My garden is already looking better!'),
(2, 2, 4, 'Very practical', 'Great tips for small urban spaces. Malini is an amazing teacher.');

-- Subscription Reviews
INSERT INTO subscription_reviews (subscription_id, user_id, rating, review_text) VALUES
(1, 2, 5, 'Love the variety in every box. Everything is so fresh!'),
(2, 2, 4, 'Great fruit selection, though sometimes there are too many bananas.');

-- ============================================
-- BOOKINGS & REGISTRATIONS DATA
-- ============================================

-- Event Bookings
INSERT INTO event_bookings (user_id, event_id, attendees, status) VALUES
(2, 1, 2, 'confirmed'),
(2, 2, 1, 'confirmed');

-- Workshop Bookings
INSERT INTO workshop_bookings (workshop_id, user_id, tickets, total_price) VALUES
(1, 2, 2, 10000.00),
(2, 2, 1, 3500.00);

-- ============================================
-- ADDITIONAL METADATA
-- ============================================


-- Push Subscriptions (Sample)
INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES
(2, 'https://fcm.googleapis.com/fcm/send/sample-endpoint-123', 'p256dh-key-sample', 'auth-key-sample');

-- ============================================
-- END OF SEED DATA
-- ============================================
