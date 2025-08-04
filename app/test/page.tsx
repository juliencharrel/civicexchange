"use client";
import { Dialog, DialogTrigger, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export default function TestDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Ouvre le test</Button>
      </DialogTrigger>
      <DialogContent>
        <div style={{ padding: 40 }}>Ceci est un test Dialog</div>
      </DialogContent>
    </Dialog>
  );
}