// ForceEditDialogHost.tsx
import DialogForceEdit from '@/components/custom-ui/DialogForceEdit';
import { useForceEditDialog } from '@/lib/store/client/useForceEdit';

export default function ForceEditDialogHost() {
  const { open, tableName, value, closeDialog, onSuccess } =
    useForceEditDialog();

  return (
    <DialogForceEdit
      open={open}
      tableNameForceEdit={tableName}
      value={value}
      onClose={closeDialog}
      // Kalau mau, panggil onSuccess setelah verify sukses di dalam DialogForceEdit
      onSuccess={onSuccess}
    />
  );
}
