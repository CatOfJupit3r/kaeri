import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { LuArrowLeft, LuCheck, LuX } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAcceptInvitation, useDeclineInvitation } from '@~/hooks/mutations/use-invitations';
import { invitationByCodeQueryOptions, useInvitationByCode } from '@~/hooks/queries/use-invitations';

export const Route = createFileRoute('/_auth_only/workspaces/invitations/$code')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(invitationByCodeQueryOptions(params.code));
  },
  component: InvitationAcceptPage,
});

function InvitationAcceptPage() {
  const navigate = useNavigate();
  const { code } = Route.useParams();
  const { data: invitation, isPending, error } = useInvitationByCode(code);
  const { acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  const handleAccept = () => {
    acceptInvitation(
      { code },
      {
        onSuccess: (result) => {
          void navigate({ to: '/workspaces/$workspaceId', params: { workspaceId: result.workspaceId } });
        },
      },
    );
  };

  const handleDecline = () => {
    declineInvitation(
      { code },
      {
        onSuccess: () => {
          void navigate({ to: '/workspaces' });
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid, has expired, or has already been used.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/workspaces">
                <LuArrowLeft className="mr-2 h-4 w-4" />
                Back to Workspaces
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation to join <strong>{invitation.workspaceName}</strong> has expired. Please ask the workspace
              owner to send a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/workspaces">
                <LuArrowLeft className="mr-2 h-4 w-4" />
                Back to Workspaces
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-md items-center justify-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You have been invited to join <strong>{invitation.workspaceName}</strong> by{' '}
            <strong>{invitation.invitedByName}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Workspace</dt>
                  <dd className="font-medium">{invitation.workspaceName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium">{invitation.role}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Invited by</dt>
                  <dd className="font-medium">{invitation.invitedByName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd className="font-medium">{new Date(invitation.expiresAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDecline} disabled={isAccepting || isDeclining}>
            <LuX className="mr-2 h-4 w-4" />
            {isDeclining ? 'Declining...' : 'Decline'}
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={isAccepting || isDeclining}>
            <LuCheck className="mr-2 h-4 w-4" />
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
