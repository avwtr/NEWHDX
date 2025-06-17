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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);

  // Check if user is logged in and is admin
  const isLoggedInAndAdmin = Boolean(user) && isAdmin;

  // Only enable drag-and-drop sensors for admin users
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      enabled: isAdmin, // Only enable for admin users
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
  
    if (dbError) {
    
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

  // Helper to fetch username from profiles table
  const fetchUsername = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('username').eq('user_id', userId).single();
    return data?.username || userId;
  };

  // Helper to get display name for a file
  function getFileDisplayName(file: any) {
    return file.fileType === 'link' ? file.storageKey : file.filename;
  }

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

      // Activity log with more detailed information
      const username = await fetchUsername(user?.id || "");
      const oldFolder = file.folder || "root";
      const newFolderName = newFolder === "root" ? "ROOT" : newFolder.toUpperCase();
      await supabase.from("activity").insert([
        {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `File Moved: ${getFileDisplayName(file)} from ${oldFolder.toUpperCase()} to ${newFolderName}`,
          activity_type: "filemoved",
          performed_by: user?.id,
          lab_from: labId
        }
      ]);

      toast({
        title: "File moved",
        description: `File has been moved to ${newFolderName}.`,
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

    if (fileToRename.fileType === 'link') {
      // Optimistically update UI
      if (sourceFolderId && sourceFolderId !== "root") {
        setFolders((prev) => prev.map((folder) =>
          folder.id === sourceFolderId
            ? { ...folder, files: folder.files.map((file: any) => file.id === fileId ? { ...file, storageKey: newName } : file) }
            : folder
        ));
      } else {
        setRootFiles((prev) => prev.map((file: any) => file.id === fileId ? { ...file, storageKey: newName } : file));
      }
      try {
        await supabase.from("files").update({ storageKey: newName }).eq("id", fileToRename.id);
        await fetchFilesAndFolders();
        // Activity log and toast as before, but use storageKey for display
        await supabase.from("activity").insert([
          {
            activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            activity_name: `Link Renamed: ${fileToRename.storageKey} to ${newName}`,
            activity_type: "linkrenamed",
            performed_by: user?.id,
            lab_from: labId
          }
        ]);
        toast({ title: "Link Renamed", description: `${fileToRename.storageKey} renamed to ${newName}.` });
      } catch (err: any) {
        setFolders(prevFolders);
        setRootFiles(prevRootFiles);
        toast({ title: "Error", description: `Failed to rename link: ${err.message}` });
        return;
      }
    } else {
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
        // Activity log
        await supabase.from("activity").insert([
          {
            activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            activity_name: `File Renamed: ${getFileDisplayName(fileToRename)} to ${getFileDisplayName({ ...fileToRename, filename: newFileName })}`,
            activity_type: "filerenamed",
            performed_by: user?.id,
            lab_from: labId
          }
        ]);
        toast({ title: "File Renamed", description: `${getFileDisplayName(fileToRename)} renamed to ${getFileDisplayName({ ...fileToRename, filename: newFileName })}.` });
      } catch (err: any) {
        setFolders(prevFolders);
        setRootFiles(prevRootFiles);
        toast({ title: "Error", description: `Failed to rename file: ${err.message}` });
        return;
      }
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    if (!isAdmin) return;
   
    try {
      // Find the file
      let fileToDelete = rootFiles.find(f => f.id === fileId);
      let sourceFolderId = "";
      if (!fileToDelete) {
        for (const folder of folders) {
          fileToDelete = folder.files.find((f: any) => f.id === fileId);
          if (fileToDelete) {
            sourceFolderId = folder.id;
            break;
          }
        }
      }
      if (!fileToDelete) {
      
        return;
      }
    

      // Optimistically update UI
      if (sourceFolderId) {
        setFolders(prev => prev.map(folder =>
          folder.id === sourceFolderId
            ? { ...folder, files: folder.files.filter((f: any) => f.id !== fileId) }
            : folder
        ));
      } else {
        setRootFiles(prev => prev.filter((f: any) => f.id !== fileId));
      }

      // Delete from storage
      
      if (isFirebaseFile(fileToDelete)) {
        const firebaseFileRef = firebaseRef(firebaseStorage, fileToDelete.storageKey);
        await deleteObject(firebaseFileRef);
      } else {
        const filePath = sourceFolderId ? `${labId}/${sourceFolderId}/${fileToDelete.filename}` : `${labId}/${fileToDelete.filename}`;
        await supabase.storage.from("labmaterials").remove([filePath]);
      }

      // Delete from database
     
      await supabase.from("files").delete().eq("id", fileId);

      // Activity log with detailed information
    
      const username = await fetchUsername(user?.id || "");
      const folderName = sourceFolderId ? sourceFolderId.toUpperCase() : "ROOT";
      const activityData = {
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        activity_name: `File Deleted: ${getFileDisplayName(fileToDelete)} from ${folderName}`,
        activity_type: "filedelete",
        performed_by: user?.id,
        lab_from: labId
      };
     
      
      const { error: activityError } = await supabase.from("activity").insert([activityData]);
      if (activityError) {
       
      } else {
        
      }

      toast({
        title: "File Deleted",
        description: `${getFileDisplayName(fileToDelete)} has been deleted.`,
      });
    } catch (error) {
     
      const err = error as Error;
      toast({
        title: "Error",
        description: `Failed to delete file: ${err.message}`,
        variant: "destructive",
      });
      // Refresh to ensure UI is in sync
      fetchFilesAndFolders();
    }
  };

  // Delete folder (with activity log, only deletes files in DB/storage)
  const handleDeleteFolder = async (folderId: string) => {
    if (!isAdmin) return;
    let prevFolders = JSON.parse(JSON.stringify(folders));
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    try {
      // Get all files in the folder
      const { data: folderFiles } = await supabase.from("files").select("*").eq("folder", folderId).eq("labID", labId);
      for (const file of folderFiles || []) {
        if (isFirebaseFile(file)) {
          const firebaseFileRef = firebaseRef(firebaseStorage, file.storageKey);
          await deleteObject(firebaseFileRef);
        } else {
          const filePath = `${labId}/${file.filename}`;
          await supabase.storage.from("labmaterials").remove([filePath]);
        }
      }
      // Delete all DB records for this folder
      await supabase.from("files").delete().eq("folder", folderId).eq("labID", labId);
      // Activity log
      const username = await fetchUsername(user?.id || "");
      await supabase.from("activity").insert([
        {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `Folder Deleted: ${folderId}`,
          activity_type: "folderdeleted",
          performed_by: user?.id,
          lab_from: labId
        }
      ]);
      toast({ title: "Folder Deleted", description: `Folder ${folderId} and its files deleted.` });
    } catch (err: any) {
      setFolders(prevFolders);
      toast({ title: "Error", description: `Failed to delete folder: ${err.message}` });
      return;
    }
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
   

    // Ensure unique folder name by appending timestamp if it's the default name
    const finalFolderName = folderName === "NEW_FOLDER" 
      ? `NEW_FOLDER_${Date.now()}`
      : folderName;

    // Optimistically update UI
    setFolders((prev) => [...prev, { id: finalFolderName, name: finalFolderName.toUpperCase(), files: [] }]);
    // Backend: insert a .keep row in files table with all required columns
    const { error, data } = await supabase.from("files").insert([
      {
        filename: ".keep",
        fileType: "folder",
        fileSize: "0 KB",
        labID: labId,
        folder: finalFolderName,
        fileTag: "folder",
        initiallycreatedBy: user?.id || null,
        lastUpdatedBy: user?.id || null,
        lastUpdated: new Date().toISOString(),
      },
    ]);
    if (error) {
      setFolders((prev) => prev.filter((folder) => folder.id !== finalFolderName));
      
      toast({ title: "Error", description: `Failed to create folder: ${JSON.stringify(error)} | labId: ${labId} | userId: ${user?.id}` });
      return;
    }
    // Activity log
    const username = await fetchUsername(user?.id || "");
    await supabase.from("activity").insert([
      {
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        activity_name: `Folder Created: ${finalFolderName}`,
        activity_type: "foldercreated",
        performed_by: user?.id,
        lab_from: labId
      }
    ]);
    toast({ title: "Folder Created", description: `New folder \"${finalFolderName}\" has been created` });
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
          description: `Failed to move folder: ${(err instanceof Error ? err.message : String(err))}`,
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

    const newFiles = files.map((file) => {
      const extension = file.name.split('.').pop() || '';
      let baseName = file.name.replace(new RegExp(`\\.${extension}$`), '').trim();
      if (!baseName || baseName.startsWith('.')) {
        toast({ title: "Error", description: "Please enter a valid file name (not just an extension).", variant: "destructive" });
        return null;
      }
      const finalName = file.name.endsWith(`.${extension}`) ? file.name : `${file.name}.${extension}`;
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: finalName.toUpperCase(),
        type: extension,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        author: "Current User",
        date: "Just now",
      };
    }).filter(Boolean);

    if (newFiles.length === 0) return;

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
    const container = containerRef.current;
    if (!container || !isAdmin) return;

    const handleContainerDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleContainerDrop = (e: DragEvent) => {
      e.preventDefault();
      const dataTransfer = e.dataTransfer;
      if (dataTransfer?.files && dataTransfer.files.length > 0) {
        const files = Array.from(dataTransfer.files);
        handleExternalFileDrop(files);
      }
    };

    container.addEventListener("dragover", handleContainerDragOver, { passive: false });
    container.addEventListener("drop", handleContainerDrop, { passive: false });

    return () => {
      container.removeEventListener("dragover", handleContainerDragOver);
      container.removeEventListener("drop", handleContainerDrop);
    };
  }, [isAdmin]);

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

  // Handle file save
  const handleFileSave = async (fileId: string, content: string) => {
    try {
      // Save to database
      const { error } = await supabase
        .from("files")
        .update({ content })
        .eq("id", fileId);

      if (error) throw error;

    toast({
        title: "File Saved",
        description: "Changes have been saved successfully.",
      });
    } catch (err) {
     
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
      // Refresh to ensure UI is in sync
      fetchFilesAndFolders();
    }
  };

  // Handle file download
  const handleFileDownload = async (file: any) => {
    try {
      let url;
      if (file.url) {
        url = file.url;
      } else if (file.storageKey) {
        url = await getDownloadURL(firebaseRef(firebaseStorage, file.storageKey));
      } else if (file.path) {
        const { data } = await supabase.storage
          .from("labmaterials")
          .download(file.path);
        if (!data) throw new Error("Failed to download file");
        url = URL.createObjectURL(data);
      }

      if (!url) throw new Error("No download URL available");

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL if created
      if (file.path && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }

      toast({
        title: "File Downloaded",
        description: `${file.filename} has been downloaded.`,
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: `Failed to download file: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  // Pass these handlers to the file viewer components
  const renderFileItem = (file: any) => {
    return (
      <DraggableFileItemDnd
        key={file.id || `root-${file.filename}`}
        id={file.id}
        file={file}
        onRename={handleRenameFile}
        onDelete={handleFileDelete}
        onDownload={handleFileDownload}
        userRole={isLoggedInAndAdmin ? "admin" : "user"}
        labId={labId}
        showSaveToProfile={Boolean(user)}
      />
    );
  };

  // Utility to format file sizes
  function formatFileSize(size: string | number): string {
    let bytes = 0;
    if (typeof size === 'number') {
      bytes = size;
    } else if (typeof size === 'string') {
      const match = size.match(/([\d.]+)\s*(B|KB|MB|GB)?/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = (match[2] || 'B').toUpperCase();
        if (unit === 'B') bytes = value;
        else if (unit === 'KB') bytes = value * 1024;
        else if (unit === 'MB') bytes = value * 1024 * 1024;
        else if (unit === 'GB') bytes = value * 1024 * 1024 * 1024;
      }
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  // Fetch username for lastUpdatedBy
  function useUsername(userId: string | undefined) {
    const [username, setUsername] = useState<string>("");
    useEffect(() => {
      async function fetchUsername() {
        if (!userId) { setUsername(""); return; }
        const { data } = await supabase.from('profiles').select('username').eq('user_id', userId).single();
        setUsername(data?.username || userId || "Unknown");
      }
      fetchUsername();
    }, [userId]);
    return username;
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
        className={`space-y-4 ${isExpanded ? "min-h-[calc(100vh-200px)]" : ""} relative${isDraggingOver && isLoggedInAndAdmin ? " bg-accent/10 border-2 border-dashed border-accent" : ""}`}
        onDragOver={isLoggedInAndAdmin ? handleContainerDragOver : undefined}
        onDragLeave={isLoggedInAndAdmin ? handleContainerDragLeave : undefined}
      >
        <div className="flex justify-center mb-4">
          {isLoggedInAndAdmin && (
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
              userRole={isLoggedInAndAdmin ? "admin" : "user"}
              renderFileItem={renderFileItem}
              actions={isLoggedInAndAdmin ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-400 ml-2 mr-1"
                  style={{ marginLeft: 8, marginRight: 4 }}
                  onClick={e => { e.stopPropagation(); setFolderToDelete(folder.id); setIsDeleteFolderDialogOpen(true); }}
                  title="Delete folder"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </Button>
              ) : null}
            />
          ))}
          {/* Render root files as draggables */}
          {rootFiles.map((file: any) => (
            <DraggableFileItemDnd
              key={file.id || `root-${file.filename}`}
              id={file.id}
              file={file}
              onRename={handleRenameFile}
              onDelete={handleFileDelete}
              onDownload={handleFileDownload}
              userRole={isLoggedInAndAdmin ? "admin" : "user"}
              labId={labId}
              showSaveToProfile={Boolean(user)}
            />
          ))}
          {/* Root drop zone as a droppable - only show for admin users */}
          {isLoggedInAndAdmin && <DroppableRoot />}
        </div>
        {/* dnd-kit DragOverlay for file drag preview - only show for admin users */}
        {isLoggedInAndAdmin && (
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
                  file={activeDragFile}
                  userRole={isLoggedInAndAdmin ? "admin" : "user"}
                  onRename={() => {}}
                  onDragStart={(e, id, name, type) => {}}
                  onDragOver={(e) => {}}
                  onDrop={(e, targetId) => {}}
                  onDelete={() => {}}
                  onDownload={() => handleFileDownload(activeDragFile)}
                  labId={labId}
                  showSaveToProfile={Boolean(user)}
                />
              </div>
            ) : null}
          </DragOverlay>
        )}
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
      {/* Dialogs - only show for admin users */}
      {isLoggedInAndAdmin && (
        <>
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
          {/* Folder Delete Confirmation Dialog */}
          <Dialog open={isDeleteFolderDialogOpen} onOpenChange={setIsDeleteFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Folder</DialogTitle>
              </DialogHeader>
              <div>
                Are you sure you want to delete the folder <b>{folderToDelete}</b>?<br />
                <span className="text-destructive">All files inside this folder will be permanently deleted.</span>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteFolderDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (folderToDelete) {
                      setIsDeleteFolderDialogOpen(false);
                      await handleDeleteFolder(folderToDelete);
                      setFolderToDelete(null);
                    }
                  }}
                >
                  Delete Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Card>
    </DndContext>
  )
}

// --- dnd-kit wrappers ---
function DraggableFileItemDnd({ id, file, userRole, showSaveToProfile, ...props }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id,
    disabled: userRole !== "admin" // Disable dragging for non-admin users
  });
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
        file={file}
        userRole={userRole}
        showSaveToProfile={showSaveToProfile}
        {...props}
      />
    </div>
  );
}

function DroppableFolder({ id, folder, isOpen, onToggle, renderFileItem, actions, userRole, ...props }: any) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    disabled: userRole !== "admin" // Disable dropping for non-admin users
  });
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
        userRole={userRole}
        onRenameFolder={props.onRenameFolder}
        onRenameFile={props.onRenameFile}
        actions={actions}
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