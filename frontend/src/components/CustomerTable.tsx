import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export interface Customer {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Props {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onMessage?: (customer: Customer) => void;
}

const CustomerTable: React.FC<Props> = ({
  customers,
  onEdit,
  onDelete,
  onMessage,
}) => {
  if (!customers || customers.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} align="center">
                No customers yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.notes}</TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => onEdit && onEdit(customer)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete && onDelete(customer)}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  size="small"
                  onClick={() => onMessage && onMessage(customer)}
                >
                  Message
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerTable;
