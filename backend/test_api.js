const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testApi() {
    try {
        console.log('Testing GET /form-schema...');
        const schemaRes = await axios.get(`${API_URL}/form-schema`);
        if (schemaRes.status === 200 && schemaRes.data.title === 'Employee Onboarding') {
            console.log('✅ GET /form-schema passed');
        } else {
            console.error('❌ GET /form-schema failed', schemaRes.data);
        }

        console.log('\nTesting POST /submissions (Valid)...');
        const validSubmission = {
            fullName: 'John Doe',
            email: 'john@example.com',
            age: 30,
            department: 'engineering',
            skills: ['react', 'node'],
            startDate: '2023-11-01',
            bio: 'Software Engineer',
            remote: true
        };
        const submitRes = await axios.post(`${API_URL}/submissions`, validSubmission);
        if (submitRes.status === 201 && submitRes.data.success) {
            console.log('✅ POST /submissions (Valid) passed');
        } else {
            console.error('❌ POST /submissions (Valid) failed', submitRes.data);
        }

        console.log('\nTesting POST /submissions (Invalid)...');
        const invalidSubmission = {
            fullName: 'J', // Too short
            email: 'invalid-email',
            age: 10, // Too young
            department: 'engineering',
            skills: [], // Min selected 1
            startDate: '2023-11-01'
        };
        try {
            await axios.post(`${API_URL}/submissions`, invalidSubmission);
            console.error('❌ POST /submissions (Invalid) failed - Should have returned 400');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ POST /submissions (Invalid) passed');
                console.log('Errors:', error.response.data.errors);
            } else {
                console.error('❌ POST /submissions (Invalid) failed with unexpected error', error.message);
            }
        }

        console.log('\nTesting GET /submissions...');
        const submissionsRes = await axios.get(`${API_URL}/submissions`);
        if (submissionsRes.status === 200 && Array.isArray(submissionsRes.data.submissions)) {
            console.log('✅ GET /submissions passed');
            console.log(`Total submissions: ${submissionsRes.data.total}`);

            if (submissionsRes.data.submissions.length > 0) {
                const submissionId = submissionsRes.data.submissions[0].id;

                console.log(`\nTesting PUT /submissions/${submissionId}...`);
                const updateData = { fullName: 'Jane Doe Updated' };
                const updateRes = await axios.put(`${API_URL}/submissions/${submissionId}`, updateData);
                if (updateRes.status === 200 && updateRes.data.success) {
                    console.log('✅ PUT /submissions/:id passed');
                } else {
                    console.error('❌ PUT /submissions/:id failed', updateRes.data);
                }

                console.log(`\nTesting DELETE /submissions/${submissionId}...`);
                const deleteRes = await axios.delete(`${API_URL}/submissions/${submissionId}`);
                if (deleteRes.status === 200 && deleteRes.data.success) {
                    console.log('✅ DELETE /submissions/:id passed');
                } else {
                    console.error('❌ DELETE /submissions/:id failed', deleteRes.data);
                }
            }
        } else {
            console.error('❌ GET /submissions failed', submissionsRes.data);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testApi();
