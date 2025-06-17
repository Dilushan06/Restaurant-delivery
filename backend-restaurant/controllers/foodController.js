import foodModel from "../models/foodModel.js";
import extraModel from "../models/extraModel.js";
import fs from "fs";

// 🟢 Add New Food Item with Selected Extras
const addFood = async (req, res) => {
    try {
        const { name, description, price, category, extras, mandatoryOptions } = req.body;
        const image = req.file.filename;

        let extraIds = [];
        if (extras) {
            const parsedExtras = JSON.parse(extras); // 🟢 Convert from JSON string to array
            extraIds = await extraModel.find({ name: { $in: parsedExtras } }).select('_id'); // 🟢 Find ObjectIds
            extraIds = extraIds.map(extra => extra._id); // Extract IDs
        }

        let parsedMandatoryOptions = [];
        if (mandatoryOptions) {
            parsedMandatoryOptions = JSON.parse(mandatoryOptions); // 🟢 Parse JSON string
        }

        const newFood = new foodModel({
            name,
            description,
            price,
            category,
            image,
            extras: extraIds,
            mandatoryOptions: parsedMandatoryOptions // 🟢 Save to DB
        });

        await newFood.save();
        res.json({ success: true, message: "Food item added successfully!" });
    } catch (error) {
        console.error("Error adding food:", error);
        res.json({ success: false, message: "Error adding food item" });
    }
};



// 🟢 Get All Food Items with Assigned Extras
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find().populate("extras"); // 🟢 Ensure extras are populated
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error fetching food:", error);
        res.json({ success: false, message: "Error fetching food items" });
    }
};


// 🟢 Remove Food Item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (food.image) {
            fs.unlink(`uploads/foods/${food.image}`, () => {});
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food item" });
    }
};

// 🟡 Update Sold Out Status
const updateSoldOutStatus = async (req, res) => {
    try {
      const { foodId, isSoldOut } = req.body;
      await foodModel.findByIdAndUpdate(foodId, { isSoldOut });
      res.json({ success: true, message: "Sold out status updated" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error updating sold out status" });
    }
  };
  

export { addFood, listFood, removeFood, updateSoldOutStatus };
