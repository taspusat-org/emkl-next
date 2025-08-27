// ForceEditDialogHost.tsx
import DialogForceEdit from '@/components/custom-ui/DialogForceEdit';
import { useForceEditDialog } from '@/lib/store/client/useForceEdit';
import DialogApproval from './DialogApproval';
import { useApprovalDialog } from '@/lib/store/client/useDialogApproval';

export default function ApprovalDialog() {
  return <DialogApproval />;
}
