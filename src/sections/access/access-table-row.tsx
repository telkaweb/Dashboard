import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
// types
import { IAccess } from 'src/types/access';
// components
// ----------------------------------------------------------------------

type Props = {
  row: IAccess;
  index: number;
};

export default function AccessTableRow({
  row,
  index,
}: Props) {
  const {
    name,
    permision_ids
  } = row;


  return (
    <TableRow hover>
      <TableCell sx={{textAlign: 'center'}}>{index + 1}</TableCell>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          disableTypography
          sx={{textAlign: 'center'}}
        >
          {name}
        </ListItemText>
      </TableCell>

      <TableCell>
        <ListItemText sx={{ textAlign: "center" }}>
          {permision_ids?.map((permission, indexx) => (
            <span key={permission.name}>
              {permission.name_fa}
              {indexx !== permision_ids.length - 1 && ", "}
            </span>
          ))}
        </ListItemText>
      </TableCell>
    </TableRow>
  );
}
