const axios = require('axios');
const FormData = require('form-data');

exports.analyzeRaster = async (req, res) => {
    try {
        // 1. Check if React actually sent a file
        if (!req.file) {
            return res.status(400).json({ error: 'No satellite image provided' });
        }

        // 2. Package the image buffer into form-data for Python
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // 3. Fire it over to the local Python FastAPI server (Port 8000)
        const aiResponse = await axios.post('http://127.0.0.1:8000/api/ai/analyze-raster', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // 4. Send the YOLOv8 math results straight back to React
        res.json(aiResponse.data);

    } catch (error) {
        console.error("AI Proxy Error:", error.message);
        res.status(500).json({
            error: "Failed to connect to Python AI Engine",
            details: error.message
        });
    }
};