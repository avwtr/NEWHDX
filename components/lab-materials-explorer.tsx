"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Minimize2, Upload, FileIcon, FolderPlus } from "lucide-react"
import { CreateFileDialog } from "@/components/create-file-dialog"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { DraggableFolder } from "@/components/draggable-folder"
import { DraggableFileItem } from "@/components/draggable-file-item"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { DndContext, useDraggable, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { deleteObject, ref as firebaseRef, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "@/lib/firebaseClient";

interface LabMaterialsExplorerProps {
  labId: string;
  createNewFolder?: boolean
  isAdmin?: boolean
}

export function LabMaterialsExplorer({ labId, createNewFolder, isAdmin = false }: LabMaterialsExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openFolders, setOpenFolders] = useState<string[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [rootFiles, setRootFiles] = useState<any[]>([])
  const [draggedItem, setDraggedItem] = useState<{ id: string; name: string; type: string; isFolder?: boolean } | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isCreateFileDialogOpen, setIsCreateFileDialogOpen] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<{ file: any, oldFolder: string }>>([])
  const { user } = useAuth();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum px to move before drag starts
      },
    })
  );

  // Fetch files/folders for this lab
  const fetchFilesAndFolders = async () => {
    // 1. Fetch all file records for this lab from DB
    const { data: fileRecords, error: dbError } = await supabase
      .from("files")
      .select("*")
      .eq("labID", labId)
      .order("filename", { ascending: true });
    console.log("[fetchFilesAndFolders] fileRecords:", fileRecords, "error:", dbError);
    if (dbError) {
      console.error("Error fetching file records:", dbError);
      return;
    }
    // 2. Organize files into folders
    const folderNames = new Set<string>();
    fileRecords?.forEach(file => {
      if (file.folder && file.folder !== "root") {
        folderNames.add(file.folder);
      }
    });

    const foldersArr = Array.from(folderNames).map(folderName => {
      // Only show real files (not .keep) in the folder
      const files = fileRecords
        .filter(f => f.folder === folderName && f.filename !== ".keep")
        .map(file => ({
          ...file,
          author: file.author || '',
          date: file.date || ''
        }));
      return {
        id: folderName,
        name: folderName.toUpperCase(),
        files
      };
    });

    const rootFiles: any[] = [];
    fileRecords?.forEach(file => {
      if ((!file.folder || file.folder === "root") && file.filename !== ".keep") {
        rootFiles.push({
          ...file,
          author: file.author || '',
          date: file.date || ''
        });
      }
    });
    setFolders(foldersArr);
    setRootFiles(rootFiles);
  };

  // Fetch files/folders only on mount or labId change
  useEffect(() => {
    fetchFilesAndFolders();
  }, [labId]);

  // Toggle folder open/closed state
  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => (prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]))
  }

  // Open all folders
  const openAllFolders = () => {
    setOpenFolders(folders.map((folder) => folder.id))
  }

  // Handle "Browse All Files" button click
  const handleBrowseAll = () => {
    setIsExpanded(true)
    openAllFolders()
  }

  // Helper to infer if a file is stored in Firebase (big file)
  const isFirebaseFile = (file: any) => {
    if (file.fileSize && file.fileSize.includes('MB')) {
      return parseFloat(file.fileSize) > 50;
    }
    return false;
  };

  // Move file between folders or to/from root (DB only)
  const moveFile = async (file: any, newFolder: string) => {
    // Remove the file from all folders and root
    const updatedFolders = folders.map(folder => ({
      ...folder,
      files: folder.files.filter((f: any) => f.id !== file.id),
    }));
    const updatedRootFiles = rootFiles.filter((f: any) => f.id !== file.id);

    // Add the file to the new folder or root
    if (newFolder === "root") {
      setRootFiles([...updatedRootFiles, { ...file, folder: "root", filename: file.filename || file.name }]);
      setFolders(updatedFolders);
    } else {
      setFolders(updatedFolders.map(folder =>
        folder.id === newFolder
          ? { ...folder, files: [...folder.files, { ...file, folder: newFolder, filename: file.filename || file.name }] }
          : folder
      ));
      setRootFiles(updatedRootFiles);
    }

    // Backend: update folder column in files table
    try {
      const { error: updateError } = await supabase
        .from("files")
        .update({ folder: newFolder })
        .eq("id", file.id)
        .eq("labID", labId);
      if (updateError) throw updateError;
      toast({
        title: "File moved",
        description: "File has been moved to the new folder.",
      });
    } catch (error) {
      // Optionally: refetch or rollback UI
      fetchFilesAndFolders();
      toast({
        title: "Error",
        description: "Failed to move file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Rename file
  const handleRenameFile = async (fileId: string, newName: string) => {
    if (!isAdmin) return;
    let prevFolders = JSON.parse(JSON.stringify(folders));
    let prevRootFiles = JSON.parse(JSON.stringify(rootFiles));
    let fileToRename = rootFiles.find((file: any) => file.id === fileId);
    let sourceFolderId = "";
    if (!fileToRename) {
      for (const folder of folders) {
        const foundFile = folder.files.find((file: any) => file.id === fileId);
        if (foundFile) {
          fileToRename = foundFile;
          sourceFolderId = folder.id;
          break;
        }
      }
    }
    if (!fileToRename) return;

    // Get extension and build new filename
    const extension = fileToRename.filename.includes('.')
      ? fileToRename.filename.split('.').pop()
      : '';
    let newFileName = newName;
    if (extension && !newName.endsWith(`.${extension}`)) {
      newFileName = `${newName}.${extension}`;
    }

    // Optimistically update UI
    if (sourceFolderId && sourceFolderId !== "root") {
      setFolders((prev) => prev.map((folder) => folder.id === sourceFolderId ? { ...folder, files: folder.files.map((file: any) => file.id === fileId ? { ...file, filename: newFileName } : file) } : folder));
    } else {
      setRootFiles((prev) => prev.map((file: any) => file.id === fileId ? { ...file, filename: newFileName } : file));
    }

    try {
      // Optionally: rename in storage
      if (isFirebaseFile(fileToRename)) {
        // Firebase: copy to new name, delete old
        const oldRef = firebaseRef(firebaseStorage, fileToRename.storageKey);
        const newStorageKey = `BIG_FILES/${labId}/${newFileName}`;
        const newRef = firebaseRef(firebaseStorage, newStorageKey);
        // Download old file
        const url = await getDownloadURL(oldRef);
        const response = await fetch(url);
        const blob = await response.blob();
        // Upload to new location
        await uploadBytes(newRef, blob);
        // Delete old file
        await deleteObject(oldRef);
        // Update DB
        await supabase.from("files").update({ filename: newFileName, storageKey: newStorageKey, url: await getDownloadURL(newRef) }).eq("id", fileToRename.id);
      } else {
        // Supabase: just update DB (optionally, implement move in storage)
        await supabase.from("files").update({ filename: newFileName }).eq("id", fileToRename.id);
      }
      await fetchFilesAndFolders();
      toast({ title: "File Renamed", description: `${fileToRename.filename} renamed to ${newFileName}.` });
    } catch (err: any) {
      setFolders(prevFolders);
      setRootFiles(prevRootFiles);
      toast({ title: "Error", description: `Failed to rename file: ${err.message}` });
      return;
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!isAdmin) return;
    let prevFolders = JSON.parse(JSON.stringify(folders));
    let prevRootFiles = JSON.parse(JSON.stringify(rootFiles));
    let fileToDelete = rootFiles.find((file: any) => file.id === fileId);
    let sourceFolderId = "";
    if (!fileToDelete) {
      for (const folder of folders) {
        const foundFile = folder.files.find((file: any) => file.id === fileId);
        if (foundFile) {
          fileToDelete = foundFile;
          sourceFolderId = folder.id;
          break;
        }
      }
    }
    if (!fileToDelete) return;
    // Optimistically update UI
    if (sourceFolderId && sourceFolderId !== "root") {
      setFolders((prev) => prev.map((folder) => folder.id === sourceFolderId ? { ...folder, files: folder.files.filter((file: any) => file.id !== fileId) } : folder));
    } else {
      setRootFiles((prev) => prev.filter((file: any) => file.id !== fileId));
    }
    // Backend
    try {
      if (isFirebaseFile(fileToDelete)) {
        // Delete from Firebase Storage
        const firebaseFileRef = firebaseRef(firebaseStorage, fileToDelete.storageKey);
        await deleteObject(firebaseFileRef);
      } else {
        // Supabase Storage
        const filePath = sourceFolderId && sourceFolderId !== "root" ? `${labId}/${sourceFolderId}/${fileToDelete.filename}` : `${labId}/${fileToDelete.filename}`;
        await supabase.storage.from("labmaterials").remove([filePath]);
      }
      await supabase.from("files").delete().eq("id", fileToDelete.id);
      toast({ title: "File Deleted", description: `${fileToDelete.filename} deleted successfully.` });
    } catch (err: any) {
      setFolders(prevFolders);
      setRootFiles(prevRootFiles);
      toast({ title: "Error", description: `Failed to delete file: ${err.message}` });
      return;
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!isAdmin) return;
    let prevFolders = JSON.parse(JSON.stringify(folders));
    // Optimistically update UI
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    // Backend
    const { data: folderFiles } = await supabase.storage.from("labmaterials").list(`${labId}/${folderId}`, { limit: 1000 });
    const filePaths = (folderFiles || []).filter((f: any) => f.id !== null && f.name !== ".keep").map((f: any) => `${labId}/${folderId}/${f.name}`);
    await supabase.storage.from("labmaterials").remove([...filePaths, `${labId}/${folderId}/.keep`]);
    await supabase.from("files").delete().eq("folder", folderId).eq("labID", labId);
    // No rollback for folder delete (could be added if needed)
    toast({ title: "Folder Deleted", description: `Folder ${folderId} and its files deleted.` });
  };

  // Rename folder
  const handleRenameFolder = async (folderId: string, newName: string) => {
    if (!isAdmin) return;
    let prevFolders = JSON.parse(JSON.stringify(folders));
    // Optimistically update UI
    setFolders((prev) => prev.map((folder) => folder.id === folderId ? { ...folder, id: newName, name: newName.toUpperCase() } : folder));
    // Backend
    const { data: folderFiles } = await supabase.storage.from("labmaterials").list(`${labId}/${folderId}`, { limit: 1000 });
    for (const f of folderFiles || []) {
      if (f.id !== null && f.name !== ".keep") {
        const oldPath = `${labId}/${folderId}/${f.name}`;
        const newPath = `${labId}/${newName}/${f.name}`;
        await supabase.storage.from("labmaterials").move(oldPath, newPath);
      }
    }
    await supabase.storage.from("labmaterials").move(`${labId}/${folderId}/.keep`, `${labId}/${newName}/.keep`);
    await supabase.from("files").update({ folder: newName }).eq("folder", folderId).eq("labID", labId);
    // No rollback for folder rename (could be added if needed)
    toast({ title: "Folder Renamed", description: `Folder ${folderId} renamed to ${newName}.` });
  };

  // Create folder (database-driven, .keep row)
  const createFolder = async (folderName: string, parentFolder: string = "root") => {
    if (!isAdmin) return;
    console.log("[createFolder] Called with:", folderName, parentFolder);
    console.log("[createFolder] labId:", labId);
    console.log("[createFolder] user?.id:", user?.id);
    // Optimistically update UI
    setFolders((prev) => [...prev, { id: folderName, name: folderName.toUpperCase(), files: [] }]);
    // Backend: insert a .keep row in files table with all required columns
    const { error, data } = await supabase.from("files").insert([
      {
        filename: ".keep",
        fileType: "folder",
        fileSize: "0 KB",
        labID: labId,
        folder: folderName,
        fileTag: "folder",
        initiallycreatedBy: user?.id || null,
        lastUpdatedBy: user?.id || null,
        lastUpdated: new Date().toISOString(),
      },
    ]);
    if (error) {
      setFolders((prev) => prev.filter((folder) => folder.id !== folderName));
      console.error("[createFolder] Supabase insert error:", error);
      toast({ title: "Error", description: `Failed to create folder: ${JSON.stringify(error)} | labId: ${labId} | userId: ${user?.id}` });
      return;
    }
    toast({ title: "Folder Created", description: `New folder \"${folderName}\" has been created` });
    // Refetch files/folders to ensure UI is up to date
    fetchFilesAndFolders();
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string, name: string, type: string, isFolder = false) => {
    if (!isAdmin) return

    // Use DataTransfer API for DnD
    const dragData = { id, name, type, isFolder };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move"
    }
  }

  // Handle container drag over
  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    setIsDraggingOver(true)
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy"
    }
  }

  // Handle container drag leave
  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    // Only set to false if we're leaving the container (not entering a child)
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false)
    }
  }

  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetId?: string, fileObj?: any) => {
    if (!isAdmin) return

    e.preventDefault()
    setDropTargetId(null)
    setIsDraggingOver(false)

    // Handle external files dropped from desktop
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      handleExternalFileDrop(files, targetId)
      return
    }

    // If fileObj is present (from folder drop), use it
    if (fileObj) {
      moveFile(fileObj, targetId || "root")
      return
    }

    // Skip if dropping onto itself
    if (draggedItem?.id === targetId) return

    // Handle internal drag and drop
    if (draggedItem?.isFolder) {
      // Folder drag-and-drop: move folder into another folder
      const sourceFolder = draggedItem.name
      const destFolder = targetId
      if (!sourceFolder || !destFolder || sourceFolder === destFolder) return
      // New folder path: destFolder/sourceFolder
      const newFolderPath = `${destFolder}/${sourceFolder}`
      // Update all files in the source folder to the new folder path
      try {
        // Update in DB
        const { error } = await supabase
          .from("files")
          .update({ folder: newFolderPath })
          .eq("folder", sourceFolder)
          .eq("labID", labId)
        if (error) throw error
        toast({
          title: "Folder Moved",
          description: `Folder '${sourceFolder}' moved into '${destFolder}'.`,
        })
        fetchFilesAndFolders()
      } catch (err) {
        toast({
          title: "Error",
          description: `Failed to move folder: ${err.message}`,
          variant: "destructive",
        })
      }
    } else if (draggedItem) {
      // File drag-and-drop
      moveFile(draggedItem, targetId || "root")
    }

    setDraggedItem(null)
  }

  // Handle external file drop
  const handleExternalFileDrop = (files: File[], targetFolderId?: string) => {
    if (!isAdmin) return

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name.toUpperCase(),
      type: file.name.split(".").pop() || "",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      author: "Current User",
      date: "Just now",
    }))

    if (targetFolderId) {
      // Add to specific folder
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === targetFolderId
            ? {
                ...folder,
                files: [...folder.files, ...newFiles],
                count: folder.files.length + newFiles.length,
                lastUpdated: "Just now",
              }
            : folder,
        ),
      )

      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) added to ${folders.find((f) => f.id === targetFolderId)?.name || "folder"}`,
      })
    } else {
      // Add to root
      setRootFiles((prev) => [...prev, ...newFiles])

      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) added to root`,
      })
    }
  }

  // Handle file upload completion
  const handleUploadComplete = async (_files: any[]) => {
    // Only refresh the file list, do NOT insert/upload again!
    await fetchFilesAndFolders();
    toast({
      title: "Upload Complete",
      description: `File(s) uploaded successfully`,
    });
  }

  // Effect to create a new folder when createNewFolder prop changes
  useEffect(() => {
    if (createNewFolder && isAdmin) {
      setIsCreateFolderDialogOpen(true)
    }
  }, [createNewFolder, isAdmin])

  // Setup container drop zone for files from desktop
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isAdmin) return

    const handleContainerDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy"
      }
    }

    const handleContainerDrop = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        handleExternalFileDrop(files)
      }
    }

    // Add event listeners with the passive option set to false
    container.addEventListener("dragover", handleContainerDragOver, { passive: false })
    container.addEventListener("drop", handleContainerDrop, { passive: false })

    // Make sure to clean up event listeners
    return () => {
      container.removeEventListener("dragover", handleContainerDragOver)
      container.removeEventListener("drop", handleContainerDrop)
    }
  }, [isAdmin])

  // Handle publication file click
  const handlePublicationClick = (fileId: string) => {
    // In a real app, this would navigate to the publication editor with the file ID
    if (fileId.includes("publication")) {
      toast({
        title: "Opening Publication",
        description: "Navigating to publication editor...",
      })
      // This would be replaced with actual navigation in a real app
      // router.push(`
    }
  }

  // dnd-kit drop handler
  function handleDndDrop(event: any) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!active || !over) return;
    const fileId = active.id;
    const targetFolder = over.id;
    // Find the file object
    let fileObj = rootFiles.find(f => f.id === fileId);
    if (!fileObj) {
      for (const folder of folders) {
        fileObj = folder.files.find((f: any) => f.id === fileId);
        if (fileObj) break;
      }
    }
    if (fileObj && (targetFolder === 'root' || folders.some(f => f.id === targetFolder))) {
      moveFile(fileObj, targetFolder);
    }
  }

  // dnd-kit drag start handler
  function handleDndDragStart(event: any) {
    setActiveDragId(event.active.id);
  }

  // Find the file object for the overlay
  let activeDragFile: any = null;
  if (activeDragId) {
    activeDragFile = rootFiles.find(f => f.id === activeDragId);
    if (!activeDragFile) {
      for (const folder of folders) {
        activeDragFile = folder.files.find((f: any) => f.id === activeDragId);
        if (activeDragFile) break;
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDndDrop} onDragStart={handleDndDragStart}>
      <Card className={isExpanded ? "fixed inset-4 z-50 overflow-auto" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>LAB MATERIALS</CardTitle>
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent
          ref={containerRef}
          className={`space-y-4 ${isExpanded ? "min-h-[calc(100vh-200px)]" : ""} relative${isDraggingOver ? " bg-accent/10 border-2 border-dashed border-accent" : ""}`}
          onDragOver={isAdmin ? (e) => { handleContainerDragOver(e); console.log('[CardContent] Drag over'); } : undefined}
          onDragLeave={isAdmin ? handleContainerDragLeave : undefined}
        >
          <div className="flex justify-center mb-4">
            {isAdmin && (
              <div className="flex gap-2">
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  UPLOAD FILE
                </Button>
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setIsCreateFileDialogOpen(true)}>
                  <FileIcon className="h-4 w-4 mr-2" />
                  CREATE FILE
                </Button>
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setIsCreateFolderDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  NEW FOLDER
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {/* Render folders as droppables */}
            {folders.map(folder => (
              <DroppableFolder
                key={folder.id}
                id={folder.id}
                folder={folder}
                isOpen={openFolders.includes(folder.id)}
                onToggle={toggleFolder}
                onRenameFolder={handleRenameFolder}
                onRenameFile={handleRenameFile}
                userRole={isAdmin ? "admin" : "user"}
                renderFileItem={(file: any) => (
                  <DraggableFileItemDnd
                    key={file.id || `${folder.id}-${file.filename}`}
                    id={file.id}
                    file={file}
                    onRename={handleRenameFile}
                    onDelete={handleDeleteFile}
                    userRole={isAdmin ? "admin" : "user"}
                  />
                )}
              />
            ))}
            {/* Render root files as draggables */}
            {rootFiles.map((file: any) => (
              <DraggableFileItemDnd
                key={file.id || `root-${file.filename}`}
                id={file.id}
                file={file}
                onRename={handleRenameFile}
                onDelete={handleDeleteFile}
                userRole={isAdmin ? "admin" : "user"}
              />
            ))}
            {/* Root drop zone as a droppable */}
            <DroppableRoot />
          </div>
          {/* dnd-kit DragOverlay for file drag preview */}
          <DragOverlay>
            {activeDragFile ? (
              <div style={{ boxShadow: '0 4px 24px #0008', borderRadius: 8, background: '#222', padding: 8 }}>
                <DraggableFileItem
                  id={activeDragFile.id}
                  name={activeDragFile.filename}
                  type={activeDragFile.fileType || activeDragFile.type || ''}
                  size={activeDragFile.fileSize}
                  tag={activeDragFile.fileTag}
                  author={activeDragFile.author}
                  date={activeDragFile.date}
                  userRole={isAdmin ? "admin" : "user"}
                  onRename={() => {}}
                  onDragStart={(e, id, name, type) => {}}
                  onDragOver={(e) => {}}
                  onDrop={(e, targetId) => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
          {isExpanded && (
            <div className="fixed bottom-8 right-8">
              <Button onClick={() => setIsExpanded(false)} className="bg-accent text-primary-foreground hover:bg-accent/90">
                <Minimize2 className="h-4 w-4 mr-2" />
                Close Expanded View
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
         
        </CardFooter>
        {/* Dialogs */}
        {isUploadDialogOpen && (
          <FileUploadDialog
            labId={labId}
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            onUploadComplete={handleUploadComplete}
          />
        )}
        {isCreateFolderDialogOpen && (
          <CreateFolderDialog
            onCreateFolder={(name, parent) => createFolder(name, parent)}
            onClose={() => setIsCreateFolderDialogOpen(false)}
            isOpen={isCreateFolderDialogOpen}
          />
        )}
        {isCreateFileDialogOpen && <CreateFileDialog labId={labId} onClose={() => setIsCreateFileDialogOpen(false)} onFileCreated={fetchFilesAndFolders} />}
      </Card>
    </DndContext>
  )
}

// --- dnd-kit wrappers ---
function DraggableFileItemDnd({ id, file, ...props }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <DraggableFileItem
        id={id}
        name={file.filename}
        type={file.fileType || file.type || ''}
        size={file.fileSize}
        tag={file.fileTag}
        author={file.author}
        date={file.date}
        {...props}
      />
    </div>
  );
}

function DroppableFolder({ id, folder, isOpen, onToggle, renderFileItem, ...props }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ background: isOver ? '#222e' : undefined }}>
      <DraggableFolder
        id={id}
        name={folder.name}
        count={folder.files.length}
        lastUpdated={folder.lastUpdated || ""}
        files={folder.files}
        isOpen={isOpen}
        onToggle={onToggle}
        renderFileItem={renderFileItem}
        userRole={props.userRole}
        onRenameFolder={props.onRenameFolder}
        onRenameFile={props.onRenameFile}
      />
    </div>
  );
}

function DroppableRoot() {
  const { setNodeRef, isOver } = useDroppable({ id: 'root' });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: '2px dashed #00f2',
        background: isOver ? '#0ff4' : '#0000',
        borderRadius: 8,
        padding: 24,
        marginTop: 24,
        textAlign: 'center',
        color: '#00f',
        fontWeight: 600,
      }}
    >
      Drop here to move file(s) to <span style={{ fontWeight: 700 }}>ROOT</span>
    </div>
  );
}