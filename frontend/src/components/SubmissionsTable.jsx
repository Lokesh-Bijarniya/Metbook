import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Download, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchSubmissions = async ({ page, limit, sortBy, sortOrder, search }) => {
    const { data } = await axios.get(`${API_URL}/api/submissions`, {
        params: { page, limit, sortBy, sortOrder, search },
    });
    return data;
};

const deleteSubmission = async (id) => {
    const { data } = await axios.delete(`${API_URL}/api/submissions/${id}`);
    return data;
};

const columnHelper = createColumnHelper();

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function SubmissionsTable({ onEdit }) {
    const queryClient = useQueryClient();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, error } = useQuery({
        queryKey: ['submissions', pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch],
        queryFn: () =>
            fetchSubmissions({
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                sortBy: sorting[0]?.id || 'createdAt',
                sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
                search: debouncedSearch,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSubmission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success("Submission deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete submission");
        }
    });

    const handleExportCSV = () => {
        if (!data?.submissions) return;

        const headers = ['ID', 'Full Name', 'Email', 'Department', 'Submitted At'];
        const rows = data.submissions.map(s => [
            s.id,
            s.fullName,
            s.email,
            s.department,
            new Date(s.createdAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'submissions.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV exported successfully");
        }
    };

    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: (info) => <span className="font-mono text-xs text-muted-foreground">{info.getValue().slice(0, 8)}...</span>,
            enableSorting: false,
        }),
        columnHelper.accessor('fullName', {
            header: 'Full Name',
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor('email', {
            header: 'Email',
        }),
        columnHelper.accessor('department', {
            header: 'Department',
            cell: (info) => <span className="capitalize px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Submitted At',
            cell: (info) => <span className="text-muted-foreground text-sm">{new Date(info.getValue()).toLocaleString()}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(info.row.original)}
                        title="Edit"
                    >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            toast("Are you sure?", {
                                action: {
                                    label: "Delete",
                                    onClick: () => deleteMutation.mutate(info.row.original.id)
                                },
                            })
                        }}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                </div>
            )
        })
    ];

    const table = useReactTable({
        data: data?.submissions || [],
        columns,
        pageCount: data?.totalPages || -1,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-destructive p-8">Error loading submissions</div>;

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 px-0">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search submissions..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80 transition-colors"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <ArrowUp className="w-4 h-4" />,
                                                        desc: <ArrowDown className="w-4 h-4" />,
                                                    }[header.column.getIsSorted()] ?? (header.column.getCanSort() ? <ArrowUpDown className="w-4 h-4 text-muted-foreground/50" /> : null)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-muted-foreground">
                                            No submissions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of {data?.totalPages || 1}
                        </span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value))
                            }}
                            className="border rounded p-1 text-sm bg-background text-foreground"
                        >
                            {[10, 20, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
