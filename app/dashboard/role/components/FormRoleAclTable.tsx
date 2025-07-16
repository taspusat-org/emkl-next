import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import React, { useMemo, useState } from 'react';
import {
  FaPlus,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaTimes,
  FaTrash
} from 'react-icons/fa';

interface Invoice {
  invoice: string;
  paymentStatus: string;
  totalAmount: string;
  paymentMethod: string;
  isNew?: boolean;
}

const FormRoleAclTable = ({ popOverTable, setPopOverTable }: any) => {
  const [filters, setFilters] = useState({
    filters: {
      invoice: '',
      paymentStatus: '',
      totalAmount: '',
      paymentMethod: ''
    },
    sortBy: '',
    sortDirection: 'asc',
    globalSearch: ''
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      invoice: 'INV001',
      paymentStatus: 'Paid',
      totalAmount: '$250.00',
      paymentMethod: 'Credit Card'
    },
    {
      invoice: 'INV002',
      paymentStatus: 'Pending',
      totalAmount: '$150.00',
      paymentMethod: 'PayPal'
    },
    {
      invoice: 'INV003',
      paymentStatus: 'Unpaid',
      totalAmount: '$350.00',
      paymentMethod: 'Bank Transfer'
    }
  ]);

  const addRow = () => {
    const newInvoice = {
      invoice: '',
      paymentStatus: '',
      totalAmount: '',
      paymentMethod: '',
      isNew: true // Tandai sebagai data baru
    };

    setInvoices((prevInvoices) => [...prevInvoices, newInvoice]);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setInvoices((prevInvoices) => {
      const updatedInvoices = [...prevInvoices];

      updatedInvoices[index][field] = value;

      if (
        updatedInvoices[index].isNew &&
        Object.values(updatedInvoices[index]).every((val) => val !== '')
      ) {
        updatedInvoices[index].isNew = false;
      }

      return updatedInvoices;
    });
  };

  const deleteRow = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  const handleGlobalSearchChange = (value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      globalSearch: value
    }));
  };

  const handleColumnFilterChange = (field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filters: {
        ...prevFilters.filters,
        [field]: value
      }
    }));
  };

  const handleSort = (column: string) => {
    const newSortDirection =
      filters.sortBy === column && filters.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    setFilters((prevFilters) => ({
      ...prevFilters,
      sortBy: column,
      sortDirection: newSortDirection
    }));
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const globalMatch = Object.values(invoice)
        .join(' ')
        .toLowerCase()
        .includes(filters.globalSearch.toLowerCase());

      const columnMatch = Object.keys(filters.filters).every(
        (key) =>
          invoice[key as keyof Invoice]
            ?.toString()
            .toLowerCase()
            .includes(filters.filters[key]?.toLowerCase() || '')
      );

      return globalMatch && columnMatch;
    });
  }, [invoices, filters]);

  const sortedInvoices = useMemo(() => {
    const existingInvoices = filteredInvoices.filter(
      (invoice) => !Object.values(invoice).some((val) => val === '') // Data lengkap dianggap existing
    );

    const newInvoices = filteredInvoices.filter(
      (invoice) => Object.values(invoice).some((val) => val === '') // Data tidak lengkap dianggap baru
    );

    // Sort hanya data existing
    const sortedExisting = existingInvoices.sort((a, b) => {
      const column = filters.sortBy as keyof Invoice;
      const direction = filters.sortDirection === 'asc' ? 1 : -1;

      const valueA = a[column]?.toString().toLowerCase() || '';
      const valueB = b[column]?.toString().toLowerCase() || '';

      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });

    // Gabungkan data existing dan data baru
    return [...sortedExisting, ...newInvoices];
  }, [filteredInvoices, filters.sortBy, filters.sortDirection]);

  const highlightText = (text: string, filter: string) => {
    if (!filter) return text;

    const regex = new RegExp(`(${filter})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-black">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };
  return (
    <Dialog open={popOverTable} onOpenChange={setPopOverTable}>
      <DialogTitle hidden={true}>Title</DialogTitle>
      <DialogContent className="h-lvh min-w-full border bg-white">
        <div className="mt-3 flex h-[100%] w-full justify-center">
          <div className="flex h-[100%] w-full flex-col rounded-sm border border-blue-500 bg-white">
            {/* Global Search */}
            <div
              className="flex h-[38px] w-full items-center rounded-t-sm border-b border-blue-500 px-2"
              style={{
                background:
                  'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
              }}
            >
              <label htmlFor="globalSearch" className="text-xs text-zinc-600">
                SEARCH :
              </label>
              <Input
                id="globalSearch"
                className="m-2 h-[28px] w-[200px] rounded-sm bg-white text-black"
                placeholder="Type to search globally..."
                value={filters.globalSearch}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
              />
            </div>

            {/* Table */}
            <Table className="border-collapse border border-blue-500">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] border border-blue-500">
                    Actions
                  </TableHead>
                  {[
                    'invoice',
                    'paymentStatus',
                    'paymentMethod',
                    'totalAmount'
                  ].map((field) => (
                    <TableHead
                      key={field}
                      className="border border-blue-500 py-2"
                    >
                      <div
                        className="flex w-full cursor-pointer flex-row justify-between"
                        onClick={() => handleSort(field)}
                      >
                        <p className="font-bold">{field.toUpperCase()}</p>
                        <div className="ml-2">
                          {filters.sortBy === field &&
                          filters.sortDirection === 'asc' ? (
                            <FaSortUp className="text-red-500" />
                          ) : filters.sortBy === field &&
                            filters.sortDirection === 'desc' ? (
                            <FaSortDown className="text-red-500" />
                          ) : (
                            <FaSort className="text-zinc-400" />
                          )}
                        </div>
                      </div>
                      <Input
                        className="filter-input mt-1 h-8 w-full"
                        value={filters.filters[field]}
                        onChange={(e) =>
                          handleColumnFilterChange(field, e.target.value)
                        }
                        placeholder={`Filter ${field}`}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((sortedInvoice, sortedIndex) => {
                  const originalIndex = invoices.indexOf(sortedInvoice);

                  return (
                    <TableRow key={sortedIndex}>
                      <TableCell className="border border-blue-500 text-center">
                        <button
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                          onClick={() => deleteRow(originalIndex)}
                        >
                          <FaTrash />
                        </button>
                      </TableCell>
                      <TableCell className="border border-blue-500 font-medium">
                        <Input
                          type="text"
                          value={sortedInvoice.invoice}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'invoice',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>
                      <TableCell className="border border-blue-500">
                        <Input
                          type="text"
                          value={sortedInvoice.paymentStatus}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'paymentStatus',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>
                      <TableCell className="border border-blue-500">
                        <Input
                          type="text"
                          value={sortedInvoice.paymentMethod}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'paymentMethod',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>
                      <TableCell className="border border-blue-500">
                        <Input
                          type="text"
                          value={sortedInvoice.totalAmount}
                          onChange={(e) =>
                            handleInputChange(
                              originalIndex,
                              'totalAmount',
                              e.target.value
                            )
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell className="border border-blue-500 text-center">
                    <button
                      className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      onClick={addRow}
                    >
                      <FaPlus />
                    </button>
                  </TableCell>
                  <TableCell colSpan={4} className="border border-blue-500" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default FormRoleAclTable;
