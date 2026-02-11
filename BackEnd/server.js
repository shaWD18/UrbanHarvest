const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { initializeDatabase, getDatabase } = require('./database');
const { authenticateToken, authorizeAdmin, generateToken } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const webpush = require('web-push');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend public folder
app.use('/assets', express.static(path.join(__dirname, '../FrontEnd/public/assets')));

// Initialize database
let db;
initializeDatabase().then(database => {
    db = database;
    console.log('✅ Database connected');
}).catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});

// Configure web-push with VAPID keys
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BIiZlUASbSdaYY2-KF4F_DzATL1Rc34oR6HMFjog9cRidbjyxJXrv_CHAhohfh0rBhvJCXXzzCoGLR5QgeY9_3M',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'FV2Z7vhcxY__8AEAkdOy8FrWsxDPJXLihAJDkF4pXTM'
};

webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@urbanharvest.com'}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Create a new order
app.post('/api/orders', async (req, res) => {
    const { userId, items, paymentMethod, deliveryAddress, recipientName, recipientPhone } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Calculate total amount from database prices to prevent frontend manipulation
        let totalAmount = 0;
        const processItems = [];

        for (const item of items) {
            const product = await db.get('SELECT price FROM products WHERE id = ?', [item.productId]);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }
            totalAmount += product.price * item.quantity;
            processItems.push({ ...item, price: product.price });
        }

        // Insert order
        const orderResult = await db.run(
            'INSERT INTO orders (user_id, total_amount, status, payment_method, delivery_address, recipient_name, recipient_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, totalAmount, 'pending', paymentMethod || 'card', deliveryAddress, recipientName, recipientPhone]
        );
        const orderId = orderResult.lastID;

        // Insert order items
        for (const item of processItems) {
            await db.run(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price]
            );
        }

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            totalAmount
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ==================== ADMIN ORDER MANAGEMENT ====================

