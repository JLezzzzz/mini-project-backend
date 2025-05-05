import { Note } from "../../../models/Note.js";

export const getAllNotes = async (req, res) => {
    try {
        const note = await Note.find().sort({createdAt: -1, isPinned: -1})
        res.json(note);

    } catch(err) {
        res.status(500).json({
            error: true,
            message: "failed to fetch all notes",
            details: err.message,
        });
    }
}

export const createNote = async (req, res) => {
    const {title, content, tags =[] ,isPinned = false, userId} = req.body
    try{ 
        const note = await Note.create({
            title,
            content,
            tags,
            isPinned,
            userId,
        })
        res.status(201).json(note)

    } catch(error) {
        res.status(500).json({
            error: true,
            message: "Failed to create note",
            details: error.message,
        });


    }
}

export const addNote = async (req, res) => {
    const { title, content, tags = [], isPinned = false } = req.body;

    const { user } = req.user;

    if (!title || !content) {
      return res.status(400).json({
        error: true,
        message: "All fields required!",
      });
    }

    if (!user || !user._id) {
      return res.status(400).json({
        error: true,
        message: "Invalid user credentials!",
      });
    }

    try {
      const note = await Note.create({
        title,
        content,
        tags,
        isPinned,
        userId: user._id,
      });

      await note.save();
      res.json({
        error: false,
        note,
        message: "Note added successfully!",
      });
    } catch (err) {
      res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };

export const editNote = async (req, res) => {
    const noteId = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const userId = req.user.user._id
    console.log("User log: ",userId)
    if (!title && !content && !tags) {
    return res.status(400).json({ error: true, message: "No changes provided" });
    }
    try {
        const note = await Note.findOne({ _id: noteId, userId });
        console.log(note)
    if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) {note.title = title};
    if (content) {note.content = content};
    if (tags) {note.tags = tags};
    if (isPinned) {note.isPinned = isPinned};

    await note.save()

    return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });

    } catch(err){
        return res.status(500).json({err: true, message: "Internal server error"});
    }
}

export const togglePin = async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const userId = req.user.user._id;

    try {
      const note = await Note.findOne({ _id: noteId, userId});

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      note.isPinned = isPinned;

      await note.save();

      return res.json({
        error: false,
        note,
        message: "Note pinned status updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };

export const getAllNotesByUser = async (req, res) => {
    console.log(req.user)
    const { user } = req.user;
    try {
      const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
      return res.json({
        error: false,
        notes,
        message: "All notes retreived!",
      });
    } catch (err) {
      res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  }

export const deleteNote = async (req, res) => {
        const noteId = req.params.noteId;
        const userId = req.user.user._id;
        console.log("noteId from req:", noteId);
        console.log("userId from token:", userId);
    try {
        const note = await Note.findOne({ _id: noteId, userId })
        console.log(note)
        if(!note) {
            return res.status(404).json({
                error:true,
                message: "Note is not found or not authorized to delete",
            })
        }

        await Note.deleteOne({_id: noteId});
        res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            err: true,
            message:"Server error"
        })

    }
}

export const searchNotes = async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ error: true, message: "Search query is required!" });
    }

    try {
      const matchingNotes = await Note.find({
        userId: user._id,
        $or: [
          { title: { $regex: new RegExp(query, "i") } },
          { content: { $regex: new RegExp(query, "i") } },
        ],
      });

      return res.json({
        error: false,
        notes: matchingNotes,
        message: "Notes matching the search query retrieved success!",
      });
    } catch (err) {
      res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  }

export const getNoteById = async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.user.user._id

    try {
      // Find the note by ID and ensure it belongs to the logged-in user
      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      return res.json({
        error: false,
        note,
        message: "Note retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching note:", error);
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };