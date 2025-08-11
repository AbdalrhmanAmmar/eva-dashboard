import React, { useState, useEffect } from 'react';
import { getSafetyRequests, getPaginatedSafetyRequests } from '../api/safetyRequests';
import { ISafetyRequest } from '../types';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  Stack,
  CircularProgress,
  Box,
  styled
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
}));

const StatusChip = styled(Chip)(({ status }: { status: string }) => ({
  fontWeight: 600,
  backgroundColor: 
    status === 'approved' ? '#e6f7ee' :
    status === 'rejected' ? '#feeceb' :
    status === 'paid' ? '#e6f0ff' : '#fff8e6',
  color: 
    status === 'approved' ? '#00a76f' :
    status === 'rejected' ? '#ff5630' :
    status === 'paid' ? '#3366ff' : '#ffab00'
}));

const SafetyRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<ISafetyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await getPaginatedSafetyRequests(page, 10, {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`
      });
      setRequests(result.data);
      setTotalPages(result.pages);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, searchTerm, statusFilter, sortField, sortDirection]);

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      paid: 'مدفوع',
      approved: 'موافق عليه',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="xl">
      <StyledPaper>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">
            طلبات شهادات السلامة
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="بحث..."
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 250 }}
            />
            
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              InputProps={{
                startAdornment: <FilterList color="action" sx={{ mr: 1 }} />
              }}
              sx={{ width: 180 }}
            >
              <MenuItem value="all">جميع الحالات</MenuItem>
              <MenuItem value="pending">قيد الانتظار</MenuItem>
              <MenuItem value="paid">مدفوع</MenuItem>
              <MenuItem value="approved">موافق عليه</MenuItem>
              <MenuItem value="rejected">مرفوض</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        {error && (
          <Box textAlign="center" py={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('interiorNumber')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      الرقم الداخلي
                      {sortField === 'interiorNumber' && (
                        <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>اسم المحل</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>المنطقة</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>المدينة</TableCell>
                    <TableCell 
                      onClick={() => handleSort('createdAt')}
                      sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      تاريخ الإنشاء
                      {sortField === 'createdAt' && (
                        <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>حالة الطلب</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id} hover>
                      <TableCell>{request.interiorNumber}</TableCell>
                      <TableCell>{request.signName}</TableCell>
                      <TableCell>{request.region}</TableCell>
                      <TableCell>{request.city}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt!).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <StatusChip 
                          label={getStatusLabel(request.status)} 
                          status={request.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {requests.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1">لا توجد طلبات متاحة</Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  dir="rtl"
                />
              </Box>
            )}
          </>
        )}
      </StyledPaper>
    </Container>
  );
};

export default SafetyRequestsTable;