import express from "express"
import { Note } from "../../models/Note.js"
const router = express.Router();
import { getAllNotes, getNoteById, createNote, addNote, editNote, togglePin, getAllNotesByUser, deleteNote, searchNotes } from "./controllers/notesController.js";
import { authUser } from "../../middleware/auth.js";

//get all notes
router.get("/notes", getAllNotes)


//create a note
router.post("/notes", createNote)

// Add note
router.post("/add-note", authUser, addNote);

// Edit note 
router.put("/edit-note/:noteId",authUser, editNote);

// Update isPinned *****************************************
router.put("/update-note-pinned/:noteId",authUser, togglePin);

// Get all notes by user id
router.get("/get-all-notes", authUser, getAllNotesByUser);

// Delete note
router.delete("/delete-note/:noteId",authUser, deleteNote);

// Search notes
router.get("/search-notes", authUser, searchNotes);

// Get user's notes
router.get("/get-note/:noteId", authUser, getNoteById);

export default router;