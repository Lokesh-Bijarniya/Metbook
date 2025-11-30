import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchSchema = async () => {
    const { data } = await axios.get(`${API_URL}/api/form-schema`);
    return data;
};

const submitForm = async ({ data, id }) => {
    if (id) {
        const { data: response } = await axios.put(`${API_URL}/api/submissions/${id}`, data);
        return response;
    } else {
        const { data: response } = await axios.post(`${API_URL}/api/submissions`, data);
        return response;
    }
};

export default function DynamicForm({ onSuccess, initialData }) {
    const queryClient = useQueryClient();
    const { data: schema, isLoading, error } = useQuery({
        queryKey: ['formSchema'],
        queryFn: fetchSchema,
    });

    const mutation = useMutation({
        mutationFn: submitForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success(initialData ? "Submission updated successfully" : "Form submitted successfully");
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    });

    const form = useForm({
        defaultValues: initialData || {},
        onSubmit: async ({ value }) => {
            try {
                await mutation.mutateAsync({ data: value, id: initialData?.id });
            } catch (e) {
                console.error(e);
            }
        },
        validators: {
            onChange: ({ value }) => {
                return undefined;
            }
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-destructive p-8">Error loading form schema</div>;

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
                <CardTitle>{schema.title}</CardTitle>
                <CardDescription>{schema.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {mutation.isError && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
                        {mutation.error.response?.data?.errors ? (
                            <ul className="list-disc pl-5">
                                {Object.entries(mutation.error.response.data.errors).map(([field, msg]) => (
                                    <li key={field}>{msg}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>Something went wrong. Please try again.</p>
                        )}
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-6"
                >
                    {schema.fields.map((field) => (
                        <form.Field
                            key={field.id}
                            name={field.id}
                            validators={{
                                onChange: ({ value }) => {
                                    if (field.required && !value) return `${field.label} is required`;
                                    if (field.type === 'number' && value && isNaN(Number(value))) return 'Must be a number';
                                    return undefined;
                                }
                            }}
                        >
                            {(fieldApi) => (
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor={field.id}>
                                        {field.label} {field.required && <span className="text-destructive">*</span>}
                                    </Label>

                                    {renderField(field, fieldApi)}

                                    {fieldApi.state.meta.errors ? (
                                        <p className="text-sm text-destructive">{fieldApi.state.meta.errors.join(', ')}</p>
                                    ) : null}
                                </div>
                            )}
                        </form.Field>
                    ))}

                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        {initialData ? 'Update Submission' : 'Submit'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function renderField(field, fieldApi) {
    const { state, handleChange, handleBlur } = fieldApi;
    const value = state.value || '';

    const commonProps = {
        id: field.id,
        name: field.id,
        onBlur: handleBlur,
    };

    switch (field.type) {
        case 'text':
        case 'number':
        case 'date':
            return (
                <Input
                    type={field.type}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={field.placeholder}
                    {...commonProps}
                />
            );

        case 'textarea':
            return (
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    {...commonProps}
                />
            );

        case 'select':
            return (
                <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    {...commonProps}
                >
                    <option value="">Select an option</option>
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case 'switch':
            return (
                <div className="flex items-center">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={!!value}
                        onClick={() => handleChange(!value)}
                        className={`${value ? 'bg-primary' : 'bg-input'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                    >
                        <span
                            aria-hidden="true"
                            className={`${value ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
            );

        case 'multi-select':
            const selectedValues = Array.isArray(value) ? value : [];
            return (
                <div className="space-y-2">
                    {field.options?.map((opt) => (
                        <label key={opt.value} className="inline-flex items-center mr-4">
                            <input
                                type="checkbox"
                                value={opt.value}
                                checked={selectedValues.includes(opt.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        handleChange([...selectedValues, opt.value]);
                                    } else {
                                        handleChange(selectedValues.filter(v => v !== opt.value));
                                    }
                                }}
                                className="rounded border-input text-primary shadow-sm focus:border-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-foreground">{opt.label}</span>
                        </label>
                    ))}
                </div>
            );

        default:
            return null;
    }
}
