
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Tag, RefreshCw, ArrowRight } from "lucide-react";

const TAGS = [
  "Bills",
  "Savings",
  "Groceries",
  "Transport",
  "Shopping",
  "Dining",
  "Custom"
];

interface NoteTagEditorProps {
  open: boolean;
  initialNote?: string;
  initialTag?: string | null;
  initialIsContinuous?: boolean;
  initialIsRecurring?: boolean;
  onClose: () => void;
  onSave: (note: string, tag: string | null, isContinuous: boolean, isRecurring: boolean) => void;
  isSubItem?: boolean;
}

const NoteTagEditor: React.FC<NoteTagEditorProps> = ({
  open,
  initialNote = "",
  initialTag = null,
  initialIsContinuous = false,
  initialIsRecurring = false,
  onClose,
  onSave,
  isSubItem = false,
}) => {
  const [note, setNote] = useState(initialNote);
  const [tag, setTag] = useState(initialTag ?? "");
  const [customTag, setCustomTag] = useState("");
  const [isContinuous, setIsContinuous] = useState(initialIsContinuous);
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);

  const handleTagChange = (value: string) => {
    setTag(value);
    if (value === "Custom") setCustomTag("");
  };

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTag(e.target.value);
    setTag(e.target.value);
  };

  const handleSave = () => {
    onSave(note, tag === "Custom" ? customTag : tag, isContinuous, isRecurring);
    onClose();
  };

  React.useEffect(() => {
    setNote(initialNote ?? "");
    setTag(initialTag ?? "");
    setIsContinuous(initialIsContinuous ?? false);
    setIsRecurring(initialIsRecurring ?? false);
    if ((initialTag && !TAGS.includes(initialTag)) || initialTag === "Custom")
      setCustomTag(initialTag || "");
  }, [open, initialNote, initialTag, initialIsContinuous, initialIsRecurring]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isSubItem ? "Edit Sub-item Details" : "Edit Budget Item Details"}
            </div>
          </DialogTitle>
          <DialogDescription>
            Add notes, tags, and set continuation preferences for your {isSubItem ? "sub-item" : "budget item"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter a note..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700">Tag</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs hover:bg-finance-primary/10
                    ${tag === t ? "bg-finance-primary text-white border-finance-primary font-bold" : "border-gray-200 bg-gray-100 text-gray-700"}
                  `}
                  onClick={() => handleTagChange(t)}
                >
                  <Tag className="inline mr-1 h-3 w-3" />
                  {t}
                </button>
              ))}
              <input
                type="text"
                className="border rounded px-2 py-1 text-xs bg-white ml-1"
                style={{ width: 90 }}
                placeholder="Custom tag"
                value={tag === "Custom" ? customTag : ""}
                onFocus={() => handleTagChange("Custom")}
                onChange={handleCustomTagChange}
              />
            </div>
          </div>

          {!isSubItem && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="continuous" 
                  checked={isContinuous}
                  onCheckedChange={(checked) => setIsContinuous(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <label htmlFor="continuous" className="text-sm font-medium cursor-pointer">
                    Continuous Item
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                Continue tracking from where you left off in the next budget period
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring" 
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-green-600" />
                  <label htmlFor="recurring" className="text-sm font-medium cursor-pointer">
                    Recurring Item
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                Automatically add this item with the same amount to each new budget period
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="bg-finance-primary">Save</Button>
          <DialogClose asChild>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteTagEditor;
