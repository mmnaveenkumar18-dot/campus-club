const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err.message));

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  clubName: {
    type: String,
    required: true
  },
  yearOfStudy: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  interests: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const buddySchema = new mongoose.Schema({
  buddyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  tripDuration: {
    type: String,
    required: true
  },
  interests: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const ClubMember = mongoose.model("ClubMember", memberSchema);
const TravelBuddy = mongoose.model("TravelBuddy", buddySchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


/* ==================== CAMPUS CLUB ==================== */

async function addMember(req, res) {
  try {
    const member = new ClubMember({
      memberId: String(req.body.memberId).trim(),
      name: String(req.body.name).trim(),
      clubName: String(req.body.clubName).trim(),
      yearOfStudy: Number(req.body.yearOfStudy),
      role: String(req.body.role).trim(),
      points: Number(req.body.points),
      interests: Array.isArray(req.body.interests)
        ? req.body.interests
        : String(req.body.interests)
            .split(",")
            .map(x => x.trim()),
      status: String(req.body.status).trim()
    });

    const savedMember = await member.save();

    console.log("MEMBER ADDED:", savedMember.memberId);

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: savedMember
    });

  } catch (err) {

    console.log("ADD MEMBER ERROR:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Member ID already exists. Use a different Member ID."
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

app.post("/api/members", addMember);
app.post("/api/add-member", addMember);


app.post("/api/members/sample", async (req, res) => {
  try {
    await ClubMember.deleteMany({});

    const members = await ClubMember.insertMany([
      {
        memberId: "M101",
        name: "Alice",
        clubName: "Coding Club",
        yearOfStudy: 2,
        role: "Member",
        points: 85,
        interests: ["Coding"],
        status: "Active"
      },
      {
        memberId: "M102",
        name: "Bob",
        clubName: "Coding Club",
        yearOfStudy: 3,
        role: "Lead",
        points: 150,
        interests: ["Web Development"],
        status: "Active"
      },
      {
        memberId: "M103",
        name: "Charlie",
        clubName: "Music Club",
        yearOfStudy: 1,
        role: "Member",
        points: 45,
        interests: ["Music"],
        status: "Active"
      },
      {
        memberId: "M104",
        name: "Diana",
        clubName: "Coding Club",
        yearOfStudy: 4,
        role: "Coordinator",
        points: 200,
        interests: ["Security"],
        status: "Active"
      }
    ]);

    res.json({
      success: true,
      message: "4 club members added",
      data: members
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


app.get("/api/members/search", async (req, res) => {
  try {
    const data = await ClubMember.find(
      {
        clubName: req.query.clubName,
        points: {
          $gt: Number(req.query.points)
        }
      },
      {
        name: 1,
        clubName: 1,
        role: 1,
        points: 1,
        _id: 0
      }
    );

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/members/range", async (req, res) => {
  try {
    const data = await ClubMember.find({
      points: {
        $gte: Number(req.query.min),
        $lte: Number(req.query.max)
      }
    });

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.put("/api/members/club/increase", async (req, res) => {
  try {
    const result = await ClubMember.updateMany(
      {
        clubName: req.body.clubName
      },
      {
        $inc: {
          points: Number(req.body.amount)
        }
      }
    );

    res.json({
      success: true,
      message: "Points increased successfully",
      modified: result.modifiedCount
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


app.put("/api/members/:id", async (req, res) => {
  try {
    const data = await ClubMember.findOneAndUpdate(
      {
        memberId: req.params.id
      },
      {
        role: req.body.role,
        points: Number(req.body.points)
      },
      {
        new: true
      }
    );

    res.json(
      data || {
        message: "Member not found"
      }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/members/:id", async (req, res) => {
  try {
    const data = await ClubMember.findOne(
      {
        memberId: req.params.id
      },
      {
        name: 1,
        clubName: 1,
        role: 1,
        points: 1,
        _id: 0
      }
    );

    res.json(
      data || {
        message: "Member not found"
      }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.delete("/api/members/:id", async (req, res) => {
  try {
    const data = await ClubMember.findOneAndDelete({
      memberId: req.params.id
    });

    res.json(
      data
        ? {
            success: true,
            message: "Member deleted successfully"
          }
        : {
            success: false,
            message: "Member not found"
          }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/members", async (req, res) => {
  try {
    const data = await ClubMember.find().sort({
      points: -1
    });

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


/* ==================== TRAVEL BUDDY ==================== */

async function addBuddy(req, res) {
  try {
    const buddy = new TravelBuddy({
      buddyId: String(req.body.buddyId).trim(),
      name: String(req.body.name).trim(),
      destination: String(req.body.destination).trim(),
      age: Number(req.body.age),
      budget: Number(req.body.budget),
      tripDuration: String(req.body.tripDuration).trim(),
      interests: Array.isArray(req.body.interests)
        ? req.body.interests
        : String(req.body.interests)
            .split(",")
            .map(x => x.trim()),
      status: String(req.body.status).trim()
    });

    const savedBuddy = await buddy.save();

    console.log("BUDDY ADDED:", savedBuddy.buddyId);

    res.status(201).json({
      success: true,
      message: "Travel buddy added successfully",
      data: savedBuddy
    });

  } catch (err) {

    console.log("ADD BUDDY ERROR:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Buddy ID already exists. Use a different Buddy ID."
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

app.post("/api/buddies", addBuddy);
app.post("/api/add-buddy", addBuddy);


app.post("/api/buddies/sample", async (req, res) => {
  try {
    await TravelBuddy.deleteMany({});

    const buddies = await TravelBuddy.insertMany([
      {
        buddyId: "B201",
        name: "Ethan",
        destination: "Paris",
        age: 30,
        budget: 1200,
        tripDuration: "5 Days",
        interests: ["History"],
        status: "Looking"
      },
      {
        buddyId: "B202",
        name: "Fiona",
        destination: "Tokyo",
        age: 25,
        budget: 2500,
        tripDuration: "10 Days",
        interests: ["Anime"],
        status: "Looking"
      },
      {
        buddyId: "B203",
        name: "George",
        destination: "Paris",
        age: 28,
        budget: 800,
        tripDuration: "4 Days",
        interests: ["Art"],
        status: "Confirmed"
      },
      {
        buddyId: "B204",
        name: "Hannah",
        destination: "London",
        age: 22,
        budget: 1500,
        tripDuration: "7 Days",
        interests: ["Theatre"],
        status: "Looking"
      }
    ]);

    res.json({
      success: true,
      message: "4 travel buddies added",
      data: buddies
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


app.get("/api/buddies/search", async (req, res) => {
  try {
    const data = await TravelBuddy.find(
      {
        destination: req.query.destination,
        budget: {
          $gt: Number(req.query.budget)
        }
      },
      {
        name: 1,
        destination: 1,
        budget: 1,
        tripDuration: 1,
        _id: 0
      }
    );

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/buddies/range", async (req, res) => {
  try {
    const data = await TravelBuddy.find({
      budget: {
        $gte: Number(req.query.min),
        $lte: Number(req.query.max)
      }
    });

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.put("/api/buddies/destination/increase", async (req, res) => {
  try {
    const result = await TravelBuddy.updateMany(
      {
        destination: req.body.destination
      },
      {
        $inc: {
          budget: Number(req.body.amount)
        }
      }
    );

    res.json({
      success: true,
      message: "Budget increased successfully",
      modified: result.modifiedCount
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


app.put("/api/buddies/:id", async (req, res) => {
  try {
    const data = await TravelBuddy.findOneAndUpdate(
      {
        buddyId: req.params.id
      },
      {
        destination: req.body.destination,
        budget: Number(req.body.budget)
      },
      {
        new: true
      }
    );

    res.json(
      data || {
        message: "Buddy not found"
      }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/buddies/:id", async (req, res) => {
  try {
    const data = await TravelBuddy.findOne(
      {
        buddyId: req.params.id
      },
      {
        name: 1,
        destination: 1,
        budget: 1,
        tripDuration: 1,
        _id: 0
      }
    );

    res.json(
      data || {
        message: "Buddy not found"
      }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.delete("/api/buddies/:id", async (req, res) => {
  try {
    const data = await TravelBuddy.findOneAndDelete({
      buddyId: req.params.id
    });

    res.json(
      data
        ? {
            success: true,
            message: "Travel buddy deleted successfully"
          }
        : {
            success: false,
            message: "Travel buddy not found"
          }
    );

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


app.get("/api/buddies", async (req, res) => {
  try {
    const data = await TravelBuddy.find().sort({
      budget: -1
    });

    res.json(data);

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});