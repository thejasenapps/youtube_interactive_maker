import 'dotenv/config';
import express from 'express';
import handler from './api/analyze.js';

const app = express();

app.use(express.json());

let responseSent = false;

app.post('/api/analyze', async (req, res) => {
    responseSent = false;

    const send = (data) => {
        if ( responseSent ) return;
        res.write(JSON.stringify(data) + '\n');
    };

    const end = (data) => {
        if ( responseSent ) return;
        responseSent = true;
        if ( data ) {
            res.write(JSON.stringify(data) + '\n');
        }
        res.end();      
    }

    const error= (message, code = 500) => {
        if ( responseSent ) return;
        responseSent = true;
        res.status(code).json({ error: message });
    };

    try {

        req.sendChunk = send;
        req.endResponse = end;
        req.sendError = error;

        await handler(req, res);

    } catch (err) {
        error('Server error: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.json({ status: 'Youtube Analyzer API is running', test: 'POST /api/analyze {videoId: "jNQXAC9IVRw"}' });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log('\nAPI is running on http://localhost:' + PORT + '\n');
    console.log('Test with:\n');
    console.log(`curl -X POST http://localhost:${PORT}/api/analyze -H "Content-Type: application/json" -d '{"videoId":"jNQXAC9IVRw"}'\n`);
})