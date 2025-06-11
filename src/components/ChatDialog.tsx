
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Chat {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

interface ChatDialogProps {
  selectedChat: Chat | null;
  onClose: () => void;
}

export const ChatDialog = ({ selectedChat, onClose }: ChatDialogProps) => {
  return (
    <Dialog open={!!selectedChat} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat with {selectedChat?.recipientName}</DialogTitle>
          <DialogDescription>
            Start your conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input 
              id="name" 
              value={selectedChat?.recipientName || ''} 
              className="col-span-3" 
              readOnly
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
