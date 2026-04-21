const User = require("../models/user");
  
async function sendMessage(req, res, next) {
    try {
    const { senderId, recipientId } = req.params;
    const { text } = req.body;

    const message = { text, senderId };

    const updatedSender = await User.findByIdAndUpdate(
        senderId,
        {
        $set: { [`messages.${recipientId}.role`]: "sender" },
        $push: { [`messages.${recipientId}.messageHistory`]: message },
        },
        { returnDocument: "after", runValidators: true },
    );

    const updatedRecipient = await User.findByIdAndUpdate(
        recipientId,
        {
        $set: { [`messages.${senderId}.role`]: "receiver" },
        $push: { [`messages.${senderId}.messageHistory`]: message },
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
}

module.exports = {
    sendMessage,
}