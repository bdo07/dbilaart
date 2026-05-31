const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// --- 1. MIDDLEWARES ---
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Dir create l-dossier uploads ila makhdamch
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    console.log("Dossier /uploads créé ✅");
}

// --- 2. DATABASE CONNECTION & SCHEMA ---
mongoose.connect('mongodb://localhost:27017/dbilaArt')
  .then(() => {
    console.log("L-Moteur kheddam (MongoDB) ✅");
    seedDatabase(); 
  })
  .catch(err => console.log("Erreur Connection ❌", err));

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String],
    inStock: { type: Boolean, default: true }, // Logic dial En Stock
    createdAt: { type: Date, default: Date.now }
});

// Bach may-trach error dial "Overwrite Model"
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// --- 3. AUTO-SEED (Bach may-kounch s-site khawi) ---
async function seedDatabase() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("Base khawya. Chargement des pièces de test...");
            const demoProducts = [
                {
                    name: "Amphore de Marrakech",
                    price: 850,
                    description: "Terre cuite brute, design ancestral.",
                    inStock: true,
                    images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800"]
                },
                {
                    name: "Vase Atlas Minimalist",
                    price: 1200,
                    description: "Finition blanche sablée, moderne.",
                    inStock: false,
                    images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800"]
                }
            ];
            await Product.insertMany(demoProducts);
            console.log("Base de données 3mrat b nja7! 🏺");
        }
    } catch (err) {
        console.log("Erreur Seed:", err);
    }
}

// --- 4. MULTER CONFIG (Bach s-tsawer i-kouno m9adin) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        cb(null, 'dbila-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- 5. ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new product
app.post('/api/products', upload.array('files', 5), async (req, res) => {
    try {
        const imageUrls = req.files ? req.files.map(f => `http://localhost:8080/uploads/${f.filename}`) : [];
        
        const newProduct = new Product({
            name: req.body.name,
            price: Number(req.body.price),
            description: req.body.description,
            inStock: req.body.inStock === 'true' || req.body.inStock === true,
            images: imageUrls
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product (Stock/Info)
app.put('/api/products/:id', upload.array('files', 5), async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        // Ila zad s-tsawer jdad
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `http://localhost:8080/uploads/${f.filename}`);
            updateData.images = newImages;
        }

        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "Supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. START SERVER ---
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`--------------------------------`);
    console.log(`🚀 Dbila API on Port ${PORT}`);
    console.log(`🏺 L-Moteur kheddam ✅`);
    console.log(`--------------------------------`);
});