// GET all orders (Admin only)
app.get('/api/admin/orders', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const orders = await db.all(
            `SELECT 
                o.*,
                u.name as customer_name,
                u.email as customer_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );

        // Get items for each order
        for (const order of orders) {
            order.items = await db.all(
                `SELECT oi.*, p.name, p.image 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT update order status (Admin only)
app.put('/api/admin/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        await db.run(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: 'Order status updated successfully', status });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// GET all subscribers for a subscription (Admin only)
app.get('/api/subscriptions/:id/subscribers', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const subscribers = await db.all(`
            SELECT 
                us.id as record_id,
                u.id as user_id, 
                u.name, 
                u.email, 
                us.frequency, 
                us.box_size, 
                us.delivery_day, 
                us.delivery_date,
                us.delivery_address,
                us.delivery_city,
                us.delivery_state,
                us.delivery_zip,
                us.delivery_phone,
                us.status, 
                us.start_date
            FROM user_subscriptions us
            JOIN users u ON us.user_id = u.id
            WHERE us.subscription_id = ?
        `, [id]);
        res.json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
});

// ==================== USER PROFILE & HISTORY ENDPOINTS ====================

// GET user profile with stats
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const user = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get stats
        if (user.role === 'admin') {
            const customerCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
            const totalRevenue = await db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
            const pendingOrders = await db.get('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
            const activeSubscribers = await db.get('SELECT COUNT(*) as count FROM user_subscriptions WHERE status = "active"');
            const productCount = await db.get('SELECT COUNT(*) as count FROM products');
            const eventBookings = await db.get('SELECT COUNT(*) as count FROM event_bookings');
            const workshopBookings = await db.get('SELECT COUNT(*) as count FROM workshop_bookings');

            user.stats = {
                total_customers: customerCount.count || 0,
                total_revenue: totalRevenue.total || 0,
                pending_orders: pendingOrders.count || 0,
                active_subscriptions: activeSubscribers.count || 0,
                total_products: productCount.count || 0,
                total_bookings: (eventBookings.count || 0) + (workshopBookings.count || 0)
            };
        } else {
            const orderCount = await db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]);
            const upcomingEvents = await db.get(
                `SELECT COUNT(*) as count FROM event_bookings 
                 WHERE user_id = ? AND status = 'confirmed'`,
                [userId]
            );
            const workshopRegistrations = await db.get(
                `SELECT COUNT(*) as count FROM workshop_bookings 
                 WHERE user_id = ?`,
                [userId]
            );
            const activeSubscriptions = await db.get(
                `SELECT COUNT(*) as count FROM user_subscriptions 
                 WHERE user_id = ? AND status = 'active'`,
                [userId]
            );

            user.stats = {
                total_orders: orderCount.count || 0,
                upcoming_events: upcomingEvents.count || 0,
                workshop_registrations: workshopRegistrations.count || 0,
                active_subscriptions: activeSubscriptions.count || 0
            };
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// GET user orders with items
app.get('/api/user/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await db.all(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        // Get items for each order
        for (const order of orders) {
            order.items = await db.all(
                `SELECT oi.*, p.name, p.image 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET user event bookings
app.get('/api/user/events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await db.all(
            `SELECT 
                eb.id,
                eb.event_id,
                eb.booking_date,
                eb.attendees,
                eb.status,
                e.title as event_title,
                e.date as event_date,
                e.location as event_location,
                e.image as event_image,
                e.price as event_price
             FROM event_bookings eb
             JOIN events e ON eb.event_id = e.id
             WHERE eb.user_id = ?
             ORDER BY e.date DESC`,
            [userId]
        );

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ error: 'Failed to fetch event bookings' });
    }
});

// GET user workshop registrations
app.get('/api/user/workshops', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const registrations = await db.all(
            `SELECT 
                wb.id,
                wb.workshop_id,
                wb.booking_date as registration_date,
                wb.status as payment_status,
                wb.status,
                w.title as workshop_title,
                w.date as workshop_date,
                w.location as workshop_location,
                w.image as workshop_image,
                w.price as workshop_price
             FROM workshop_bookings wb
             JOIN workshops w ON wb.workshop_id = w.id
             WHERE wb.user_id = ?
             ORDER BY w.date DESC`,
            [userId]
        );

        res.json(registrations);
    } catch (error) {
        console.error('Error fetching user workshops:', error);
        res.status(500).json({ error: 'Failed to fetch workshop registrations' });
    }
});

// GET user subscriptions (all - active and cancelled)
app.get('/api/user/subscriptions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const subscriptions = await db.all(
            `SELECT 
                us.id,
                us.subscription_id,
                us.start_date,
                us.status,
                us.frequency,
                us.box_size,
                us.delivery_day,
                us.delivery_date,
                us.delivery_address,
                us.delivery_city,
                us.delivery_state,
                us.delivery_zip,
                us.delivery_phone,
                s.name as subscription_name,
                s.description as subscription_description,
                s.price as subscription_price,
                s.image as subscription_image
             FROM user_subscriptions us
             JOIN subscriptions s ON us.subscription_id = s.id
             WHERE us.user_id = ?
             ORDER BY us.start_date DESC`,
            [userId]
        );

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// ==================== PUSH NOTIFICATION ENDPOINTS ====================

// Get VAPID public key
app.get('/api/notifications/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
app.post('/api/notifications/subscribe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({ error: 'Invalid subscription data' });
        }

        // Check if subscription already exists
        const existing = await db.get(
            'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
            [userId, endpoint]
        );

        if (existing) {
            return res.json({ message: 'Subscription already exists' });
        }

        // Save subscription
        await db.run(
            'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
            [userId, endpoint, keys.p256dh, keys.auth]
        );

        res.json({ message: 'Subscription saved successfully' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

// Send push notification (admin only)
app.post('/api/notifications/send', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, body, url, userIds } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // Get subscriptions
        let query = 'SELECT * FROM push_subscriptions';
        let params = [];

        if (userIds && userIds.length > 0) {
            query += ` WHERE user_id IN (${userIds.map(() => '?').join(',')})`;
            params = userIds;
        }

        const subscriptions = await db.all(query, params);

        if (subscriptions.length === 0) {
            return res.json({ message: 'No subscriptions found', sent: 0 });
        }

        // Send notifications
        const payload = JSON.stringify({
            title,
            body,
            url: url || '/'
        });

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    },
                    payload
                );
                sent++;
            } catch (error) {
                console.error('Failed to send notification:', error);
                failed++;

                // Remove invalid subscriptions
                if (error.statusCode === 410) {
                    await db.run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
                }
            }
        }

        res.json({
            message: 'Notifications sent',
            sent,
            failed,
            total: subscriptions.length
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});



// Get user orders
app.get('/api/orders/:userId', async (req, res) => {
    try {
        const orders = await db.all(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );

        for (const order of orders) {
            order.items = await db.all(
                `SELECT oi.*, p.name, p.image 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Helper function to reconstruct product with features and specs
async function getProductById(id) {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return null;

    // Get features
    const features = await db.all(
        'SELECT feature FROM product_features WHERE product_id = ? ORDER BY display_order',
        [id]
    );
    product.features = features.map(f => f.feature);

    // Get specifications
    const specs = await db.all(
        'SELECT spec_key, spec_value FROM product_specifications WHERE product_id = ? ORDER BY display_order',
        [id]
    );
    product.specifications = specs.reduce((obj, s) => {
        obj[s.spec_key] = s.spec_value;
        return obj;
    }, {});

    return product;
}

// Helper function to reconstruct event with highlights, agenda, speakers
async function getEventById(id) {
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) return null;

    // Get highlights
    const highlights = await db.all(
        'SELECT highlight FROM event_highlights WHERE event_id = ? ORDER BY display_order',
        [id]
    );
    event.highlights = highlights.map(h => h.highlight);

    // Get agenda
    const agenda = await db.all(
        'SELECT time, activity FROM event_agenda WHERE event_id = ? ORDER BY display_order',
        [id]
    );
    event.agenda = agenda;

    // Get speakers
    const speakers = await db.all(
        'SELECT name, role, image FROM event_speakers WHERE event_id = ? ORDER BY display_order',
        [id]
    );
    event.speakers = speakers;

    return event;
}

// Helper function to reconstruct workshop with instructor, outcomes, agenda, testimonials
async function getWorkshopById(id) {
    const workshop = await db.get('SELECT * FROM workshops WHERE id = ?', [id]);
    if (!workshop) return null;

    // Get instructor
    if (workshop.instructor_id) {
        const instructor = await db.get('SELECT id, name, bio, image FROM instructors WHERE id = ?', [workshop.instructor_id]);
        workshop.instructor = instructor;
    }
    delete workshop.instructor_id;

    // Get learning outcomes
    const outcomes = await db.all(
        'SELECT outcome FROM workshop_learning_outcomes WHERE workshop_id = ? ORDER BY display_order',
        [id]
    );
    workshop.learningOutcomes = outcomes.map(o => o.outcome);

    // Get agenda
    const agenda = await db.all(
        'SELECT time, activity FROM workshop_agenda WHERE workshop_id = ? ORDER BY display_order',
        [id]
    );
    workshop.agenda = agenda;


    // Get booking count
    const bookings = await db.get('SELECT COUNT(*) as count FROM workshop_bookings WHERE workshop_id = ?', [id]);
    workshop.booking_count = bookings.count || 0;

    return workshop;
}

// ==================== AUTHENTICATION ROUTES ====================

// POST login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST signup (customer only)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.run(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, 'customer']
        );

        const newUser = {
            id: result.lastID,
            email,
            name,
            role: 'customer'
        };

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            token,
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET current user (protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id]);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'urban-harvest',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    },
});

