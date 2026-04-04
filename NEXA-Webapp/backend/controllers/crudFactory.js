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
        if (!item) {
          return res.status(404).json({ message: "Not found" });
        }
        res.json(item);
      } catch (error) {
        next(error);
      }
    },

    async create(req, res, next) {
      try {
        const created = await Model.create(req.body);
        res.status(201).json(created);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
          returnDocument: "after",
          runValidators: true,
        });
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
        if (!deleted) {
          return res.status(404).json({ message: "Not found" });
        }
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCrudController;
