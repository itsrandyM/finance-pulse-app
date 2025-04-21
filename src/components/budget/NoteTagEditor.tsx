
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Tag } from "lucide-react";

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
  onClose: () => void;
  onSave: (note: string, tag: string | null) => void;
  isSubItem?: boolean;
}

const NoteTagEditor: React.FC<NoteTagEditorProps> = ({
  open,
  initialNote = "",
  initialTag = null,
  onClose,
  onSave,
  isSubItem = false,
}) => {
  const [note, setNote] = useState(initialNote);
  const [tag, setTag] = useState(initialTag ?? "");
  const [customTag, setCustomTag] = useState("");

  const handleTagChange = (value: string) => {
    setTag(value);
    if (value === "Custom") setCustomTag("");
  };

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTag(e.target.value);
    setTag(e.target.value);
  };

  const handleSave = () => {
    onSave(note, tag === "Custom" ? customTag : tag);
    onClose();
  };

  React.useEffect(() => {
    setNote(initialNote ?? "");
    setTag(initialTag ?? "");
    if ((initialTag && !TAGS.includes(initialTag)) || initialTag === "Custom")
      setCustomTag(initialTag || "");
  }, [open, initialNote, initialTag]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isSubItem ? "Edit Sub-item Note & Tag" : "Edit Note & Tag"}
            </div>
          </DialogTitle>
          <DialogDescription>
            Add an optional note and tag to better categorize your {isSubItem ? "sub-item" : "budget item"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter a note..."
            className="resize-none"
          />
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