const upload = multer({ storage: storage });

// POST upload file
app.post('/api/upload', authenticateToken, authorizeAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the Cloudinary URL (req.file.path contains the URL when using CloudinaryStorage)
        res.json({ filePath: req.file.path });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// ==================== PRODUCTS ROUTES ====================

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.all('SELECT * FROM products ORDER BY id');

        // Get features and specs for each product
        for (let product of products) {
            const fullProduct = await getProductById(product.id);
            Object.assign(product, fullProduct);
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await getProductById(parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new product (admin only)
app.post('/api/products', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, price, category, short_description, description, image, stock, features, specifications } = req.body;

        // Insert product
        const result = await db.run(
            `INSERT INTO products (name, price, category, short_description, description, image, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, price, category, short_description, description, image, stock]
        );
        const productId = result.lastID;

        // Insert features
        if (features && features.length > 0) {
            for (let i = 0; i < features.length; i++) {
                await db.run(
                    'INSERT INTO product_features (product_id, feature, display_order) VALUES (?, ?, ?)',
                    [productId, features[i], i]
                );
            }
        }

        // Insert specifications
        if (specifications && Object.keys(specifications).length > 0) {
            let order = 0;
            for (const [key, value] of Object.entries(specifications)) {
                await db.run(
                    'INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES (?, ?, ?, ?)',
                    [productId, key, value, order++]
                );
            }
        }

        const newProduct = await getProductById(productId);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update product (admin only)
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, short_description, description, image, stock, features, specifications } = req.body;

        // Update product
        await db.run(
            `UPDATE products SET name = ?, price = ?, category = ?, short_description = ?, description = ?, image = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, price, category, short_description, description, image, stock, id]
        );

        // Delete old features and specs
        await db.run('DELETE FROM product_features WHERE product_id = ?', [id]);
        await db.run('DELETE FROM product_specifications WHERE product_id = ?', [id]);

        // Insert new features
        if (features && features.length > 0) {
            for (let i = 0; i < features.length; i++) {
                await db.run(
                    'INSERT INTO product_features (product_id, feature, display_order) VALUES (?, ?, ?)',
                    [id, features[i], i]
                );
            }
        }

        // Insert new specifications
        if (specifications && Object.keys(specifications).length > 0) {
            let order = 0;
            for (const [key, value] of Object.entries(specifications)) {
                await db.run(
                    'INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES (?, ?, ?, ?)',
                    [id, key, value, order++]
                );
            }
        }

        const updatedProduct = await getProductById(parseInt(id));
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE product (admin only)
app.delete('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ==================== WORKSHOPS ROUTES ====================

// GET all workshops
app.get('/api/workshops', async (req, res) => {
    try {
        const workshops = await db.all('SELECT * FROM workshops ORDER BY date');

        // Get instructor, outcomes, agenda, testimonials for each workshop
        for (let workshop of workshops) {
            const fullWorkshop = await getWorkshopById(workshop.id);
            Object.assign(workshop, fullWorkshop);
        }

        res.json(workshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single workshop
app.get('/api/workshops/:id', async (req, res) => {
    try {
        const workshop = await getWorkshopById(parseInt(req.params.id));
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }
        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new workshop (admin only)
app.post('/api/workshops', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, description, date, duration, location, price, category, image, outcomes, instructor_id, agenda, slots } = req.body;

        const result = await db.run(
            `INSERT INTO workshops (title, description, date, duration, location, price, category, image, instructor_id, slots)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, date, duration, location, price, category, image, instructor_id, slots || 20]
        );
        const workshopId = result.lastID;

        // Insert learning outcomes
        if (outcomes && outcomes.length > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await db.run(
                    'INSERT INTO workshop_learning_outcomes (workshop_id, outcome, display_order) VALUES (?, ?, ?)',
                    [workshopId, outcomes[i], i]
                );
            }
        }

        // Insert agenda
        if (agenda && agenda.length > 0) {
            for (let i = 0; i < agenda.length; i++) {
                await db.run(
                    'INSERT INTO workshop_agenda (workshop_id, time, activity, display_order) VALUES (?, ?, ?, ?)',
                    [workshopId, agenda[i].time, agenda[i].activity, i]
                );
            }
        }

        res.json({ id: workshopId, message: 'Workshop created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update workshop (admin only)
app.put('/api/workshops/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, description, date, duration, location, price, category, image, outcomes, instructor_id, agenda, slots } = req.body;

        // Keep existing slots if not provided (though form should provide it)
        await db.run(
            `UPDATE workshops 
             SET title = ?, description = ?, date = ?, duration = ?, location = ?, price = ?, category = ?, image = ?, instructor_id = ?, slots = ?
             WHERE id = ?`,
            [title, description, date, duration, location, price, category, image, instructor_id, slots, req.params.id]
        );

        // Delete old learning outcomes and insert new ones
        await db.run('DELETE FROM workshop_learning_outcomes WHERE workshop_id = ?', [req.params.id]);
        if (outcomes && outcomes.length > 0) {
            for (let i = 0; i < outcomes.length; i++) {
                await db.run(
                    'INSERT INTO workshop_learning_outcomes (workshop_id, outcome, display_order) VALUES (?, ?, ?)',
                    [req.params.id, outcomes[i], i]
                );
            }
        }

        // Delete old agenda and insert new ones
        await db.run('DELETE FROM workshop_agenda WHERE workshop_id = ?', [req.params.id]);
        if (agenda && agenda.length > 0) {
            for (let i = 0; i < agenda.length; i++) {
                await db.run(
                    'INSERT INTO workshop_agenda (workshop_id, time, activity, display_order) VALUES (?, ?, ?, ?)',
                    [req.params.id, agenda[i].time, agenda[i].activity, i]
                );
            }
        }

        res.json({ message: 'Workshop updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST book workshop
app.post('/api/workshops/:id/book', authenticateToken, async (req, res) => {
    try {
        const workshopId = req.params.id;
        const { tickets, totalPrice } = req.body;
        const userId = req.user.id;

        if (!tickets || tickets < 1) {
            return res.status(400).json({ error: 'Invalid ticket count' });
        }

        // Get workshop to check slots
        const workshop = await db.get('SELECT slots, price FROM workshops WHERE id = ?', [workshopId]);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        if (workshop.slots < tickets) {
            return res.status(400).json({ error: `Only ${workshop.slots} spots remaining` });
        }

        // Reduce slots
        await db.run('UPDATE workshops SET slots = slots - ? WHERE id = ?', [tickets, workshopId]);

        // Create booking
        await db.run(
            'INSERT INTO workshop_bookings (workshop_id, user_id, tickets, total_price) VALUES (?, ?, ?, ?)',
            [workshopId, userId, tickets, totalPrice]
        );

        res.json({ message: 'Booking successful', remainingSlots: workshop.slots - tickets });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: 'Booking failed: ' + error.message });
    }
});

// DELETE workshop (admin only)
app.delete('/api/workshops/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Admin attempting to delete workshop ID: ${id}`);

        const result = await db.run('DELETE FROM workshops WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        console.log(`Successfully deleted workshop ID: ${id}`);
        res.json({ message: 'Workshop deleted successfully' });
    } catch (error) {
        console.error('Error deleting workshop:', error);
        res.status(500).json({ error: 'Failed to delete workshop: ' + error.message });
    }
});

// GET workshop bookings (admin only)
app.get('/api/workshops/:id/bookings', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const bookings = await db.all(
            `SELECT wb.*, u.name as user_name, u.email as user_email
             FROM workshop_bookings wb
             JOIN users u ON wb.user_id = u.id
             WHERE wb.workshop_id = ?
             ORDER BY wb.booking_date DESC`,
            [req.params.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET event bookings (admin only)
app.get('/api/events/:id/bookings', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const bookings = await db.all(
            `SELECT 
                eb.id,
                eb.booking_date,
                eb.attendees,
                eb.status,
                u.name as user_name,
                u.email as user_email
             FROM event_bookings eb
             JOIN users u ON eb.user_id = u.id
             WHERE eb.event_id = ?
             ORDER BY eb.booking_date DESC`,
            [req.params.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== INSTRUCTORS ROUTES ====================

// GET all instructors
app.get('/api/instructors', async (req, res) => {
    try {
        const instructors = await db.all('SELECT * FROM instructors ORDER BY name');
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add new instructor (admin only)
app.post('/api/instructors', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, email, bio, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Instructor name is required' });
        }

        const result = await db.run(
            'INSERT INTO instructors (name, email, bio, image) VALUES (?, ?, ?, ?)',
            [name, email || "", bio || "", image || ""]
        );

        res.status(201).json({
            id: result.lastID,
            name,
            email,
            bio,
            image,
            message: 'Instructor added successfully'
        });
    } catch (error) {
        console.error('Error adding instructor:', error);
        res.status(500).json({ error: 'Failed to add instructor' });
    }
});


// ==================== SUBSCRIPTIONS ROUTES ====================

// Helper to get subscription details including features
async function getSubscriptionById(id) {
    const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ?', [id]);
    if (!subscription) return null;

    const features = await db.all(
        'SELECT feature FROM subscription_features WHERE subscription_id = ? ORDER BY display_order',
        [id]
    );
    subscription.features = features.map(f => f.feature);

    // Get average rating
    const rating = await db.get(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM subscription_reviews WHERE subscription_id = ?',
        [id]
    );
    subscription.rating = rating.avg_rating || 0;
    subscription.reviews_count = rating.count || 0;

    return subscription;
}

// GET all subscriptions
app.get('/api/subscriptions', async (req, res) => {
    try {
        const subscriptions = await db.all('SELECT * FROM subscriptions');

        for (let sub of subscriptions) {
            const features = await db.all(
                'SELECT feature FROM subscription_features WHERE subscription_id = ? ORDER BY display_order',
                [sub.id]
            );
            sub.features = features.map(f => f.feature);

            const rating = await db.get(
                'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM subscription_reviews WHERE subscription_id = ?',
                [sub.id]
            );
            sub.rating = rating.avg_rating || 0;
            sub.reviews_count = rating.count || 0;
        }

        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single subscription
app.get('/api/subscriptions/:id', async (req, res) => {
    try {
        const subscription = await getSubscriptionById(parseInt(req.params.id));
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new subscription (admin only)
app.post('/api/subscriptions', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, description, price, type, image, features } = req.body;

        const result = await db.run(
            `INSERT INTO subscriptions (name, description, price, type, image)
             VALUES (?, ?, ?, ?, ?)`,
            [name, description, price, type, image]
        );
        const subscriptionId = result.lastID;

        // Insert features
        if (features && features.length > 0) {
            for (let i = 0; i < features.length; i++) {
                await db.run(
                    'INSERT INTO subscription_features (subscription_id, feature, display_order) VALUES (?, ?, ?)',
                    [subscriptionId, features[i], i]
                );
            }
        }

        const newSubscription = await getSubscriptionById(subscriptionId);
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update subscription (admin only)
app.put('/api/subscriptions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, type, image, features } = req.body;

        await db.run(
            `UPDATE subscriptions 
             SET name = ?, description = ?, price = ?, type = ?, image = ?
             WHERE id = ?`,
            [name, description, price, type, image, id]
        );

        // Delete old features and insert new ones
        await db.run('DELETE FROM subscription_features WHERE subscription_id = ?', [id]);
        if (features && features.length > 0) {
            for (let i = 0; i < features.length; i++) {
                await db.run(
                    'INSERT INTO subscription_features (subscription_id, feature, display_order) VALUES (?, ?, ?)',
                    [id, features[i], i]
                );
            }
        }

        const updatedSubscription = await getSubscriptionById(parseInt(id));
        res.json(updatedSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE subscription (admin only)
app.delete('/api/subscriptions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Admin attempting to delete subscription ID: ${id}`);

        const result = await db.run('DELETE FROM subscriptions WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        console.log(`Successfully deleted subscription ID: ${id}`);
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).json({ error: 'Failed to delete subscription: ' + error.message });
    }
});

// POST subscribe (Authenticated user)
app.post('/api/subscriptions/:id/subscribe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const subscriptionId = req.params.id;
        const {
            frequency,
            box_size,
            delivery_day,
            delivery_date,
            delivery_address,
            delivery_city,
            delivery_state,
            delivery_zip,
            delivery_phone
        } = req.body;

        // Validate required address fields
        if (!delivery_address || !delivery_city || !delivery_state || !delivery_zip || !delivery_phone) {
            return res.status(400).json({ error: 'All delivery address fields are required' });
        }

        const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ?', [subscriptionId]);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Check if user has any existing subscription record (active or cancelled)
        const existing = await db.get(
            'SELECT * FROM user_subscriptions WHERE user_id = ? AND subscription_id = ?',
            [userId, subscriptionId]
        );

        if (existing) {
            // Check if already active
            if (existing.status === 'active') {
                return res.status(400).json({ error: 'Already subscribed to this plan' });
            }

            // Update existing record (resubscribing after cancellation)
            await db.run(
                `UPDATE user_subscriptions 
                SET status = "active",
                    frequency = ?,
                    box_size = ?,
                    delivery_day = ?,
                    delivery_date = ?,
                    delivery_address = ?,
                    delivery_city = ?,
                    delivery_state = ?,
                    delivery_zip = ?,
                    delivery_phone = ?,
                    start_date = CURRENT_TIMESTAMP
                WHERE user_id = ? AND subscription_id = ?`,
                [
                    frequency || 'monthly',
                    box_size || 'medium',
                    delivery_day ?? null,
                    delivery_date ?? null,
                    delivery_address,
                    delivery_city,
                    delivery_state,
                    delivery_zip,
                    delivery_phone,
                    userId,
                    subscriptionId
                ]
            );
        } else {
            // Create new subscription record
            await db.run(
                `INSERT INTO user_subscriptions 
                (user_id, subscription_id, frequency, box_size, delivery_day, delivery_date, 
                 delivery_address, delivery_city, delivery_state, delivery_zip, delivery_phone, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")`,
                [
                    userId,
                    subscriptionId,
                    frequency || 'monthly',
                    box_size || 'medium',
                    delivery_day ?? null,
                    delivery_date ?? null,
                    delivery_address,
                    delivery_city,
                    delivery_state,
                    delivery_zip,
                    delivery_phone
                ]
            );
        }

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST unsubscribe (Authenticated user)
app.post('/api/subscriptions/:id/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const subscriptionId = req.params.id;

        await db.run(
            'UPDATE user_subscriptions SET status = "cancelled" WHERE user_id = ? AND subscription_id = ?',
            [userId, subscriptionId]
        );

        res.json({ message: 'Subscription cancelled' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET subscription status for user
app.get('/api/subscriptions/:id/status', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const subscriptionId = req.params.id;

        // Get any subscription record (active or cancelled)
        const subscription = await db.get(
            'SELECT * FROM user_subscriptions WHERE user_id = ? AND subscription_id = ?',
            [userId, subscriptionId]
        );

        // Return subscription data and whether it's currently active
        res.json({
            isSubscribed: subscription && subscription.status === 'active',
            subscription
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET subscription reviews
app.get('/api/subscriptions/:id/reviews', async (req, res) => {
    try {
        const reviews = await db.all(
            `SELECT r.*, u.name as user_name 
             FROM subscription_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.subscription_id = ? 
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add subscription review (Subscriber only)
app.post('/api/subscriptions/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, review_text } = req.body;
        const subscriptionId = req.params.id;
        const userId = req.user.id;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if active subscriber
        const subCheck = await db.get(
            'SELECT id FROM user_subscriptions WHERE user_id = ? AND subscription_id = ? AND status = "active"',
            [userId, subscriptionId]
        );

        // Allow reviews if they have EVER subscribed, or strictly active? 
        // Requirement says "only user subscribed can leave a review". 
        // I'll interpret "subscribed" as currently active or previously subscribed (to be generous, but let's stick to 'active' or 'cancelled' record existence)
        // Let's actually check if they have a record at all (active or cancelled)
        const anySubCheck = await db.get(
            'SELECT id FROM user_subscriptions WHERE user_id = ? AND subscription_id = ?',
            [userId, subscriptionId]
        );

        if (!anySubCheck) {
            return res.status(403).json({ error: 'You must be a subscriber to leave a review' });
        }

        // Check if user already reviewed
        const existingReview = await db.get(
            'SELECT id FROM subscription_reviews WHERE subscription_id = ? AND user_id = ?',
            [subscriptionId, userId]
        );
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this subscription' });
        }

        // Insert review
        await db.run(
            'INSERT INTO subscription_reviews (subscription_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
            [subscriptionId, userId, rating, review_text]
        );

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update subscription review (Auth + Ownership)
app.put('/api/subscriptions/:subId/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { rating, review_text } = req.body;
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM subscription_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }

        // Update review
        await db.run(
            `UPDATE subscription_reviews 
             SET rating = COALESCE(?, rating), 
                 review_text = COALESCE(?, review_text)
             WHERE id = ?`,
            [rating, review_text, reviewId]
        );

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE subscription review (Auth + Ownership)
app.delete('/api/subscriptions/:subId/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM subscription_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await db.run('DELETE FROM subscription_reviews WHERE id = ?', [reviewId]);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET workshop reviews
app.get('/api/workshops/:id/reviews', async (req, res) => {
    try {
        const reviews = await db.all(
            `SELECT r.*, u.name as user_name 
             FROM workshop_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.workshop_id = ? 
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add workshop review (Enrolled only)
app.post('/api/workshops/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, review_title, review_text } = req.body;
        const workshopId = req.params.id;
        const userId = req.user.id;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if enrolled
        const enrollmentCheck = await db.get(
            'SELECT id FROM workshop_bookings WHERE user_id = ? AND workshop_id = ?',
            [userId, workshopId]
        );

        if (!enrollmentCheck) {
            return res.status(403).json({ error: 'You must be enrolled in this workshop to leave a review' });
        }

        // Check if user already reviewed
        const existingReview = await db.get(
            'SELECT id FROM workshop_reviews WHERE workshop_id = ? AND user_id = ?',
            [workshopId, userId]
        );
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this workshop' });
        }

        // Insert review
        await db.run(
            'INSERT INTO workshop_reviews (workshop_id, user_id, rating, review_title, review_text) VALUES (?, ?, ?, ?, ?)',
            [workshopId, userId, rating, review_title || '', review_text]
        );

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update workshop review (Auth + Ownership)
app.put('/api/workshops/:workshopId/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { rating, review_title, review_text } = req.body;
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM workshop_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }

        // Update review
        await db.run(
            `UPDATE workshop_reviews 
             SET rating = COALESCE(?, rating), 
                 review_title = COALESCE(?, review_title),
                 review_text = COALESCE(?, review_text)
             WHERE id = ?`,
            [rating, review_title, review_text, reviewId]
        );

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE workshop review (Auth + Ownership)
app.delete('/api/workshops/:workshopId/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM workshop_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await db.run('DELETE FROM workshop_reviews WHERE id = ?', [reviewId]);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// GET reviews for a product
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await db.all(
            `SELECT r.*, u.name as user_name 
             FROM product_reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = ? 
             ORDER BY r.created_at DESC`,
            [req.params.id]
        );
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add a review (Logged in users)
app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, review_title, review_text } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Word count check (approximate)
        const wordCount = review_text ? review_text.trim().split(/\s+/).length : 0;
        if (wordCount > 100) {
            return res.status(400).json({ error: 'Review text must be under 100 words' });
        }

        // Check if user has purchased the product
        const purchaseCheck = await db.get(
            `SELECT oi.id 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'`,
            [userId, productId]
        );

        if (!purchaseCheck) {
            return res.status(403).json({ error: 'You must purchase this product to leave a review' });
        }

        // Check if user already reviewed
        const existingReview = await db.get(
            'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
            [productId, userId]
        );
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        // Insert review
        await db.run(
            `INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text) 
             VALUES (?, ?, ?, ?, ?)`,
            [productId, userId, rating, review_title, review_text]
        );

        // Update product rating stats
        const stats = await db.get(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
             FROM product_reviews WHERE product_id = ?`,
            [productId]
        );

        await db.run(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [stats.avg_rating || 0, stats.count || 0, productId]
        );

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update a review (Auth + Ownership)
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const { rating, review_title, review_text } = req.body;
        const reviewId = req.params.id;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }

        // Validation
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const wordCount = review_text ? review_text.trim().split(/\s+/).length : 0;
        if (wordCount > 100) {
            return res.status(400).json({ error: 'Review text must be under 100 words' });
        }

        // Update review
        await db.run(
            `UPDATE product_reviews 
             SET rating = COALESCE(?, rating), 
                 review_title = COALESCE(?, review_title), 
                 review_text = COALESCE(?, review_text),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [rating, review_title, review_text, reviewId]
        );

        // Update product stats
        const stats = await db.get(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
             FROM product_reviews WHERE product_id = ?`,
            [review.product_id]
        );

        await db.run(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [stats.avg_rating || 0, stats.count || 0, review.product_id]
        );

        res.json({ message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a review (Auth + Ownership)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        // Check ownership
        const review = await db.get('SELECT * FROM product_reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        // Delete review
        await db.run('DELETE FROM product_reviews WHERE id = ?', [reviewId]);

        // Update product stats
        const stats = await db.get(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
             FROM product_reviews WHERE product_id = ?`,
            [review.product_id]
        );

        await db.run(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [stats.avg_rating || 0, stats.count || 0, review.product_id]
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EVENTS & WORKSHOPS MANAGEMENT ====================

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await db.all('SELECT * FROM events ORDER BY date DESC');

        // Fetch related data for each event
        for (let event of events) {
            const highlights = await db.all('SELECT highlight FROM event_highlights WHERE event_id = ? ORDER BY display_order', [event.id]);
            const agenda = await db.all('SELECT time, activity FROM event_agenda WHERE event_id = ? ORDER BY display_order', [event.id]);
            const speakers = await db.all('SELECT name, role, image FROM event_speakers WHERE event_id = ? ORDER BY display_order', [event.id]);

            event.highlights = highlights.map(h => h.highlight);
            event.agenda = agenda;
            event.speakers = speakers;

            // Get booking count
            const bookingsCount = await db.get('SELECT COUNT(*) as count FROM event_bookings WHERE event_id = ?', [event.id]);
            event.booking_count = bookingsCount.count || 0;
        }

        res.json(events);
    } catch (error) {
        console.error('Error fetching events from DB:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = await db.get('SELECT * FROM events WHERE id = ?', [eventId]);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Fetch related data
        const highlights = await db.all('SELECT highlight FROM event_highlights WHERE event_id = ? ORDER BY display_order', [eventId]);
        const agenda = await db.all('SELECT time, activity FROM event_agenda WHERE event_id = ? ORDER BY display_order', [eventId]);
        const speakers = await db.all('SELECT name, role, image FROM event_speakers WHERE event_id = ? ORDER BY display_order', [eventId]);

        res.json({
            ...event,
            highlights: highlights.map(h => h.highlight),
            agenda: agenda,
            speakers: speakers
        });
    } catch (error) {
        console.error('Error fetching event from DB:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST create new event (Admin only)
app.post('/api/events', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, date, location, description, category, price, image, slots, highlights, agenda, speakers } = req.body;

        const result = await db.run(
            `INSERT INTO events (title, date, location, description, category, price, image, slots)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, date, location, description, category, price, image, slots || 50]
        );
        const eventId = result.lastID;

        // Insert highlights
        if (highlights && Array.isArray(highlights)) {
            for (let i = 0; i < highlights.length; i++) {
                if (highlights[i].trim()) {
                    await db.run(
                        'INSERT INTO event_highlights (event_id, highlight, display_order) VALUES (?, ?, ?)',
                        [eventId, highlights[i], i]
                    );
                }
            }
        }

        // Insert agenda
        if (agenda && Array.isArray(agenda)) {
            for (let i = 0; i < agenda.length; i++) {
                if (agenda[i].time && agenda[i].activity) {
                    await db.run(
                        'INSERT INTO event_agenda (event_id, time, activity, display_order) VALUES (?, ?, ?, ?)',
                        [eventId, agenda[i].time, agenda[i].activity, i]
                    );
                }
            }
        }

        // Insert speakers
        if (speakers && Array.isArray(speakers)) {
            for (let i = 0; i < speakers.length; i++) {
                if (speakers[i].name) {
                    await db.run(
                        'INSERT INTO event_speakers (event_id, name, role, image, display_order) VALUES (?, ?, ?, ?, ?)',
                        [eventId, speakers[i].name, speakers[i].role || "", speakers[i].image || "", i]
                    );
                }
            }
        }

        res.status(201).json({ id: eventId, message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event: ' + error.message });
    }
});

// POST book event
app.post('/api/events/:id/book', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { attendees } = req.body;
        const userId = req.user.id;

        if (!attendees || attendees < 1) {
            return res.status(400).json({ error: 'Invalid attendee count' });
        }

        // Get event to check slots
        const event = await db.get('SELECT slots FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.slots < attendees) {
            return res.status(400).json({ error: `Only ${event.slots} spots remaining` });
        }

        // Reduce slots
        await db.run('UPDATE events SET slots = slots - ? WHERE id = ?', [attendees, eventId]);

        // Create booking
        await db.run(
            'INSERT INTO event_bookings (user_id, event_id, attendees) VALUES (?, ?, ?)',
            [userId, eventId, attendees]
        );

        res.json({ message: 'Booking successful', remainingSlots: event.slots - attendees });
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ error: 'Booking failed: ' + error.message });
    }
});

// PUT update event by ID (Admin only)
app.put('/api/events/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const eventId = parseInt(req.params.id);
    const { title, date, location, description, category, price, image, slots, highlights, agenda, speakers } = req.body;

    try {
        const existingEvent = await db.get('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 1. Update main events table
        await db.run(
            `UPDATE events SET 
                title = ?, date = ?, location = ?, description = ?, 
                category = ?, price = ?, image = ?, slots = ? 
             WHERE id = ?`,
            [
                title || existingEvent.title,
                date || existingEvent.date,
                location || existingEvent.location,
                description || existingEvent.description,
                category || existingEvent.category,
                price !== undefined ? price : existingEvent.price,
                image || existingEvent.image,
                slots || existingEvent.slots,
                eventId
            ]
        );

        // 2. Synchronize Highlights (if provided)
        if (highlights && Array.isArray(highlights)) {
            await db.run('DELETE FROM event_highlights WHERE event_id = ?', [eventId]);
            for (let i = 0; i < highlights.length; i++) {
                if (highlights[i].trim()) {
                    await db.run(
                        'INSERT INTO event_highlights (event_id, highlight, display_order) VALUES (?, ?, ?)',
                        [eventId, highlights[i], i]
                    );
                }
            }
        }

        // 3. Synchronize Agenda (if provided)
        if (agenda && Array.isArray(agenda)) {
            await db.run('DELETE FROM event_agenda WHERE event_id = ?', [eventId]);
            for (let i = 0; i < agenda.length; i++) {
                if (agenda[i].time && agenda[i].activity) {
                    await db.run(
                        'INSERT INTO event_agenda (event_id, time, activity, display_order) VALUES (?, ?, ?, ?)',
                        [eventId, agenda[i].time, agenda[i].activity, i]
                    );
                }
            }
        }

        // 4. Synchronize Speakers (if provided)
        if (speakers && Array.isArray(speakers)) {
            await db.run('DELETE FROM event_speakers WHERE event_id = ?', [eventId]);
            for (let i = 0; i < speakers.length; i++) {
                if (speakers[i].name) {
                    await db.run(
                        'INSERT INTO event_speakers (event_id, name, role, image, display_order) VALUES (?, ?, ?, ?, ?)',
                        [eventId, speakers[i].name, speakers[i].role || '', speakers[i].image || '', i]
                    );
                }
            }
        }

        res.json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event in DB:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE single event by ID (Admin only)
app.delete('/api/events/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log(`Admin attempting to delete event ID: ${eventId}`);

        // Delete the event (related data like highlights, agenda, speakers are handled by ON DELETE CASCADE in schema)
        // Bookings are now also handled by ON DELETE CASCADE
        const result = await db.run('DELETE FROM events WHERE id = ?', [eventId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        console.log(`Successfully deleted event ID: ${eventId}`);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event: ' + error.message });
    }
});


// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET http://localhost:${PORT}/api/products`);
    console.log(`   GET http://localhost:${PORT}/api/events`);
    console.log(`   GET http://localhost:${PORT}/api/workshops`);
});
