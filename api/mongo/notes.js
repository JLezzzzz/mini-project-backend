import express from "express"
import { Note } from "../../models/Note.js"
import { User } from "../../models/User.js";
const router = express.Router();
import { getAllNotes, getNoteById, createNote, addNote, editNote, togglePin, getAllNotesByUser, deleteNote, searchNotes } from "./controllers/notesController.js";
import { authUser } from "../../middleware/auth.js";

//get all notes
router.get("/notes", getAllNotes)

//create a note
router.post("/notes", createNote)

// Real app scenario -> AUTHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH

// Add note
router.post("/add-note", authUser, addNote);

// Edit note
router.put("/edit-note/:noteId",authUser, editNote);

// Update isPinned
router.put("/update-note-pinned/:noteId",authUser, togglePin);

// Get all notes by user id
router.get("/get-all-notes", authUser, getAllNotesByUser);

// Delete note
router.delete("/delete-note/:noteId",authUser, deleteNote);

// Search notes
router.get("/search-notes", authUser, searchNotes);

// Get user's notes
router.get("/get-note/:noteId", authUser, getNoteById);

// Get public profile by user ID
router.get("/public-profile/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select(
        "fullName email"
      );
      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }
      res.status(200).json({ error: false, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true, message: "Server error" });
    }
  });
  
  // Get public notes for a user
  router.get("/public-notes/:userId", async (req, res) => {
    const { userId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: true, message: "Invalid user ID" });
    }
  
    try {
      const notes = await Note.find({
        userId,
        isPublic: true, // Only fetch public notes
      }).sort({ createdOn: -1 }); // Sort by creation date (newest first)
  
      res.status(200).json({ error: false, notes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true, message: "Server error" });
    }
  });
  
  // Update note visibility (publish/unpublish)
  router.put("/notes/:noteId/visibility", authUser, async (req, res) => {
    const { isPublic } = req.body;
    const { user } = req.user;
  
    try {
      const note = await Note.findOneAndUpdate(
        { _id: req.params.noteId, userId: user._id }, // Ensure the note belongs to the user
        { isPublic },
        { new: true } // Return the updated note
      );
  
      if (!note) {
        return res
          .status(404)
          .json({ error: true, message: "Note not found or unauthorized" });
      }
  
      res.status(200).json({ error: false, note });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true, message: "Server error" });
    }
  });


export default router;