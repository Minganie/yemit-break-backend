const debug = require("debug")("ybbe:fights/support");
const express = require("express");
const router = express.Router({ mergeParams: true });

const auth = require("../../middleware/auth");
const Fight = require("../../models/fight");
const validate = require("../../middleware/validate");
const YbbeError = require("../../utils/YbbeError");

router.post(
  "/",
  [auth.isDm, validate.idParamIsValidMongoId],
  async (req, res, next) => {
    try {
      let fight = await Fight.findOne({ _id: req.params.id });
      if (!fight)
        return next(
          new YbbeError("Unable to find this fight.", 404, {
            id: req.params.id,
          })
        );
      if (fight.user.toString() !== req.user._id)
        return next(
          new YbbeError("This isn't your fight.", 403, { id: req.params.id })
        );
      fight.advance();
      fight = await fight.save();
      res.send(fight);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
