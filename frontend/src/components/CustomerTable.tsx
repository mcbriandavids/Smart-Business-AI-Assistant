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
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflowX: "auto",
          boxShadow: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        }}
      >
        <Table sx={{ minWidth: 500 }}>
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
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        overflowX: "auto",
        boxShadow: { xs: 0, sm: 2 },
        borderRadius: { xs: 0, sm: 2 },
      }}
    >
      <Table
        sx={{
          minWidth: 500,
          borderCollapse: "collapse",
          "& th, & td": {
            border: "1px solid #d3d3d3",
            padding: "8px",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                minWidth: 120,
                bgcolor: "#f3f6fb",
                border: "1px solid #b0b0b0",
                textAlign: "center",
              }}
            >
              Name
            </TableCell>
            <TableCell
              sx={{
                minWidth: 160,
                bgcolor: "#f3f6fb",
                border: "1px solid #b0b0b0",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Email
            </TableCell>
            <TableCell
              sx={{
                minWidth: 120,
                bgcolor: "#f3f6fb",
                border: "1px solid #b0b0b0",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Phone
            </TableCell>
            <TableCell
              sx={{
                minWidth: 120,
                bgcolor: "#f3f6fb",
                border: "1px solid #b0b0b0",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Notes
            </TableCell>
            <TableCell
              sx={{
                minWidth: 100,
                bgcolor: "#f3f6fb",
                border: "1px solid #b0b0b0",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer._id}
              sx={{
                "&:hover": {
                  backgroundColor: "#eaf1fb",
                },
              }}
            >
              <TableCell
                sx={{
                  wordBreak: "break-word",
                  textAlign: "center",
                  border: "1px solid #d3d3d3",
                }}
              >
                {customer.name}
              </TableCell>
              <TableCell
                sx={{
                  wordBreak: "break-word",
                  textAlign: "center",
                  border: "1px solid #d3d3d3",
                }}
              >
                {customer.email}
              </TableCell>
              <TableCell
                sx={{
                  wordBreak: "break-word",
                  textAlign: "center",
                  border: "1px solid #d3d3d3",
                }}
              >
                {customer.phone}
              </TableCell>
              <TableCell
                sx={{
                  wordBreak: "break-word",
                  textAlign: "center",
                  border: "1px solid #d3d3d3",
                }}
              >
                {customer.notes}
              </TableCell>
              <TableCell
                sx={{ textAlign: "center", border: "1px solid #d3d3d3" }}
              >
                <IconButton
                  size="small"
                  onClick={() => onEdit && onEdit(customer)}
                  sx={{ mx: { xs: 0.5, sm: 1 } }}
                  aria-label="edit"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete && onDelete(customer)}
                  sx={{ mx: { xs: 0.5, sm: 1 } }}
                  aria-label="delete"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerTable;
