import { useEffect } from 'react';
import z from 'zod';

import { WORKSPACE_ROLES } from '@kaeri/shared';
import type { WorkspaceRole } from '@kaeri/shared';

import { Button } from '@~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { useCreateInvitation } from '@~/hooks/mutations/use-invitations';

interface iInviteDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const invitableRoles: Exclude<WorkspaceRole, 'OWNER'>[] = [
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.EDITOR,
  WORKSPACE_ROLES.VIEWER,
];

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum([WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.EDITOR, WORKSPACE_ROLES.VIEWER]),
});

export function InviteDialog({ workspaceId, workspaceName, open, onOpenChange }: iInviteDialogProps) {
  const { createInvitation, isPending } = useCreateInvitation();

  const form = useAppForm({
    defaultValues: {
      email: '',
      role: WORKSPACE_ROLES.EDITOR as Exclude<WorkspaceRole, 'OWNER'>,
    },
    onSubmit: async ({ value }) => {
      createInvitation(
        {
          workspaceId,
          email: value.email,
          role: value.role,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    },
    validators: {
      onSubmit: inviteSchema,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form.AppForm>
          <form.Form className="space-y-4">
            <DialogHeader>
              <DialogTitle>Invite to {workspaceName}</DialogTitle>
              <DialogDescription>
                Send an invitation to join this workspace. The invitee will receive an email with a link to join.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <form.AppField name="email">
                {(field) => (
                  <field.TextField label="Email address" placeholder="colleague@example.com" type="email" required />
                )}
              </form.AppField>

              <form.AppField name="role">
                {(field) => (
                  <field.SelectField
                    label="Role"
                    options={invitableRoles.map((role) => ({
                      label: role.charAt(0) + role.slice(1).toLowerCase(),
                      value: role,
                    }))}
                    required
                  />
                )}
              </form.AppField>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
