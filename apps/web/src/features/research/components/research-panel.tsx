import { LuArrowLeft } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { ScrollArea } from '@~/components/ui/scroll-area';

import { ResearchEditForm } from './research-edit-form';

interface iResearchPanelProps {
  researchId: string;
  onBack: () => void;
}

export function ResearchPanel({ researchId, onBack }: iResearchPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <LuArrowLeft className="size-4" />
        </Button>
        <h2 className="font-semibold">Edit Research</h2>
      </div>
      <ScrollArea className="flex-1">
        <ResearchEditForm researchId={researchId} onSave={onBack} />
      </ScrollArea>
    </div>
  );
}
