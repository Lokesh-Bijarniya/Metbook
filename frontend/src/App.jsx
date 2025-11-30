import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DynamicForm from './components/DynamicForm';
import SubmissionsTable from './components/SubmissionsTable';
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from "./components/mode-toggle"
import { Toaster } from "sonner"

const queryClient = new QueryClient();

function App() {
  const [view, setView] = React.useState('form'); // 'form' or 'submissions'
  const [editingSubmission, setEditingSubmission] = React.useState(null);

  const handleEdit = (submission) => {
    setEditingSubmission(submission);
    setView('form');
  };

  const handleSuccess = () => {
    setEditingSubmission(null);
    setView('submissions');
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {view === 'form' ? (editingSubmission ? 'Edit Submission' : 'Employee Onboarding') : 'Submissions'}
              </h1>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingSubmission(null);
                      setView('form');
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${view === 'form' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    Form
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubmission(null);
                      setView('submissions');
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${view === 'submissions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    Submissions
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border">
              <div className="p-6">
                {view === 'form' ? (
                  <DynamicForm
                    onSuccess={handleSuccess}
                    initialData={editingSubmission}
                  />
                ) : (
                  <SubmissionsTable onEdit={handleEdit} />
                )}
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
