import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AddressDisplayProps {
  address: string;
  onCopy: () => void;
}

export const AddressDisplay = ({ address, onCopy }: AddressDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-lg font-medium text-foreground truncate font-mono tracking-wide">
          {address}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
      >
        {copied ? (
          <Check className="w-5 h-5 text-primary" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
