const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('./storage');
const { formSchema } = require('./schema');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// GET /api/form-schema
app.get('/api/form-schema', (req, res) => {
    res.json(formSchema);
});

// Helper to validate submission against schema
const validateSubmission = (submission, schema) => {
    const errors = {};

    schema.fields.forEach(field => {
        const value = submission[field.id];

        // Required check
        if (field.required && (value === undefined || value === null || value === '')) {
            errors[field.id] = `${field.label} is required`;
            return;
        }

        if (value !== undefined && value !== null && value !== '') {
            // Type check (basic)
            if (field.type === 'number' && isNaN(Number(value))) {
                errors[field.id] = `${field.label} must be a number`;
            }

            // Validation rules
            if (field.validation) {
                if (field.validation.minLength && String(value).length < field.validation.minLength) {
                    errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
                }
                if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
                    errors[field.id] = `${field.label} must be at most ${field.validation.maxLength} characters`;
                }
                if (field.validation.min && Number(value) < field.validation.min) {
                    errors[field.id] = `${field.label} must be at least ${field.validation.min}`;
                }
                if (field.validation.max && Number(value) > field.validation.max) {
                    errors[field.id] = `${field.label} must be at most ${field.validation.max}`;
                }
                if (field.validation.regex && !new RegExp(field.validation.regex).test(value)) {
                    errors[field.id] = `${field.label} is invalid`;
                }
                if (field.type === 'multi-select') {
                    if (!Array.isArray(value)) {
                        errors[field.id] = `${field.label} must be selected`;
                    } else {
                        if (field.validation.minSelected && value.length < field.validation.minSelected) {
                            errors[field.id] = `Select at least ${field.validation.minSelected} options`;
                        }
                        if (field.validation.maxSelected && value.length > field.validation.maxSelected) {
                            errors[field.id] = `Select at most ${field.validation.maxSelected} options`;
                        }
                    }
                }
            }
        }
    });

    return errors;
};

// POST /api/submissions
app.post('/api/submissions', (req, res) => {
    const submission = req.body;
    const errors = validateSubmission(submission, formSchema);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    const db = readDb();
    const newSubmission = {
        id: uuidv4(),
        ...submission,
        createdAt: new Date().toISOString()
    };

    db.submissions.push(newSubmission);
    writeDb(db);

    res.status(201).json({ success: true, id: newSubmission.id, createdAt: newSubmission.createdAt });
});

// PUT /api/submissions/:id
app.put('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDb();
    const index = db.submissions.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Validate updates (merge with existing to ensure required fields aren't missing if partial update, 
    // but for this assignment we assume full update or we validate the merged object)
    const existingSubmission = db.submissions[index];
    const mergedSubmission = { ...existingSubmission, ...updates };

    // We exclude id and createdAt from validation as they are system fields
    const errors = validateSubmission(mergedSubmission, formSchema);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    db.submissions[index] = mergedSubmission;
    writeDb(db);

    res.json({ success: true, id });
});

// DELETE /api/submissions/:id
app.delete('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const initialLength = db.submissions.length;
    db.submissions = db.submissions.filter(s => s.id !== id);

    if (db.submissions.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    writeDb(db);
    res.json({ success: true, message: 'Submission deleted' });
});

// GET /api/submissions
app.get('/api/submissions', (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;

    const db = readDb();
    let submissions = [...db.submissions];

    // Search
    if (search) {
        const searchLower = search.toLowerCase();
        submissions = submissions.filter(s =>
            s.fullName.toLowerCase().includes(searchLower) ||
            s.email.toLowerCase().includes(searchLower) ||
            s.department.toLowerCase().includes(searchLower)
        );
    }

    // Sorting
    submissions.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;

    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    res.json({
        submissions: paginatedSubmissions,
        total: submissions.length,
        page: pageInt,
        totalPages: Math.ceil(submissions.length / limitInt)
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
