/*const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Client name is required"],
    },

    lastname: {
      type: String,
      required: true,
      default: 0,
    },

    email: {
      type: String,
      required: true,
      default: 0,
    },

    role: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;*/
/*
//all products
app.get("/api/clients", authenticateJWT, async (req, res) => {
  try {
    const client = await Client.find({});
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get single product
app.get("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/client", authenticateJWT, async (req, res) => {
  try {
    const client = await Client.create(req.body);

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update a product
app.put("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndUpdate(id, req.body);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const updatedClient = await Client.findById(id);
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete a product
app.delete("/api/client/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
