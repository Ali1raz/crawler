import { copyToClipboard } from '#/lib/copytoclipboard';
import { Button } from '#/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';
import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

interface CopyToClipboardButtonProps {
  link: string;
}

export function CopyToClipboardButton({ link }: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    await copyToClipboard(link);
    setCopied(true);

    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            onClick={handleCopy}
            variant="outline"
            size="icon-sm"
            aria-label={copied ? 'Copied link' : 'Copy link'}
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy link'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
