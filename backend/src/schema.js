const formSchema = {
    title: "Employee Onboarding",
    description: "Please fill out the following details to complete your onboarding process.",
    fields: [
        {
            id: "fullName",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true,
            validation: {
                minLength: 2,
                maxLength: 50
            }
        },
        {
            id: "email",
            type: "text",
            label: "Email Address",
            placeholder: "Enter your email",
            required: true,
            validation: {
                regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            }
        },
        {
            id: "age",
            type: "number",
            label: "Age",
            placeholder: "Enter your age",
            required: true,
            validation: {
                min: 18,
                max: 100
            }
        },
        {
            id: "department",
            type: "select",
            label: "Department",
            placeholder: "Select your department",
            required: true,
            options: [
                { value: "engineering", label: "Engineering" },
                { value: "design", label: "Design" },
                { value: "marketing", label: "Marketing" },
                { value: "hr", label: "Human Resources" }
            ]
        },
        {
            id: "skills",
            type: "multi-select",
            label: "Skills",
            placeholder: "Select your skills",
            required: false,
            options: [
                { value: "react", label: "React" },
                { value: "node", label: "Node.js" },
                { value: "python", label: "Python" },
                { value: "java", label: "Java" },
                { value: "sql", label: "SQL" }
            ],
            validation: {
                minSelected: 1,
                maxSelected: 5
            }
        },
        {
            id: "startDate",
            type: "date",
            label: "Start Date",
            required: true,
            validation: {
                minDate: "2023-01-01" // Example dynamic date validation could be handled in code if needed
            }
        },
        {
            id: "bio",
            type: "textarea",
            label: "Bio",
            placeholder: "Tell us a bit about yourself",
            required: false,
            validation: {
                maxLength: 500
            }
        },
        {
            id: "remote",
            type: "switch",
            label: "Remote Work",
            required: false
        }
    ]
};

module.exports = { formSchema };
