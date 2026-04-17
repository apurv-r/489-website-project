function createCrudController(Model) {
  return {
    async list(req, res, next) {
      try {
        const items = await Model.find(req.query || {});
        res.json(items);
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const item = await Model.findById(req.params.id);
        // 404 Not Found: requested resource id does not exist.
        if (!item) {
          return res.status(404).json({ message: "Not found" });
        }
        res.json(item);
      } catch (error) {
        next(error);
      }
    },

    async sendMessage(req, res, next) {
      try {
        const { senderId, recipientId } = req.params;
        const { text } = req.body;

        const updatedSender = await Model.findByIdAndUpdate(
          senderId,
          {
            $set: { [`messages.${recipientId}.role`]: "sender" },
            $push: { [`messages.${recipientId}.messageHistory`]: text },
          },
          { returnDocument: "after", runValidators: true },
        );

        const updatedRecipient = await Model.findByIdAndUpdate(
          recipientId,
          {
            $set: { [`messages.${senderId}.role`]: "receiver" },
            $push: { [`messages.${senderId}.messageHistory`]: text },
          },
          { returnDocument: "after", runValidators: true },
        );

        if (!updatedSender || !updatedRecipient) {
          return res.status(404).json({ message: "Not found" });
        }
        res.json({ sender: updatedSender, recipient: updatedRecipient });
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const created = await Model.create(req.body);
        // 201 Created: resource was persisted successfully.
        res.status(201).json(created);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
          // Return the post-update document instead of the old one.
          returnDocument: "after",
          // Ensure schema validators still run on updates.
          runValidators: true,
        });
        // 404 Not Found: cannot update a document that doesn't exist.
        if (!updated) {
          return res.status(404).json({ message: "Not found" });
        }
        res.json(updated);
      } catch (error) {
        next(error);
      }
    },

    async remove(req, res, next) {
      try {
        const deleted = await Model.findByIdAndDelete(req.params.id);
        // 404 Not Found: nothing to delete for this id.
        if (!deleted) {
          return res.status(404).json({ message: "Not found" });
        }
        // 204 No Content: delete succeeded and returns no payload.
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCrudController;
