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
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// --- 2. DATABASE & SCHEMA ---
mongoose.connect('mongodb://localhost:27017/dbilaArt')
  .then(() => {
    console.log("L-Moteur kheddam ✅");
    seedDatabase(); // <--- HNA FIN GHADI T-3MMER L-BASE BO7DHA
  })
  .catch(err => console.log("Erreur Connection ❌", err));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
}));

// --- 3. AUTO-SEED FUNCTION ---
async function seedDatabase() {
    const count = await Product.countDocuments();
    if (count === 0) {
        console.log("Base de données khawya. Chargement des pièces...");
        const demoProducts = [
            {
                name: "Amphore de Marrakech",
                price: 850,
                description: "Terre cuite brute, design ancestral.",
                images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800"]
            },
            {
                name: "Vase Atlas Minimalist",
                price: 1200,
                description: "Finition blanche sablée, moderne.",
                images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800"]
            }
        ];
        await Product.insertMany(demoProducts);
        console.log("Base de données 3mrat b nja7! 🏺");
    }
}

// --- 4. ROUTES ---

// Get Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json(err); }
});

// Post Product
const upload = multer({ dest: 'uploads/' });
app.post('/api/products', upload.array('files'), async (req, res) => {
    try {
        const imageUrls = req.files.map(f => `http://localhost:8080/uploads/${f.filename}`);
        const newP = new Product({...req.body, images: imageUrls});
        await newP.save();
        res.json(newP);
    } catch (err) { res.status(500).json(err); }
});


app.listen(8080, () => console.log("🚀 Server kheddam f Port 8080"));